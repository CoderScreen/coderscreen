// Function-call test model — shared types and helpers.
// Used by both backend (runner, schemas, services) and frontend (authoring + candidate UIs).

export type BaseType = 'string' | 'int' | 'float' | 'bool' | 'null' | 'object';

// `TypeString` is the textual encoding of a parameter or return type.
// Recursive: array<T> where T is any other TypeString.
//   examples: 'int', 'array<string>', 'array<array<int>>'
// Stored as plain text in the DB and JSON-serialized in transport.
export type TypeString = BaseType | `array<${string}>`;

export interface Parameter {
  name: string;
  type: TypeString;
}

export interface Signature {
  functionName: string;
  parameters: Parameter[];
  returnType: TypeString;
}

const BASE_TYPES: readonly BaseType[] = ['string', 'int', 'float', 'bool', 'null', 'object'];

const ARRAY_RE = /^array<(.+)>$/;
const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function isBaseType(s: string): s is BaseType {
  return (BASE_TYPES as readonly string[]).includes(s);
}

// Returns the canonical TypeString if `s` is a valid type, else null.
// Handles nested generics by recursing into `array<...>`.
export function parseType(s: string): TypeString | null {
  if (typeof s !== 'string') return null;
  if (isBaseType(s)) return s;
  const m = s.match(ARRAY_RE);
  if (!m) return null;
  const inner = parseType(m[1]);
  if (inner === null) return null;
  return `array<${inner}>` as TypeString;
}

export function isValidIdentifier(s: string): boolean {
  return typeof s === 'string' && IDENTIFIER_RE.test(s);
}

// Languages where the harness/starter codegen is supported in v1.
export type FunctionModeLanguage = 'python' | 'javascript' | 'typescript' | 'ruby' | 'php';

// Render a TypeString in a target language's native type syntax.
// Empty string means "this language does not annotate this position" (e.g. JS, Ruby).
export function formatType(t: TypeString, lang: FunctionModeLanguage): string {
  switch (lang) {
    case 'javascript':
    case 'ruby':
      return '';
    case 'python':
      return formatPython(t);
    case 'typescript':
      return formatTypeScript(t);
    case 'php':
      return formatPhp(t);
  }
}

function formatPython(t: TypeString): string {
  switch (t) {
    case 'string':
      return 'str';
    case 'int':
      return 'int';
    case 'float':
      return 'float';
    case 'bool':
      return 'bool';
    case 'null':
      return 'None';
    case 'object':
      return 'dict';
  }
  const m = t.match(ARRAY_RE);
  if (m) return `list[${formatPython(m[1] as TypeString)}]`;
  return t;
}

function formatTypeScript(t: TypeString): string {
  switch (t) {
    case 'string':
      return 'string';
    case 'int':
    case 'float':
      return 'number';
    case 'bool':
      return 'boolean';
    case 'null':
      return 'null';
    case 'object':
      return 'Record<string, unknown>';
  }
  const m = t.match(ARRAY_RE);
  if (m) return `${formatTypeScript(m[1] as TypeString)}[]`;
  return t;
}

function formatPhp(t: TypeString): string {
  switch (t) {
    case 'string':
      return 'string';
    case 'int':
      return 'int';
    case 'float':
      return 'float';
    case 'bool':
      return 'bool';
    case 'null':
      return 'null';
    case 'object':
      return 'array';
    default:
      // PHP doesn't express element types — every array<T> is just `array`.
      return 'array';
  }
}

export type ValidationResult = { ok: true } | { ok: false; reason: string };

// Strict structural validation against a TypeString.
// Used by the API on save (test case args/expectedReturn) and by the frontend
// for inline editor feedback. JSON-shaped values only — no class instances.
export function validateValue(value: unknown, type: TypeString): ValidationResult {
  switch (type) {
    case 'string':
      return typeof value === 'string'
        ? { ok: true }
        : { ok: false, reason: `expected string, got ${describe(value)}` };
    case 'int':
      return Number.isInteger(value)
        ? { ok: true }
        : { ok: false, reason: `expected int, got ${describe(value)}` };
    case 'float':
      return typeof value === 'number' && Number.isFinite(value)
        ? { ok: true }
        : { ok: false, reason: `expected float, got ${describe(value)}` };
    case 'bool':
      return typeof value === 'boolean'
        ? { ok: true }
        : { ok: false, reason: `expected bool, got ${describe(value)}` };
    case 'null':
      return value === null
        ? { ok: true }
        : { ok: false, reason: `expected null, got ${describe(value)}` };
    case 'object':
      return isPlainObject(value)
        ? { ok: true }
        : { ok: false, reason: `expected object, got ${describe(value)}` };
  }
  const m = type.match(ARRAY_RE);
  if (m) {
    if (!Array.isArray(value)) {
      return { ok: false, reason: `expected array, got ${describe(value)}` };
    }
    const inner = m[1] as TypeString;
    for (let i = 0; i < value.length; i++) {
      const r = validateValue(value[i], inner);
      if (!r.ok) return { ok: false, reason: `at index ${i}: ${r.reason}` };
    }
    return { ok: true };
  }
  return { ok: false, reason: `unknown type ${type}` };
}

function describe(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'object') return 'object';
  return typeof v;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
