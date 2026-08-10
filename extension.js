// Aero VS Code extension: lightweight support for the Aero language.
// Syntax highlighting + language config + one-key run/build in the
// integrated terminal. No LSP by design (v0.1).
'use strict';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('aero.run', () => runAero('run')),
    vscode.commands.registerCommand('aero.build', () => runAero('build'))
  );
}

function deactivate() {}

/**
 * Resolve the aero compiler executable.
 * Priority: `aero.compilerPath` setting > AERO_HOME env var > PATH.
 */
function resolveCompiler() {
  const configured = vscode.workspace.getConfiguration('aero').get('compilerPath', '');
  if (configured) {
    return configured;
  }
  const home = process.env.AERO_HOME;
  if (home) {
    const exe = process.platform === 'win32' ? 'aero.exe' : 'aero';
    const candidates = [
      home,
      path.join(home, exe),
      path.join(home, 'bin', exe),
      path.join(home, 'target', 'debug', exe),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
  }
  return 'aero'; // fall back to PATH
}

/** Reuse a terminal with the same name, or create one. */
function getTerminal(name, cwd) {
  const existing = vscode.window.terminals.find((t) => t.name === name);
  return existing || vscode.window.createTerminal({ name, cwd });
}

function runAero(mode) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Aero: no active editor.');
    return;
  }
  const file = editor.document.uri.fsPath;
  if (path.extname(file).toLowerCase() !== '.aero') {
    vscode.window.showWarningMessage(`Aero: not an .aero file (${file}).`);
    return;
  }
  if (editor.document.isDirty) {
    editor.document.save();
  }
  const compiler = resolveCompiler();
  if (compiler !== 'aero' && !fs.existsSync(compiler)) {
    vscode.window.showErrorMessage(
      `Aero: compiler not found at "${compiler}". Set "aero.compilerPath" or AERO_HOME.`
    );
    return;
  }
  const label = mode === 'run' ? 'Run' : 'Build';
  const terminal = getTerminal(`Aero ${label}`, path.dirname(file));
  terminal.show(true);
  // The compiler writes build logs and errors (stderr) straight into the
  // integrated terminal.
  terminal.sendText(`"${compiler}" ${mode} "${file}"`, true);
}

module.exports = { activate, deactivate };
