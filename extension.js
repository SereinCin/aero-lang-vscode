// Aero LSP client — pure syntax highlighting when aero.lsp.executablePath is empty.
// When the path is configured, spawns `aero --lsp` and communicates via JSON-RPC 2.0
// over stdin/stdout (Content-Length framing). No npm dependencies.
const vscode = require('vscode');
const { spawn } = require('child_process');

let lspProcess = null;
let lspStdin = null;
let lspBuffer = '';
let lspReqId = 1;
let lspPending = null;
let lspInitialized = false;
let diagCollection = null;
let activeDocVersions = new Map(); // uri -> version

// ---------------------------------------------------------------------------
// Activation / deactivation
// ---------------------------------------------------------------------------

function activate(context) {
    diagCollection = vscode.languages.createDiagnosticCollection('aero');
    context.subscriptions.push(diagCollection);

    // Watch config changes → restart LSP
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('aero.lsp')) {
                stopLSP();
                startLSP();
            }
        })
    );

    // Track open documents
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'aero') {
                didOpenOrChange(editor.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'aero') {
                activeDocVersions.set(event.document.uri.toString(), event.document.version);
                didOpenOrChange(event.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            if (doc.languageId === 'aero') {
                didClose(doc);
            }
        })
    );

    // Start LSP on first aero file open
    startLSP();
}

function deactivate() {
    stopLSP();
}

// ---------------------------------------------------------------------------
// LSP lifecycle
// ---------------------------------------------------------------------------

function startLSP() {
    if (lspProcess) return; // already running

    const config = vscode.workspace.getConfiguration('aero');
    const exePath = config.get('lsp.executablePath', '');

    if (!exePath) {
        // No LSP path configured — pure syntax highlighting only.
        return;
    }

    try {
        lspProcess = spawn(exePath, ['--lsp'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true
        });
        lspStdin = lspProcess.stdin;

        lspBuffer = '';
        lspReqId = 1;
        lspPending = null;
        lspInitialized = false;

        lspProcess.stdout.on('data', onStdoutData);
        lspProcess.stderr.on('data', data => {
            // stderr is for logging only; never protocol messages.
            console.error('[aero-lsp]', data.toString().trimEnd());
        });
        lspProcess.on('error', err => {
            console.error('[aero-lsp] process error:', err.message);
            vscode.window.showWarningMessage(`Aero LSP: failed to start — ${err.message}`);
            cleanup();
        });
        lspProcess.on('exit', (code, signal) => {
            console.log(`[aero-lsp] exited (code=${code} signal=${signal})`);
            if (lspProcess) {
                cleanup();
                // Auto-restart after a short delay (in case of transient failure)
                setTimeout(startLSP, 3000);
            }
        });

        // Send initialize request
        sendRequest('initialize', {
            processId: process.pid,
            capabilities: {
                textDocument: {
                    synchronization: {
                        didOpen: true,
                        didChange: true,
                        didClose: true
                    }
                }
            }
        }).then(() => {
            // Send initialized notification
            sendNotification('initialized', {});
            lspInitialized = true;

            // Re-publish the currently open aero document
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'aero') {
                didOpenOrChange(editor.document);
            }
        }).catch(err => {
            console.error('[aero-lsp] initialize failed:', err);
        });

    } catch (err) {
        console.error('[aero-lsp] spawn error:', err.message);
        cleanup();
    }
}

function stopLSP() {
    if (lspProcess) {
        try {
            sendNotification('shutdown', {}).catch(() => {});
            sendNotification('exit', {}).catch(() => {});
        } catch (_) { /* ignore */ }
        cleanup();
    }
}

function cleanup() {
    lspProcess = null;
    lspStdin = null;
    lspBuffer = '';
    lspPending = null;
    lspInitialized = false;
    activeDocVersions.clear();
}

// ---------------------------------------------------------------------------
// JSON-RPC message framing
// ---------------------------------------------------------------------------

function sendRequest(method, params) {
    return new Promise((resolve, reject) => {
        if (!lspStdin) { reject(new Error('LSP not connected')); return; }
        const id = lspReqId++;
        lspPending = { id, resolve, reject };
        writeMessage({
            jsonrpc: '2.0',
            id: id,
            method: method,
            params: params
        });
    });
}

function sendNotification(method, params) {
    return new Promise((resolve, reject) => {
        if (!lspStdin) { reject(new Error('LSP not connected')); return; }
        writeMessage({
            jsonrpc: '2.0',
            method: method,
            params: params
        });
        resolve();
    });
}

function writeMessage(obj) {
    const body = JSON.stringify(obj);
    const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
    lspStdin.write(header + body);
}

function onStdoutData(chunk) {
    lspBuffer += chunk.toString();

    // Process all complete messages in buffer
    while (true) {
        const match = lspBuffer.match(/^Content-Length:\s*(\d+)\r?\n\r?\n/);
        if (!match) break;

        const headerLen = match[0].length;
        const bodyLen = parseInt(match[1], 10);

        if (lspBuffer.length < headerLen + bodyLen) break; // incomplete

        const body = lspBuffer.slice(headerLen, headerLen + bodyLen);
        lspBuffer = lspBuffer.slice(headerLen + bodyLen);

        try {
            const msg = JSON.parse(body);
            handleMessage(msg);
        } catch (e) {
            console.error('[aero-lsp] parse error:', e.message);
        }
    }
}

function handleMessage(msg) {
    // Response to a pending request
    if (msg.id !== undefined && msg.id !== null) {
        if (lspPending && lspPending.id === msg.id) {
            if (msg.error) {
                lspPending.reject(new Error(msg.error.message || 'LSP error'));
            } else {
                lspPending.resolve(msg.result);
            }
            lspPending = null;
        }
        return;
    }

    // Notification from server
    switch (msg.method) {
        case 'textDocument/publishDiagnostics':
            handleDiagnostics(msg.params);
            break;
        default:
            // Ignore unknown notifications
            break;
    }
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

function handleDiagnostics(params) {
    if (!diagCollection) return;
    const uri = vscode.Uri.parse(params.uri);
    const lspDiags = params.diagnostics || [];
    const vsDiags = lspDiags.map(d => {
        const range = new vscode.Range(
            d.range.start.line, d.range.start.character,
            d.range.end.line, d.range.end.character
        );
        const severity = d.severity === 1 ? vscode.DiagnosticSeverity.Error
                       : d.severity === 2 ? vscode.DiagnosticSeverity.Warning
                       : d.severity === 3 ? vscode.DiagnosticSeverity.Information
                       : vscode.DiagnosticSeverity.Error;
        const diag = new vscode.Diagnostic(range, d.message, severity);
        diag.source = d.source || 'aero';
        if (d.code) diag.code = d.code;
        return diag;
    });
    diagCollection.set(uri, vsDiags);
}

// ---------------------------------------------------------------------------
// Document events
// ---------------------------------------------------------------------------

function didOpenOrChange(doc) {
    if (!lspInitialized || !lspStdin) return;

    const uri = doc.uri.toString();
    const text = doc.getText();
    const prevVersion = activeDocVersions.get(uri) || 0;
    const method = prevVersion === 0 ? 'textDocument/didOpen' : 'textDocument/didChange';

    const params = {
        textDocument: {
            uri: uri,
            languageId: 'aero',
            version: prevVersion + 1
        }
    };

    if (method === 'textDocument/didOpen') {
        params.textDocument.text = text;
    } else {
        params.contentChanges = [{ text: text }];
    }

    activeDocVersions.set(uri, prevVersion + 1);
    writeMessage({ jsonrpc: '2.0', method: method, params: params });
}

function didClose(doc) {
    activeDocVersions.delete(doc.uri.toString());
    if (lspInitialized && lspStdin) {
        writeMessage({
            jsonrpc: '2.0',
            method: 'textDocument/didClose',
            params: {
                textDocument: { uri: doc.uri.toString() }
            }
        });
    }
    // Clear diagnostics for closed document
    if (diagCollection) {
        diagCollection.delete(doc.uri);
    }
}

module.exports = { activate, deactivate };