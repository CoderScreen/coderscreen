import { RiFileCopyLine } from '@remixicon/react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Tooltip } from '../components/ui/tooltip';

const apiErrorSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  message: z.string(),
});

export const handleApiError = (error: unknown, rawTitle?: string) => {
  const title = rawTitle ?? 'Something went wrong!';
  const parsed = apiErrorSchema.safeParse(error);

  let errorId: string;
  let errorMessage: string;

  if (parsed.success) {
    // Handle structured API error
    errorId = parsed.data.id;
    errorMessage = parsed.data.message;
  } else {
    // Handle regular error or unknown error
    errorId = crypto.randomUUID();
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

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
