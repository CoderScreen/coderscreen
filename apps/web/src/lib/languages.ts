export const ASSESSMENT_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'c++',
  'c',
  'bash',
  'php',
  'ruby',
] as const;

export type AssessmentLanguage = (typeof ASSESSMENT_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<AssessmentLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  'c++': 'C++',
  c: 'C',
  bash: 'Bash',
  php: 'PHP',
  ruby: 'Ruby',
};
