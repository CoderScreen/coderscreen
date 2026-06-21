import { type FunctionModeLanguage, formatType, type Signature } from '@coderscreen/common/types';

// Mirrors the backend's per-language buildStarter() functions in
// apps/api/src/sandbox/harnesses/. Used in the question authoring UI to show
// previews of the auto-generated starter code as the author edits the
// signature, and on the candidate side to compute "Reset to default" buffers
// without a server round-trip.
//
// Keep these implementations 1:1 with the backend modules. Tests in
// apps/api/.../harnesses/* are the source of truth; bugs here mean the
// candidate sees a different starter than they actually receive.
export function buildStarterForLanguage(
  signature: Signature,
  language: FunctionModeLanguage
): string {
  switch (language) {
    case 'python': {
      const params = signature.parameters
        .map((p) => `${p.name}: ${formatType(p.type, 'python')}`)
        .join(', ');
      const ret = formatType(signature.returnType, 'python');
      return `def ${signature.functionName}(${params}) -> ${ret}:\n    # your code here\n    pass\n`;
    }
    case 'javascript': {
      const params = signature.parameters.map((p) => p.name).join(', ');
      return `function ${signature.functionName}(${params}) {\n  // your code here\n}\n`;
    }
    case 'typescript': {
      const params = signature.parameters
        .map((p) => `${p.name}: ${formatType(p.type, 'typescript')}`)
        .join(', ');
      const ret = formatType(signature.returnType, 'typescript');
      return `function ${signature.functionName}(${params}): ${ret} {\n  // your code here\n}\n`;
    }
    case 'ruby': {
      const params = signature.parameters.map((p) => p.name).join(', ');
      return `def ${signature.functionName}(${params})\n  # your code here\nend\n`;
    }
    case 'php': {
      const params = signature.parameters.map((p) => `$${p.name}`).join(', ');
      return `<?php\nfunction ${signature.functionName}(${params}) {\n  // your code here\n}\n`;
    }
  }
}

export const FUNCTION_MODE_LANGUAGES: FunctionModeLanguage[] = [
  'python',
  'javascript',
  'typescript',
  'ruby',
  'php',
];

export const FUNCTION_MODE_LANGUAGE_LABEL: Record<FunctionModeLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  ruby: 'Ruby',
  php: 'PHP',
};

// True if any token in the candidate-supplied starter doesn't appear in the
// authored override. Used to flag stale overrides after the author renames
// the function or a parameter. This is a string-match heuristic — fine to be
// occasionally over-eager.
export function overrideLooksStale(
  signature: Signature,
  override: string
): boolean {
  if (!signature.functionName) return false;
  if (!override.includes(signature.functionName)) return true;
  for (const p of signature.parameters) {
    if (!p.name) continue;
    if (!override.includes(p.name)) return true;
  }
  return false;
}
