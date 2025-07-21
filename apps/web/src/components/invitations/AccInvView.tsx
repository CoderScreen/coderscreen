import { useAcceptInvitation, useInvitation } from '@/query/inv.query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { SmallHeader } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { RiCheckLine } from '@remixicon/react';

export const AcceptInvitationView = () => {
  const { invitation, isLoading } = useInvitation();
  const { acceptInvitation, isLoading: isAccepting } = useAcceptInvitation();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <div className='animate-pulse text-muted-foreground'>Loading invitation...</div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <div className='text-muted-foreground'>Invitation not found or expired.</div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center min-h-[60vh] px-2'>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <SmallHeader>Accept Invitation</SmallHeader>
          <CardTitle className='mt-2'>{invitation.organizationName}</CardTitle>
          <CardDescription>Invited by: {invitation.inviterEmail}</CardDescription>
        </CardHeader>
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
