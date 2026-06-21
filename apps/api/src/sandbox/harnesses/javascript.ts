import type { Signature } from '@coderscreen/common/types';

export function buildStarter(signature: Signature): string {
  const params = signature.parameters.map((p) => p.name).join(', ');
  return `function ${signature.functionName}(${params}) {
  // your code here
}
`;
}

export function buildHarness(signature: Signature): string {
  return `

// --- harness (auto-appended) ---
const __input = require('fs').readFileSync(0, 'utf8');
const __args = JSON.parse(__input);
process.stdout.write(JSON.stringify(${signature.functionName}(...__args)));
`;
}
