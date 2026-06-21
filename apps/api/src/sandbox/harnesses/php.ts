import type { Signature } from '@coderscreen/common/types';

export function buildStarter(signature: Signature): string {
  const params = signature.parameters.map((p) => `$${p.name}`).join(', ');
  return `<?php
function ${signature.functionName}(${params}) {
  // your code here
}
`;
}

export function buildHarness(signature: Signature): string {
  // Assumes the candidate's code opens `<?php` and does not close it. The
  // runner strips any trailing `?>` from the candidate code before appending
  // so this stays inside the open PHP block.
  const args = signature.parameters.map((_, i) => `$__args[${i}]`).join(', ');
  return `

// --- harness (auto-appended) ---
$__input = file_get_contents('php://stdin');
$__args = json_decode($__input, true);
echo json_encode(${signature.functionName}(${args}));
`;
}
