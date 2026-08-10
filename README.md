# Aero Language for VS Code

![Aero](icon.png)

Lightweight support for the [Aero](https://github.com/aero-lang/aero) programming language: syntax highlighting, language configuration, and one-key compile/run in the integrated terminal. No LSP by design — fast, minimal, hardcore.

## Features

- **File binding** — `.aero` files are recognized as Aero source.
- **Syntax highlighting** — keywords, primitive types, function identifiers, single/multi-line comments, string constants, and numeric literals get distinct colors.
- **Language configuration** — auto-indentation, quote auto-pairing, bracket matching & bracket colorization.
- **One-key compile/run** — run or build the active `.aero` file with the local Aero compiler; logs and program output go straight to the integrated terminal, compiler errors included.
- **Snippets** — blank console program template + loop skeleton.

## Requirements

- VS Code 1.85+
- The Aero compiler (`aero.exe`). The extension resolves it in this order:
  1. the `aero.compilerPath` setting,
  2. the `AERO_HOME` environment variable (pointing at the compiler binary, or at a directory containing `aero.exe` / `bin/aero.exe` / `target/debug/aero.exe`),
  3. `aero` on `PATH`.

## Usage

Open a `.aero` file, then:

| Action | Shortcut | Also available |
|---|---|---|
| Run file (`aero run <file>`) | `Ctrl+Alt+R` | title-bar / editor / explorer context menu |
| Build file (`aero build <file>`) | `Ctrl+Alt+B` | title-bar / editor / explorer context menu |

The compiler command runs in a dedicated integrated terminal (`Aero Run` / `Aero Build`). Build errors are printed there as plain text.

> `aero build <file>` produces `<file>.exe` next to the source (AOT); `aero run` executes via JIT.

## Local install (no marketplace)

Copy this folder to your extensions directory:

```
%USERPROFILE%\.vscode\extensions\serein.aero-lang-0.1.0
```

Restart VS Code. (For development, open this folder in VS Code and press `F5`.)

## Package a VSIX for the marketplace

```sh
npm i -g @vscode/vsce
vsce package
```

The resulting `aero-lang-0.1.0.vsix` can be installed with `code --install-extension` or uploaded to the VS Code Marketplace.

## Snippets

| Prefix | Content |
|---|---|
| `aero` | Blank console program template |
| `aero-loop` | While-loop skeleton |

## License

MIT
