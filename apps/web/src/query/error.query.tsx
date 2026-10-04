import { Button } from '@coderscreen/ui/button';
import { Tooltip } from '@coderscreen/ui/tooltip';
import { RiFileCopyLine } from '@remixicon/react';
import { toast } from 'sonner';
import { z } from 'zod';

const apiErrorSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  message: z.string(),
});

// Body returned by `zValidator` on the API when request validation fails (400).
const validationErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    issues: z
      .array(
        z.object({
          path: z.array(z.union([z.string(), z.number()])),
          message: z.string(),
        })
      )
      .min(1),
  }),
});

export const parseApiError = (error: unknown): { id: string; message: string } => {
  const apiError = apiErrorSchema.safeParse(error);
  if (apiError.success) {
    return { id: apiError.data.id, message: apiError.data.message };
  }

  const validationError = validationErrorSchema.safeParse(error);
  if (validationError.success) {
    const message = validationError.data.error.issues
      .map((issue) =>
        issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message
      )
      .join('; ');
    return { id: crypto.randomUUID(), message };
  }

  return {
    id: crypto.randomUUID(),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
};

export const handleApiError = (error: unknown, rawTitle?: string) => {
  const title = rawTitle ?? 'Something went wrong!';
  const { id: errorId, message: errorMessage } = parseApiError(error);

  const copyErrorDetails = () => {
    const errorDetails = {
      requestId: errorId,
      title,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  toast.error(
    <div className='flex flex-col w-full'>
      <div className='w-full flex justify-between items-center gap-2'>
        <h4 className='font-semibold text-sm leading-tight'>{title}</h4>
        <Tooltip
          triggerAsChild
          content='Copy error details'
          popoverTarget='body'
          showArrow
          className='z-[500]'
        >
          <Button
            variant='icon'
            className='h-6 w-6 p-0 hover:bg-red-400/10'
            onClick={copyErrorDetails}
          >
            <RiFileCopyLine className='h-3 w-3 text-red-500 hover:text-red-600' />
          </Button>
        </Tooltip>
      </div>
      <p className='text-sm leading-relaxed'>{errorMessage}</p>
    </div>
  );
};

export const throwApiError = async (response: Response) => {
  const error = await response.json();
  throw error;
};
