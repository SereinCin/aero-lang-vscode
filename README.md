# Aero Language for VS Code

![Aero](icon.png)

Syntax highlighting and LSP client for the [Aero](https://github.com/aero-lang/aero) programming language.

The extension provides **static syntax highlighting** out of the box. When a
compiler binary path is configured, it also spawns `aero --lsp` as a subprocess
for **real-time diagnostics** (error/warning squiggles underlining).

## Features

### Syntax highlighting (always on)
- Full Aero language grammar: keywords, types, builtins, string/char/number/boolean literals, comments, doc comments, operator coloring, function definitions & calls, type definitions, struct/enum/trait/impl names, enum variant paths, member access, and lifetime parameters.
- Language configuration: bracket matching, quote auto-pairing, comment toggling, indentation rules for all block constructs.

  | Category | Covered |
  |---|---|
  | Keywords | `let`, `fn`, `if`/`else`, `while`, `loop`, `for`/`in`, `return`, `break`, `continue`, `match`, `as`, `mut` |
  | Declarations | `struct`, `union`, `enum`, `trait`, `impl`, `type`, `dyn`, `const`, `mod`, `use`, `pub`, `crate`, `extern`, `arena`, `tensor`, `gpu` |
  | Primitive types | `i32`, `i64`, `f32`, `f64`, `char`, `bool`, `str`, `void` |
  | Standard types | `String`, `Vec`, `Box`, `Option`, `Result`, `HashMap`, `HashSet`, `BTreeMap`, `BTreeSet`, `LinkedList`, `Grad`, `Self` |
  | Builtins | `print`, `assert`, `assert_eq`, `len`, `int_to_str`, `str_to_int`, `str_contains`, `str_find`, `str_cmp`, `str_free`, `substr`, `read_file`, `write_file`, `arg_count`, `arg`, `format`, `hash_i64`, `str_hash`, `matmul`, `sum`, `tensor_add`, `blas_dot` |
  | Constructors | `Some`, `None`, `Ok`, `Err` |
  | Literals | integer & float numbers, strings with escape sequences and `%`-placeholders, char literals (`'a'`, `'\n'`), booleans |
  | Comments | `//`, `/* */` and doc comments `///`, `/** */` |
  | Structure | function definitions & calls, struct/union/enum/trait/type names, `impl` targets, enum variant paths (`Maybe::Just`), member access (`r.origin.y`), lifetime params (`'a`) |
  | Operators | `->`, `=>`, `::`, `==`, `!=`, `<=`, `>=`, `<<`, `>>`, `&&`, `\|\|`, arithmetic, bitwise (`&`, `\|`, `^`) & assignment |

### LSP diagnostics (opt-in)
When `aero.lsp.executablePath` is set, the extension:

- Spawns `aero --lsp` as a subprocess and communicates via JSON-RPC 2.0 over
  stdin/stdout (Content-Length framing).
- Performs the full LSP initialization handshake (`initialize` → `initialized`).
- Sends document text on every edit (`textDocument/didChange`).
- Receives compiler diagnostics and displays them as error/warning squiggles
  in the editor (Problems panel, inline underlines, scrollbar markers).
- Also supports hover, go-to-definition, and completion (server-side).

## Requirements

- VS Code 1.85+
- **For LSP diagnostics:** The Aero compiler binary (`aero.exe`) with `--lsp`
  support. Obtain it from the Aero project release page. The compiler is not
  bundled with this extension.

## Install

From a `.vsix` file:

```
code --install-extension aero-lang-1.1.0.vsix
```

Or copy this folder to your extensions directory and restart VS Code:

```
%USERPROFILE%\.vscode\extensions\serein.aero-lang-1.1.0
```

## Usage

1. Install the extension.
2. Open VS Code settings (`Ctrl+,`), search for `aero.lsp.executablePath`.
3. Set it to the absolute path of your `aero.exe` (e.g. `C:\Aero\bin\aero.exe`).
4. Open any `.aero` file — syntax highlighting is immediate; LSP diagnostics
   appear after the compiler process initializes (a few seconds).

If no executable path is configured, the extension provides syntax highlighting
only — no diagnostics, no LSP.

## Package a VSIX

```sh
npm i -g @vscode/vsce
vsce package
```

## License

MIT