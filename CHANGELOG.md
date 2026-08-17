# Changelog

## [1.1.0] - 2026-08-17

### Changed
- **Syntax grammar updated for Aero 1.1.0.** The `operators` pattern now
  recognizes the new bitwise/shift operators `^`, `<<` and `>>` (alongside the
  existing `&` and `|`), matching the compiler's bitwise support added in
  1.1.0.
- Version aligned with the Aero compiler 1.1.0.

## [1.0.1] - 2026-08-17

### Added
- **LSP client integration.** When `aero.lsp.executablePath` is configured, the
  extension spawns `aero --lsp` as a subprocess and communicates via JSON-RPC
  2.0 over stdin/stdout (Content-Length framing). No npm dependencies.
- **Real-time diagnostics.** The server recompiles on every edit and returns
  `textDocument/publishDiagnostics` with error/warning squiggles in VS Code.
- **LSP initialization handshake.** `initialize` → capabilities → `initialized`
  notification; the client requests full-text sync and the server returns
  its capability set (diagnostics, hover, go-to-definition, completion).
- **`aero.lsp.executablePath` setting.** Absolute path to the `aero` binary.
  When empty, the extension falls back to pure syntax highlighting.

### Changed
- Requires VS Code 1.85+ (for the `onLanguage` activation event).
- Compiler now also accepts `aero --lsp` (in addition to the existing
  `aero lsp` subcommand).

## [1.0.0] - 2026-08-17

### Changed
- **Pure syntax highlighting.** Removed the compiler integration (one-key
  run/build commands, terminal handling) and the snippet pack. The extension is
  now a dependency-free, offline highlighting package only.
- **Grammar rewritten from scratch** against the current Aero language:
  - all 25 keywords (`let`, `fn`, `match`, `struct`, `union`, `enum`, `trait`,
    `impl`, `extern`, `arena`, `tensor`, `gpu`, ...),
  - primitive types (`i32`, `i64`, `f32`, `f64`, `char`, `bool`, `str`) and
    standard types (`String`, `Vec`, `Box`, `Option`, `Result`, `HashMap`,
    `HashSet`, `BTreeMap`, `BTreeSet`, `LinkedList`, `Grad`, `Self`),
  - constructors `Some` / `None` / `Ok` / `Err`,
  - all 22 builtin functions (print, string ops, file IO, CLI args, tensor ops),
  - float & exponent numbers, char literals and lifetimes (`'a`),
  - doc comments (`///`, `/** */`) as a distinct scope,
  - function definitions & calls, type declaration names, `impl` targets,
    enum variant paths (`Maybe::Just`), member access, and operators,
  - `%`-format placeholders inside string literals.
- Language config: indentation rules now cover `loop`, `for`, `match`,
  `struct`, `union`, `enum`, `trait`, `impl`, `type`, `mod`.
- Requires VS Code 1.70+.

## [0.1.1] - 2026-08-11

- Grammar: highlight the new builtins `read_file` / `write_file` / `arg_count` / `arg`.
- Version sync with the compiler (0.1.0 -> 0.1.1).

## [0.1.0] - 2026-08-11

- Initial release: `.aero` syntax highlighting, language config (bracket
  matching, auto-pairing, indentation), snippets, and one-key run/build via
  the integrated terminal (`Ctrl+Alt+R` / `Ctrl+Alt+B` or editor-title
  buttons). Resolves the compiler via `aero.compilerPath` > `AERO_HOME` > PATH.
