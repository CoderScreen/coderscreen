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
type Question = AssessmentData['assessment']['questions'][number];

interface TakeAssessmentContextType {
  assessment: AssessmentData['assessment'] | undefined;
  submission: AssessmentData['submission'] | undefined;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  currentQuestion: Question | undefined;
  codeMap: Record<string, string>;
  setCode: (questionId: string, code: string) => void;
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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const dirtyRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeMapRef = useRef(codeMap);
  codeMapRef.current = codeMap;

  // Initialize codeMap from API response
  useEffect(() => {
    if (!data?.assessment?.questions) return;

    setCodeMap((prev) => {
      const next = { ...prev };
      for (const q of data.assessment.questions) {
        if (!(q.id in next)) {
          next[q.id] = q.questionSubmission?.code ?? q.starterCode ?? '';
        }
      }
      return next;
    });
  }, [data?.assessment?.questions]);

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

    const promises = dirty.map((questionId) =>
      saveCodeMutation({ questionId, code: codeMapRef.current[questionId] ?? '' }).catch(() => {})
    );
    await Promise.all(promises);
    for (const id of dirty) {
      dirtyRef.current.delete(id);
    }
  }, [saveCodeMutation]);

  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      flushDirty();
    }, AUTO_SAVE_DELAY);
  }, [flushDirty]);

  const setCode = useCallback(
    (questionId: string, code: string) => {
      setCodeMap((prev) => ({ ...prev, [questionId]: code }));
      dirtyRef.current.add(questionId);
      scheduleSave();
    },
    [scheduleSave]
  );

  const saveCurrentCode = useCallback(async () => {
    await flushDirty();
  }, [flushDirty]);

  // Save on question switch
  const handleSetQuestionIndex = useCallback(
    (index: number) => {
      flushDirty();
      setCurrentQuestionIndex(index);
    },
    [flushDirty]
  );

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushDirty();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushDirty]);

  const currentQuestion = useMemo(() => {
    return data?.assessment?.questions?.[currentQuestionIndex];
  }, [data?.assessment?.questions, currentQuestionIndex]);

  const value = useMemo(
    () => ({
      assessment: data?.assessment,
      submission: data?.submission,
      currentQuestionIndex,
      setCurrentQuestionIndex: handleSetQuestionIndex,
      currentQuestion,
      codeMap,
      setCode,
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
      currentQuestionIndex,
      handleSetQuestionIndex,
      currentQuestion,
      codeMap,
      setCode,
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
