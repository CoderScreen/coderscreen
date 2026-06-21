import type { Signature } from '@coderscreen/common/types';
import type { AssessmentLanguage } from '@coderscreen/db/assessment.db';
import * as javascript from './javascript';
import * as php from './php';
import * as python from './python';
import * as ruby from './ruby';
import * as typescript from './typescript';

interface HarnessModule {
  buildHarness(signature: Signature): string;
  buildStarter(signature: Signature): string;
}

// Languages with function-mode support in v1. Adding a language is two steps:
// 1. add a harness file under this directory
// 2. register it here
const HARNESSES: Partial<Record<AssessmentLanguage, HarnessModule>> = {
  python,
  javascript,
  typescript,
  ruby,
  php,
};

export function getHarness(language: AssessmentLanguage): HarnessModule | null {
  return HARNESSES[language] ?? null;
}

export function isFunctionModeLanguage(language: AssessmentLanguage): boolean {
  return language in HARNESSES;
}

// Used by getSubmissionByToken to populate `resolvedStarterCode` for the
// candidate. For each function-mode language: returns the override if set on
// the question, else the auto-generated default from the signature.
export function resolveStarterCode(
  signature: Signature,
  overrides: Partial<Record<AssessmentLanguage, string>>,
  allowedLanguages: AssessmentLanguage[]
): Partial<Record<AssessmentLanguage, string>> {
  const result: Partial<Record<AssessmentLanguage, string>> = {};
  for (const lang of allowedLanguages) {
    const harness = HARNESSES[lang];
    if (!harness) continue;
    const override = overrides[lang];
    result[lang] =
      typeof override === 'string' && override.length > 0
        ? override
        : harness.buildStarter(signature);
  }
  return result;
}

// Strip trailing PHP close tag from candidate code so the harness can be
// appended inside the still-open <?php block. No-op for non-PHP code.
export function preprocessCandidateCode(code: string, language: AssessmentLanguage): string {
  if (language === 'php') {
    return code.replace(/\?>\s*$/, '');
  }
  return code;
}
