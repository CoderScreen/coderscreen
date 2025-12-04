import { Button } from '@coderscreen/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@coderscreen/ui/card';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Skeleton } from '@coderscreen/ui/skeleton';
import { RiCheckLine, RiMailSendLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useAcceptInvitation, useInvitation } from '@/query/inv.query';

export const AcceptInvitationView = () => {
  const { invitation, isLoading } = useInvitation();
  const { acceptInvitation, isLoading: isAccepting } = useAcceptInvitation();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen px-2'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader>
            <div className='flex flex-col items-center gap-2'>
              <Skeleton className='h-10 w-10 rounded-full mb-2' />
              <Skeleton className='h-6 w-32 mb-1' />
              <Skeleton className='h-4 w-24' />
            </div>
          </CardHeader>
          <CardFooter>
            <Skeleton className='h-10 w-full rounded' />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <div className='text-muted-foreground'>Invitation not found or expired.</div>

        <Link to='/'>
          <Button variant='secondary'>Go to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center h-screen px-2'>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <div className='flex flex-col items-center gap-2'>
            <RiMailSendLine size={40} className='text-primary mb-1' />
            <SmallHeader>You've been invited!</SmallHeader>
            <CardTitle className='mt-1 text-center'>{invitation.organizationName}</CardTitle>
            <CardDescription className='text-center'>
              Invited by{' '}
              <span className='font-medium text-foreground'>{invitation.inviterEmail}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground mb-2'>
            Accept the invitation below to join this organization and start collaborating.
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-full'
            icon={RiCheckLine}
            onClick={() => acceptInvitation()}
            isLoading={isAccepting}
          >
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
