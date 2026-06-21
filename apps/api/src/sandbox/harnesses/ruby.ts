import type { Signature } from '@coderscreen/common/types';

export function buildStarter(signature: Signature): string {
  const params = signature.parameters.map((p) => p.name).join(', ');
  return `def ${signature.functionName}(${params})
  # your code here
end
`;
}

export function buildHarness(signature: Signature): string {
  return `

# --- harness (auto-appended) ---
require 'json'
__args = JSON.parse(STDIN.read)
print JSON.generate(${signature.functionName}(*__args))
`;
}
