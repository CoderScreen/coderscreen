import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Textarea } from '@coderscreen/ui/textarea';
import { RiArrowLeftLine, RiSaveLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { formatDatetime } from '@/lib/dateUtils';
import { formatSlug } from '@/lib/slug';
import { useRoom, useUpdateRoom } from '@/query/room.query';

export function InterviewerView() {
  const { data: room, isLoading, error } = useRoom();
  const { updateRoom, isLoading: isUpdating } = useUpdateRoom();
  const [finalNotes, setFinalNotes] = useState('');

  useEffect(() => {
    if (room) {
      setFinalNotes(room.notes);
    }
  }, [room]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>Loading interview summary...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>Interview not found</p>

          <Link to='/'>
            <Button variant='secondary' className='mt-4'>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    await updateRoom({
      id: room.id,
      data: {
        notes: finalNotes,
      },
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        {/* Header */}
        <div className='h-16 flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <SmallHeader>Interview Summary</SmallHeader>
          </div>

          <div className='flex items-center gap-2'>
            <Link to='/'>
              <Button variant='secondary' icon={RiArrowLeftLine}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Card */}
        <div className='bg-white rounded-lg border p-6'>
          {/* Room Details */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Interview Details</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>Title</span>
                  <span className='text-gray-900 font-medium'>{room.title}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>Language</span>
                  <div className='flex items-center gap-2'>
                    <LanguageIcon language={room.language} />
                    <span className='text-gray-900'>{formatSlug(room.language)}</span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>Created</span>
                  <span className='text-gray-900'>{formatDatetime(room.createdAt)}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>Ended</span>
                  <span className='text-gray-900'>{formatDatetime(room.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Notes */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Final Notes</h3>
            <p className='text-sm text-gray-500 mb-4'>
              Add your assessment and feedback for the candidate
            </p>

            <Textarea
              placeholder="Add your final notes about the candidate's performance, technical skills, communication, and overall assessment..."
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              rows={8}
              className='mb-4'
            />

            <div className='flex justify-end'>
              <Button
                onClick={handleSaveNotes}
                disabled={!finalNotes.trim()}
                icon={RiSaveLine}
                isLoading={isUpdating}
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
