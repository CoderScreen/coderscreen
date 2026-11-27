import { z } from 'zod';

const ANTHROPIC_MODELS = ['anthropic/claude-haiku-5.5', 'anthropic/claude-sonnet-5.5'] as const;
const OPENAI_MODELS = ['openai/gpt-6-luna', 'openai/gpt-6.2-sol'] as const;
const GOOGLE_MODELS = ['google/gemini-3.8-flash', 'google/gemini-4-hydrogen'] as const;
const DEEPSEEK_MODELS = [
  'deepseek/deepseek-v4-flash-0731',
  'deepseek/deepseek-v4.1-flash',
  'deepseek/deepseek-v4-pro-0813',
] as const;
const MOONSHOT_MODELS = ['moonshotai/kimi-k3.1-pro', 'moonshotai/kimi-k2.7-code'] as const;

export const MODEL_OPTIONS = z.enum([
  ...ANTHROPIC_MODELS,
  ...OPENAI_MODELS,
  ...GOOGLE_MODELS,
  ...DEEPSEEK_MODELS,
  ...MOONSHOT_MODELS,
]);
export type SupportedModels = z.infer<typeof MODEL_OPTIONS>;

export const DEFAULT_MODEL: SupportedModels = 'deepseek/deepseek-v4-flash-0731';

// Rooms keep their chosen model in the Yjs doc, so older rooms can hold IDs
// we no longer offer (or that OpenRouter has retired).
export const resolveModel = (model: string | undefined): SupportedModels =>
  MODEL_OPTIONS.safeParse(model).data ?? DEFAULT_MODEL;
