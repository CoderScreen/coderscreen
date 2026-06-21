import { idString } from '@coderscreen/common/id';
import { z } from 'zod';
import { AssessmentLanguageSchema } from './assessment.zod';

// === Type system shared with packages/common/src/types.ts ===
//
// TypeString is the textual encoding of a parameter or return type. Validated
// here so request bodies are rejected at the API boundary if they carry a
// malformed type (e.g. `array<>` or `tuple<int,int>`). The string-match here
// only guarantees shape; structural validation of values against types lives
// in the service layer (see validateValue() in @coderscreen/common/types).
export const TypeStringSchema = z.string().regex(/^(string|int|float|bool|null|object|array<.+>)$/);

const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const ParameterSchema = z.object({
  name: z.string().min(1).regex(IDENT_RE),
  type: TypeStringSchema,
});

export const SignatureSchema = z.object({
  functionName: z.string().min(1).regex(IDENT_RE),
  parameters: z.array(ParameterSchema).max(10),
  returnType: TypeStringSchema,
});

// Per-language starter code overrides. Each key is an AssessmentLanguage; each
// value is the override text. Missing keys mean the runner falls back to the
// auto-generated default derived from the signature.
export const StarterCodeMapSchema = z.record(AssessmentLanguageSchema, z.string());

// === Question Library ===

export const QuestionLibrarySchema = z.object({
  id: idString('questionLibrary'),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  functionName: z.string(),
  parameters: z.array(ParameterSchema),
  returnType: TypeStringSchema,
  starterCode: StarterCodeMapSchema,
  timeLimitSeconds: z.number().int().positive().nullable(),
  isPublic: z.boolean(),
  timesTaken: z.number().int().min(0),
  avgScore: z.number().min(0).max(1).nullable(),
});

export const CreateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.record(z.any()).optional().default({}),
  functionName: z.string().min(1).regex(IDENT_RE),
  parameters: z.array(ParameterSchema).max(10).optional().default([]),
  returnType: TypeStringSchema,
  starterCode: StarterCodeMapSchema.optional().default({}),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
});

export const UpdateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.record(z.any()).optional(),
  functionName: z.string().min(1).regex(IDENT_RE).optional(),
  parameters: z.array(ParameterSchema).max(10).optional(),
  returnType: TypeStringSchema.optional(),
  starterCode: StarterCodeMapSchema.optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
});

// === Question Library Test Case ===

export const QuestionLibraryTestCaseSchema = z.object({
  id: idString('questionLibraryTestCase'),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionId: idString('questionLibrary'),
  label: z.string(),
  args: z.array(z.unknown()),
  expectedReturn: z.unknown(),
  isHidden: z.boolean(),
  position: z.number().int().min(0),
});

export const CreateQuestionLibraryTestCaseSchema = z.object({
  label: z.string().optional().default(''),
  args: z.array(z.unknown()),
  expectedReturn: z.unknown(),
  isHidden: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional().default(0),
});

export const UpdateQuestionLibraryTestCaseSchema = z.object({
  label: z.string().optional(),
  args: z.array(z.unknown()).optional(),
  expectedReturn: z.unknown().optional(),
  isHidden: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// === Types ===

export type TypeStringSchema = z.infer<typeof TypeStringSchema>;
export type ParameterSchema = z.infer<typeof ParameterSchema>;
export type SignatureSchema = z.infer<typeof SignatureSchema>;
export type StarterCodeMapSchema = z.infer<typeof StarterCodeMapSchema>;
export type QuestionLibrarySchema = z.infer<typeof QuestionLibrarySchema>;
export type CreateQuestionLibrarySchema = z.infer<typeof CreateQuestionLibrarySchema>;
export type UpdateQuestionLibrarySchema = z.infer<typeof UpdateQuestionLibrarySchema>;
export type QuestionLibraryTestCaseSchema = z.infer<typeof QuestionLibraryTestCaseSchema>;
export type CreateQuestionLibraryTestCaseSchema = z.infer<
  typeof CreateQuestionLibraryTestCaseSchema
>;
export type UpdateQuestionLibraryTestCaseSchema = z.infer<
  typeof UpdateQuestionLibraryTestCaseSchema
>;
