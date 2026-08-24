export type CodeFormat =
  | "js"
  | "ts"
  | "jsx"
  | "tsx"
  | "py"
  | "html"
  | "htm"
  | "css"
  | "json"
  | "yaml"
  | "xml"
  | "sql"
  | "rust"
  | "go"
  | "cpp"
  | "c"
  | "csharp"
  | "java"
  | "swift"
  | "php"
  | "ruby"
  | "lua"
  | "r"
  | "scala"
  | "haskell"
  | "perl"
  | "cobol"
  | "fortran"
  | "ada"
  | "lisp"
  | "prolog"
  | "md"
  | "tex"
  // Lossless / Master variants (-ls)
  | "js-ls"
  | "ts-ls"
  | "jsx-ls"
  | "tsx-ls"
  | "py-ls"
  | "html-ls"
  | "htm-ls"
  | "css-ls"
  | "sql-ls"
  | "rust-ls"
  | "go-ls"
  | "cpp-ls"
  | "c-ls"
  | "csharp-ls"
  | "java-ls"
  | "swift-ls"
  | "php-ls"
  | "ruby-ls"
  | "lua-ls"
  | "r-ls"
  | "scala-ls"
  | "haskell-ls"
  | "perl-ls"
  | "cobol-ls"
  | "fortran-ls"
  | "ada-ls"
  | "lisp-ls"
  | "prolog-ls";

export interface CodeFormatInfo {
  id: CodeFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "web" | "systems" | "data" | "scripts" | "classic";
  description: string;
  supportsMinify: boolean;
  isLossless?: boolean;
}

export const CODE_FORMATS: Record<CodeFormat, CodeFormatInfo> = {
  ts: {
    id: "ts",
    label: "TypeScript (.ts)",
    extension: "ts",
    mimeType: "application/typescript",
    category: "web",
    description: "Typed JavaScript programming language",
    supportsMinify: true,
    isLossless: true,
  },
  js: {
    id: "js",
    label: "JavaScript (.js)",
    extension: "js",
    mimeType: "application/javascript",
    category: "web",
    description: "ECMAScript programming language for web and node.js",
    supportsMinify: true,
    isLossless: true,
  },
  tsx: {
    id: "tsx",
    label: "React TypeScript (.tsx)",
    extension: "tsx",
    mimeType: "text/typescript-jsx",
    category: "web",
    description: "React JSX syntax with strict TypeScript types",
    supportsMinify: false,
    isLossless: true,
  },
  jsx: {
    id: "jsx",
    label: "React JSX (.jsx)",
    extension: "jsx",
    mimeType: "text/jsx",
    category: "web",
    description: "React JavaScript XML component syntax",
    supportsMinify: false,
    isLossless: true,
  },
  html: {
    id: "html",
    label: "HTML5 (.html)",
    extension: "html",
    mimeType: "text/html",
    category: "web",
    description: "HyperText Markup Language 5 standard",
    supportsMinify: true,
    isLossless: true,
  },
  htm: {
    id: "htm",
    label: "HTML (.htm)",
    extension: "htm",
    mimeType: "text/html",
    category: "web",
    description: "Standard HTML 3-letter extension document",
    supportsMinify: true,
    isLossless: true,
  },
  css: {
    id: "css",
    label: "CSS3 (.css)",
    extension: "css",
    mimeType: "text/css",
    category: "web",
    description: "Cascading Style Sheets 3 stylesheet",
    supportsMinify: true,
    isLossless: true,
  },
  json: {
    id: "json",
    label: "JSON (.json)",
    extension: "json",
    mimeType: "application/json",
    category: "data",
    description: "JavaScript Object Notation data interchange format",
    supportsMinify: true,
    isLossless: true,
  },
  yaml: {
    id: "yaml",
    label: "YAML (.yaml)",
    extension: "yaml",
    mimeType: "text/yaml",
    category: "data",
    description: "Human-friendly data serialization language",
    supportsMinify: false,
    isLossless: true,
  },
  xml: {
    id: "xml",
    label: "XML (.xml)",
    extension: "xml",
    mimeType: "application/xml",
    category: "data",
    description: "Extensible Markup Language data document",
    supportsMinify: true,
    isLossless: true,
  },
  sql: {
    id: "sql",
    label: "SQL (.sql)",
    extension: "sql",
    mimeType: "application/sql",
    category: "data",
    description: "Structured Query Language relational database script",
    supportsMinify: true,
    isLossless: true,
  },
  py: {
    id: "py",
    label: "Python (.py)",
    extension: "py",
    mimeType: "text/x-python",
    category: "scripts",
    description: "Python 3 source code script",
    supportsMinify: false,
    isLossless: true,
  },
  rust: {
    id: "rust",
    label: "Rust (.rs)",
    extension: "rs",
    mimeType: "text/rust",
    category: "systems",
    description: "Rust memory-safe systems programming language",
    supportsMinify: true,
    isLossless: true,
  },
  go: {
    id: "go",
    label: "Go (.go)",
    extension: "go",
    mimeType: "text/x-go",
    category: "systems",
    description: "Go concurrency-first systems language",
    supportsMinify: true,
    isLossless: true,
  },
  cpp: {
    id: "cpp",
    label: "C++ (.cpp)",
    extension: "cpp",
    mimeType: "text/x-c++src",
    category: "systems",
    description: "C++ ISO standard source code",
    supportsMinify: true,
    isLossless: true,
  },
  c: {
    id: "c",
    label: "C (.c)",
    extension: "c",
    mimeType: "text/x-csrc",
    category: "systems",
    description: "ANSI C programming language source code",
    supportsMinify: true,
    isLossless: true,
  },
  csharp: {
    id: "csharp",
    label: "C# (.cs)",
    extension: "cs",
    mimeType: "text/x-csharp",
    category: "systems",
    description: "Microsoft C# .NET source code",
    supportsMinify: true,
    isLossless: true,
  },
  java: {
    id: "java",
    label: "Java (.java)",
    extension: "java",
    mimeType: "text/x-java-source",
    category: "systems",
    description: "Java object-oriented language source code",
    supportsMinify: true,
    isLossless: true,
  },
  swift: {
    id: "swift",
    label: "Swift (.swift)",
    extension: "swift",
    mimeType: "text/x-swift",
    category: "systems",
    description: "Apple Swift modern systems language",
    supportsMinify: true,
    isLossless: true,
  },
  php: {
    id: "php",
    label: "PHP (.php)",
    extension: "php",
    mimeType: "application/x-httpd-php",
    category: "web",
    description: "PHP hypertext preprocessor script",
    supportsMinify: true,
    isLossless: true,
  },
  ruby: {
    id: "ruby",
    label: "Ruby (.rb)",
    extension: "rb",
    mimeType: "text/x-ruby",
    category: "scripts",
    description: "Ruby dynamic programming language script",
    supportsMinify: false,
    isLossless: true,
  },
  lua: {
    id: "lua",
    label: "Lua (.lua)",
    extension: "lua",
    mimeType: "text/x-lua",
    category: "scripts",
    description: "Lua lightweight embeddable scripting language",
    supportsMinify: true,
    isLossless: true,
  },
  r: {
    id: "r",
    label: "R Language (.r)",
    extension: "r",
    mimeType: "text/x-r",
    category: "scripts",
    description: "R statistical computing language",
    supportsMinify: false,
    isLossless: true,
  },
  scala: {
    id: "scala",
    label: "Scala (.scala)",
    extension: "scala",
    mimeType: "text/x-scala",
    category: "systems",
    description: "Scala functional and object-oriented language",
    supportsMinify: true,
    isLossless: true,
  },
  haskell: {
    id: "haskell",
    label: "Haskell (.hs)",
    extension: "hs",
    mimeType: "text/x-haskell",
    category: "systems",
    description: "Haskell pure functional programming language",
    supportsMinify: false,
    isLossless: true,
  },
  perl: {
    id: "perl",
    label: "Perl (.pl)",
    extension: "pl",
    mimeType: "text/x-perl",
    category: "scripts",
    description: "Perl text processing language",
    supportsMinify: false,
    isLossless: true,
  },
  cobol: {
    id: "cobol",
    label: "COBOL (.cbl)",
    extension: "cbl",
    mimeType: "text/x-cobol",
    category: "classic",
    description: "Common Business-Oriented Language mainframe code",
    supportsMinify: false,
    isLossless: true,
  },
  fortran: {
    id: "fortran",
    label: "Fortran (.f90)",
    extension: "f90",
    mimeType: "text/x-fortran",
    category: "classic",
    description: "Formula Translation scientific computing language",
    supportsMinify: false,
    isLossless: true,
  },
  ada: {
    id: "ada",
    label: "Ada (.adb)",
    extension: "adb",
    mimeType: "text/x-ada",
    category: "classic",
    description: "Ada high-integrity safety-critical language",
    supportsMinify: false,
    isLossless: true,
  },
  lisp: {
    id: "lisp",
    label: "Lisp (.lisp)",
    extension: "lisp",
    mimeType: "text/x-lisp",
    category: "classic",
    description: "Lisp symbolic expression language",
    supportsMinify: false,
    isLossless: true,
  },
  prolog: {
    id: "prolog",
    label: "Prolog (.pl)",
    extension: "pro",
    mimeType: "text/x-prolog",
    category: "classic",
    description: "Prolog logic programming language",
    supportsMinify: false,
    isLossless: true,
  },
  md: {
    id: "md",
    label: "Markdown (.md)",
    extension: "md",
    mimeType: "text/markdown",
    category: "web",
    description: "Lightweight markup language with plain text formatting",
    supportsMinify: false,
    isLossless: true,
  },
  tex: {
    id: "tex",
    label: "LaTeX (.tex)",
    extension: "tex",
    mimeType: "application/x-tex",
    category: "classic",
    description: "LaTeX academic typesetting markup language",
    supportsMinify: false,
    isLossless: true,
  },

  // Lossless presets (-ls)
  "ts-ls": {
    id: "ts-ls",
    label: "TypeScript Clean & Formatted",
    extension: "ts",
    mimeType: "application/typescript",
    category: "web",
    description: "Formatted TypeScript with normalized spacing and semicolons",
    supportsMinify: true,
    isLossless: true,
  },
  "js-ls": {
    id: "js-ls",
    label: "JavaScript ESNext Clean",
    extension: "js",
    mimeType: "application/javascript",
    category: "web",
    description: "Standardized JavaScript source code",
    supportsMinify: true,
    isLossless: true,
  },
  "jsx-ls": {
    id: "jsx-ls",
    label: "JSX Master Code",
    extension: "jsx",
    mimeType: "text/jsx",
    category: "web",
    description: "Formatted React JSX component template",
    supportsMinify: false,
    isLossless: true,
  },
  "tsx-ls": {
    id: "tsx-ls",
    label: "TSX Master Code",
    extension: "tsx",
    mimeType: "text/typescript-jsx",
    category: "web",
    description: "Formatted TypeScript JSX component template",
    supportsMinify: false,
    isLossless: true,
  },
  "py-ls": {
    id: "py-ls",
    label: "Python PEP8 Formatted",
    extension: "py",
    mimeType: "text/x-python",
    category: "scripts",
    description: "PEP8 4-space aligned Python source code",
    supportsMinify: false,
    isLossless: true,
  },
  "html-ls": {
    id: "html-ls",
    label: "HTML5 W3C Validated",
    extension: "html",
    mimeType: "text/html",
    category: "web",
    description: "Clean semantic HTML5 structure",
    supportsMinify: true,
    isLossless: true,
  },
  "htm-ls": {
    id: "htm-ls",
    label: "HTM Formatted",
    extension: "htm",
    mimeType: "text/html",
    category: "web",
    description: "Formatted HTM document",
    supportsMinify: true,
    isLossless: true,
  },
  "css-ls": {
    id: "css-ls",
    label: "CSS Modern Clean",
    extension: "css",
    mimeType: "text/css",
    category: "web",
    description: "Indented CSS3 ruleset with sorted properties",
    supportsMinify: true,
    isLossless: true,
  },
  "sql-ls": {
    id: "sql-ls",
    label: "SQL ANSI Standard",
    extension: "sql",
    mimeType: "application/sql",
    category: "data",
    description: "Uppercase SQL keywords with formatted clauses",
    supportsMinify: true,
    isLossless: true,
  },
  "rust-ls": {
    id: "rust-ls",
    label: "Rust rustfmt Clean",
    extension: "rs",
    mimeType: "text/rust",
    category: "systems",
    description: "rustfmt standardized Rust source file",
    supportsMinify: true,
    isLossless: true,
  },
  "go-ls": {
    id: "go-ls",
    label: "Go gofmt Clean",
    extension: "go",
    mimeType: "text/x-go",
    category: "systems",
    description: "gofmt tab-aligned Go source file",
    supportsMinify: true,
    isLossless: true,
  },
  "cpp-ls": {
    id: "cpp-ls",
    label: "C++ Clang Formatted",
    extension: "cpp",
    mimeType: "text/x-c++src",
    category: "systems",
    description: "Clang-format standard C++ code",
    supportsMinify: true,
    isLossless: true,
  },
  "c-ls": {
    id: "c-ls",
    label: "C GNU Formatted",
    extension: "c",
    mimeType: "text/x-csrc",
    category: "systems",
    description: "GNU standard C source file",
    supportsMinify: true,
    isLossless: true,
  },
  "csharp-ls": {
    id: "csharp-ls",
    label: "C# Roslyn Clean",
    extension: "cs",
    mimeType: "text/x-csharp",
    category: "systems",
    description: "Roslyn formatted C# source file",
    supportsMinify: true,
    isLossless: true,
  },
  "java-ls": {
    id: "java-ls",
    label: "Java Google Style",
    extension: "java",
    mimeType: "text/x-java-source",
    category: "systems",
    description: "Google Java style formatted source code",
    supportsMinify: true,
    isLossless: true,
  },
  "swift-ls": {
    id: "swift-ls",
    label: "Swift swift-format Clean",
    extension: "swift",
    mimeType: "text/x-swift",
    category: "systems",
    description: "Apple swift-format clean source file",
    supportsMinify: true,
    isLossless: true,
  },
  "php-ls": {
    id: "php-ls",
    label: "PHP PSR-12 Clean",
    extension: "php",
    mimeType: "application/x-httpd-php",
    category: "web",
    description: "PSR-12 coding standard formatted PHP code",
    supportsMinify: true,
    isLossless: true,
  },
  "ruby-ls": {
    id: "ruby-ls",
    label: "Ruby RuboCop Clean",
    extension: "rb",
    mimeType: "text/x-ruby",
    category: "scripts",
    description: "RuboCop compliant Ruby script",
    supportsMinify: false,
    isLossless: true,
  },
  "lua-ls": {
    id: "lua-ls",
    label: "Lua Clean Formatted",
    extension: "lua",
    mimeType: "text/x-lua",
    category: "scripts",
    description: "Formatted Lua source script",
    supportsMinify: true,
    isLossless: true,
  },
  "r-ls": {
    id: "r-ls",
    label: "R styler Clean",
    extension: "r",
    mimeType: "text/x-r",
    category: "scripts",
    description: "Tidyverse styler compliant R script",
    supportsMinify: false,
    isLossless: true,
  },
  "scala-ls": {
    id: "scala-ls",
    label: "Scala scalafmt Clean",
    extension: "scala",
    mimeType: "text/x-scala",
    category: "systems",
    description: "scalafmt formatted Scala source file",
    supportsMinify: true,
    isLossless: true,
  },
  "haskell-ls": {
    id: "haskell-ls",
    label: "Haskell ormolu Clean",
    extension: "hs",
    mimeType: "text/x-haskell",
    category: "systems",
    description: "ormolu formatted Haskell source file",
    supportsMinify: false,
    isLossless: true,
  },
  "perl-ls": {
    id: "perl-ls",
    label: "Perl perltidy Clean",
    extension: "pl",
    mimeType: "text/x-perl",
    category: "scripts",
    description: "perltidy formatted Perl code",
    supportsMinify: false,
    isLossless: true,
  },
  "cobol-ls": {
    id: "cobol-ls",
    label: "COBOL Strict Column Format",
    extension: "cbl",
    mimeType: "text/x-cobol",
    category: "classic",
    description: "COBOL standard 80-column alignment",
    supportsMinify: false,
    isLossless: true,
  },
  "fortran-ls": {
    id: "fortran-ls",
    label: "Fortran Free Form Clean",
    extension: "f90",
    mimeType: "text/x-fortran",
    category: "classic",
    description: "Modern free-form Fortran 90/95 code",
    supportsMinify: false,
    isLossless: true,
  },
  "ada-ls": {
    id: "ada-ls",
    label: "Ada GNAT Clean",
    extension: "adb",
    mimeType: "text/x-ada",
    category: "classic",
    description: "GNAT formatted Ada specification",
    supportsMinify: false,
    isLossless: true,
  },
  "lisp-ls": {
    id: "lisp-ls",
    label: "Lisp Pretty Printed",
    extension: "lisp",
    mimeType: "text/x-lisp",
    category: "classic",
    description: "Pretty-printed Common Lisp S-expressions",
    supportsMinify: false,
    isLossless: true,
  },
  "prolog-ls": {
    id: "prolog-ls",
    label: "Prolog ISO Formatted",
    extension: "pro",
    mimeType: "text/x-prolog",
    category: "classic",
    description: "ISO standard formatted Prolog rules and queries",
    supportsMinify: false,
    isLossless: true,
  },
};

export const CODE_EXTENSIONS: Record<string, CodeFormat> = {
  ts: "ts",
  js: "js",
  mjs: "js",
  cjs: "js",
  tsx: "tsx",
  jsx: "jsx",
  html: "html",
  htm: "htm",
  css: "css",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  sql: "sql",
  py: "py",
  pyw: "py",
  rs: "rust",
  go: "go",
  cpp: "cpp",
  cxx: "cpp",
  cc: "cpp",
  h: "c",
  hpp: "cpp",
  c: "c",
  cs: "csharp",
  java: "java",
  swift: "swift",
  php: "php",
  rb: "ruby",
  lua: "lua",
  r: "r",
  scala: "scala",
  hs: "haskell",
  pl: "perl",
  pm: "perl",
  cbl: "cobol",
  cob: "cobol",
  f90: "fortran",
  f95: "fortran",
  f: "fortran",
  adb: "ada",
  ads: "ada",
  lisp: "lisp",
  lsp: "lisp",
  pro: "prolog",
  md: "md",
  markdown: "md",
  tex: "tex",
};

export function detectCodeFormat(file: File): CodeFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  if (CODE_EXTENSIONS[ext]) {
    return CODE_EXTENSIONS[ext];
  }

  const type = file.type.toLowerCase();
  if (type.includes("javascript")) return "js";
  if (type.includes("typescript")) return "ts";
  if (type.includes("json")) return "json";
  if (type.includes("html")) return "html";
  if (type.includes("css")) return "css";
  if (type.includes("xml")) return "xml";

  return null;
}

export function isCodeFile(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return Boolean(CODE_EXTENSIONS[ext]);
}
