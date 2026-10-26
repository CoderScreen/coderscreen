// Mirrors the checks in AssessmentService.publishAssessment so the header can
// say what's missing instead of waiting for the API to reject the publish.
export const getPublishBlockers = (
  questions: { title: string; testCases?: unknown[] }[] | undefined
): string[] => {
  if (!questions || questions.length === 0) {
    return ['Add at least one question'];
  }
  return questions
    .filter((q) => (q.testCases?.length ?? 0) === 0)
    .map((q) => `Add a test case to "${q.title}"`);
};
