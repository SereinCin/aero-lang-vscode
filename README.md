# Aero Language Extension for VS Code

Syntax highlighting and language server client for the
[Aero](https://github.com/SereinCin/aero-lang) programming language.

## Features

- Syntax highlighting for `.aero` files: keywords, primitive and standard types,
  literals, operators, comments, `impl` targets and enum variant paths.
- Bracket matching, quote auto-pairing, comment toggling and indentation rules.
- Optional compiler diagnostics through `aero --lsp`: error and warning
  squiggles in the editor, plus hover, go-to-definition and completion.

The compiler is not bundled with the extension. Set `aero.lsp.executablePath`
to an `aero.exe` built from 1.2.1 or newer to turn the language server on;
leave it empty for syntax highlighting only.

## Installation

The extension is published on the VS Code Marketplace, and a `.vsix` file is
also provided for offline installs. Pick either route.

### From the VS Code Marketplace (online)

Open the Extensions view (`Ctrl+Shift+X`), search for **Aero Language** and
click **Install**. Or from a terminal:

```
code --install-extension serein.aero-lang
```

Marketplace page:
<https://marketplace.visualstudio.com/items?itemName=serein.aero-lang>

### From a `.vsix` file (offline)

1. Download the `.vsix` for your Aero version from the folder listed under
   [Versioning](#versioning) below.
2. Open VS Code and press `Ctrl+Shift+X` to open the Extensions view.
3. Drag and drop the `.vsix` file into the Extensions view, or run
   `code --install-extension <file>.vsix`.

## Versioning

Each Aero release has its own `.vsix`, so pick the folder that matches your
Aero version:

- `VS Code Extension 1.2.x/` — packages compatible with the Aero **1.2.x**
  series
- `VS Code Extension 1.1.x/` — packages compatible with the Aero **1.1.x**
  series

## License

This project is licensed under the [MIT License](LICENSE).
