import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useCandidateAssessment,
  useSaveCode,
  useSubmitAssessment,
} from '@/query/candidateAssessment.query';

type AssessmentData = NonNullable<ReturnType<typeof useCandidateAssessment>['data']>;

// Per-language code buffer. Keyed by questionId then language. Initialized
// lazily — entries for languages the candidate hasn't visited stay missing and
// fall back to the question's resolvedStarterCode at read time.
type CodeBuffers = Record<string, Record<string, string>>;

interface TakeAssessmentContextType {
  assessment: AssessmentData['assessment'] | undefined;
  submission: AssessmentData['submission'] | undefined;
  // Returns the candidate's current draft for (questionId, currently selected
  // language), falling back to the resolved starter for that language.
  getCode: (questionId: string) => string;
  setCode: (questionId: string, code: string) => void;
  // Resets the buffer for (questionId, currently selected language) back to
  // the resolved starter.
  resetCodeToStarter: (questionId: string) => void;
  timeRemainingMs: number | null;
  isExpired: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  subId: string;
  token: string;
  saveCurrentCode: () => Promise<void>;
}

const TakeAssessmentContext = createContext<TakeAssessmentContextType | undefined>(undefined);

interface TakeAssessmentProviderProps {
  subId: string;
  token: string;
  children: ReactNode;
}

const AUTO_SAVE_DELAY = 3000;

export const TakeAssessmentProvider: React.FC<TakeAssessmentProviderProps> = ({
  subId,
  token,
  children,
}) => {
  const { data, isLoading, isError, error, refetch } = useCandidateAssessment(subId, token);
  const { saveCode: saveCodeMutation, isSaving } = useSaveCode(subId, token);
  const { submitAssessment } = useSubmitAssessment(subId, token);

  const [codeBuffers, setCodeBuffers] = useState<CodeBuffers>({});
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const selectedLanguage = data?.submission?.selectedLanguage ?? '';

  // Dirty set keyed as `${questionId}::${language}` — auto-save only flushes
  // entries that are still dirty.
  const dirtyRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeBuffersRef = useRef(codeBuffers);
  codeBuffersRef.current = codeBuffers;

  // Seed each question's buffer for the currently selected language using the
  // server-side state: persisted code if any, else the resolved starter.
  useEffect(() => {
    if (!data?.assessment?.questions || !selectedLanguage) return;

    setCodeBuffers((prev) => {
      let changed = false;
      const next: CodeBuffers = { ...prev };
      for (const q of data.assessment.questions) {
        const existing = next[q.id] ?? {};
        if (existing[selectedLanguage] !== undefined) continue;
        const starter =
          (q as { resolvedStarterCode?: Record<string, string> }).resolvedStarterCode?.[
            selectedLanguage
          ] ?? '';
        // The draft questionSubmission row is pre-created at invite time with
        // an empty `code`, so an empty string means "nothing written yet" —
        // fall back to the resolved starter rather than seeding a blank editor.
        const savedCode = q.questionSubmission?.code;
        const seed = savedCode && savedCode.length > 0 ? savedCode : starter;
        next[q.id] = { ...existing, [selectedLanguage]: seed };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [data?.assessment?.questions, selectedLanguage]);

  // Timer logic
  useEffect(() => {
    if (!data?.submission?.expiresAt) {
      setTimeRemainingMs(null);
      return;
    }

    if (data.submission.status !== 'in_progress') return;

    const expiresAt = new Date(data.submission.expiresAt).getTime();

    const tick = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeRemainingMs(0);
        setIsExpired(true);
      } else {
        setTimeRemainingMs(remaining);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.submission?.expiresAt, data?.submission?.status]);

  // On expiration: save + submit
  useEffect(() => {
    if (!isExpired) return;

    const handleExpire = async () => {
      try {
        await flushDirty();
        await submitAssessment();
      } catch {
        // Server will also expire it
      }
      refetch();
    };

    handleExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  const flushDirty = useCallback(async () => {
    const dirty = Array.from(dirtyRef.current);
    if (dirty.length === 0) return;

    const promises = dirty.map((key) => {
      const [questionId, lang] = key.split('::');
      const code = codeBuffersRef.current[questionId]?.[lang] ?? '';
      return saveCodeMutation({
        questionId: questionId as `aq_${string}`,
        code,
      }).catch(() => {});
    });
    await Promise.all(promises);
    for (const k of dirty) dirtyRef.current.delete(k);
  }, [saveCodeMutation]);

  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      flushDirty();
    }, AUTO_SAVE_DELAY);
  }, [flushDirty]);

  const getCode = useCallback(
    (questionId: string) => {
      if (!selectedLanguage) return '';
      const buffer = codeBuffers[questionId]?.[selectedLanguage];
      if (buffer !== undefined) return buffer;
      const q = data?.assessment?.questions.find((x) => x.id === questionId);
      const starter =
        (q as { resolvedStarterCode?: Record<string, string> } | undefined)?.resolvedStarterCode?.[
          selectedLanguage
        ] ?? '';
      return starter;
    },
    [codeBuffers, selectedLanguage, data?.assessment?.questions]
  );

  const setCode = useCallback(
    (questionId: string, code: string) => {
      if (!selectedLanguage) return;
      setCodeBuffers((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] ?? {}), [selectedLanguage]: code },
      }));
      dirtyRef.current.add(`${questionId}::${selectedLanguage}`);
      scheduleSave();
    },
    [scheduleSave, selectedLanguage]
  );

  const resetCodeToStarter = useCallback(
    (questionId: string) => {
      if (!selectedLanguage) return;
      const q = data?.assessment?.questions.find((x) => x.id === questionId);
      const starter =
        (q as { resolvedStarterCode?: Record<string, string> } | undefined)?.resolvedStarterCode?.[
          selectedLanguage
        ] ?? '';
      setCodeBuffers((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] ?? {}), [selectedLanguage]: starter },
      }));
      dirtyRef.current.add(`${questionId}::${selectedLanguage}`);
      scheduleSave();
    },
    [data?.assessment?.questions, scheduleSave, selectedLanguage]
  );

  const saveCurrentCode = useCallback(async () => {
    await flushDirty();
  }, [flushDirty]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushDirty();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushDirty]);

  const value = useMemo(
    () => ({
      assessment: data?.assessment,
      submission: data?.submission,
      getCode,
      setCode,
      resetCodeToStarter,
      timeRemainingMs,
      isExpired,
      isSaving,
      isLoading,
      isError,
      error,
      refetch,
      subId,
      token,
      saveCurrentCode,
    }),
    [
      data,
      getCode,
      setCode,
      resetCodeToStarter,
      timeRemainingMs,
      isExpired,
      isSaving,
      isLoading,
      isError,
      error,
      refetch,
      subId,
      token,
      saveCurrentCode,
    ]
  );

  return (
    <TakeAssessmentContext.Provider value={value}>{children}</TakeAssessmentContext.Provider>
  );
};

export const useTakeAssessment = () => {
  const context = useContext(TakeAssessmentContext);
  if (context === undefined) {
    throw new Error('useTakeAssessment must be used within a TakeAssessmentProvider');
  }
  return context;
};
