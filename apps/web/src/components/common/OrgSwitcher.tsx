import { Skeleton } from '@coderscreen/ui/skeleton';
import { OrgAvatar } from '@/components/common/UserAvatar';
import { useActiveOrg } from '@/query/org.query';

export const OrgSwitcher = () => {
  const { org, isLoading } = useActiveOrg();

  return (
    <div className='px-2 pt-4'>
      <div className='flex items-center gap-2 rounded-lg py-1.5 px-2'>
        {isLoading || !org ? (
          <div className='flex items-center gap-2 w-full'>
            <Skeleton className='h-8 w-8 rounded-lg' />
            <Skeleton className='h-4 w-24' />
          </div>
        ) : (
          <>
            <div className='flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center'>
              <OrgAvatar org={org} />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{org.name}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
