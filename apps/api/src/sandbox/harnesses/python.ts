import { formatType, type Signature } from '@coderscreen/common/types';

export function buildStarter(signature: Signature): string {
  const params = signature.parameters
    .map((p) => `${p.name}: ${formatType(p.type, 'python')}`)
    .join(', ');
  const ret = formatType(signature.returnType, 'python');
  return `def ${signature.functionName}(${params}) -> ${ret}:
    # your code here
    pass
`;
}

export function buildHarness(signature: Signature): string {
  return `

# --- harness (auto-appended) ---
import json as __json, sys as __sys
__args = __json.loads(__sys.stdin.read())
print(__json.dumps(${signature.functionName}(*__args)))
`;
}
