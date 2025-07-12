import { z } from 'zod';

const ANTHROPIC_MODELS = ['anthropic/claude-3.7-sonnet', 'anthropic/claude-sonnet-4'] as const;
const OPENAI_MODELS = ['openai/gpt-4.1-mini', 'openai/gpt-4o'] as const;
const GOOGLE_MODELS = ['google/gemini-2.5-flash', 'google/gemini-2.5-pro'] as const;
const OTHER_MODELS = ['deepseek/deepseek-chat-v3-0324'] as const;

export const MODEL_OPTIONS = z.enum([
  ...ANTHROPIC_MODELS,
  ...OPENAI_MODELS,
  ...GOOGLE_MODELS,
  ...OTHER_MODELS,
]);
export type SupportedModels = z.infer<typeof MODEL_OPTIONS>;
