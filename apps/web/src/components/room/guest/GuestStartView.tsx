import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { Card, CardContent, CardHeader } from '@coderscreen/ui/card';
import { Divider } from '@coderscreen/ui/divider';
import { LargeHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { Skeleton } from '@coderscreen/ui/skeleton';
import {
  RiArchiveLine,
  RiArrowRightLine,
  RiCheckLine,
  RiLoginBoxLine,
  RiTimeLine,
  RiUserLine,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { formatSlug } from '@/lib/slug';
import { cn } from '@/lib/utils';
import { usePublicRoom } from '@/query/publicRoom.query';

interface GuestStartViewProps {
  onJoinAsGuest: (name: string, email: string) => void;
  isLoading?: boolean;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
      return {
        icon: RiCheckLine,
        color: 'bg-green-100 text-green-800 border-green-200',
        message: 'This interview is currently active and ready for participants.',
        canJoin: true,
      };
    case 'scheduled':
      return {
        icon: RiTimeLine,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        message:
          'This interview is scheduled but not yet active. Please wait for the host to start the session.',
        canJoin: false,
      };
    case 'completed':
      return {
        icon: RiCheckLine,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        message: 'This interview has been completed and is no longer accepting participants.',
        canJoin: false,
      };
    case 'archived':
      return {
        icon: RiArchiveLine,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        message: 'This interview has been archived and is no longer accessible.',
        canJoin: false,
      };
    default:
      return {
        icon: RiTimeLine,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        message: 'This interview is not currently active.',
        canJoin: false,
      };
  }
};

export const GuestStartView = ({ onJoinAsGuest, isLoading = false }: GuestStartViewProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { publicRoom, isLoading: isRoomLoading } = usePublicRoom();

  const handleJoinAsGuest = () => {
    if (!name.trim()) {
      return;
    }
    onJoinAsGuest(name.trim(), email.trim());
  };

  const isFormValid = name.trim().length > 0;
  const statusInfo = publicRoom ? getStatusInfo(publicRoom.status) : null;
  const canJoin = statusInfo?.canJoin && isFormValid;

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-white px-4 py-16'>
      <div className='w-full max-w-md'>
        <Card className='shadow-lg border-gray-200'>
          <CardHeader className='text-center pb-4'>
            <div className='w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4'>
              <RiUserLine className='text-white size-6' />
            </div>
            <LargeHeader className='text-gray-900 mb-2'>Join Room</LargeHeader>
            <div className='space-y-2'>
              {isRoomLoading ? (
                <Skeleton className='w-32 h-4 mx-auto' />
              ) : (
                <>
                  <p className='text-gray-600 font-medium'>{publicRoom?.title}</p>
                  {statusInfo && !statusInfo.canJoin && (
                    <Badge className={`${statusInfo.color} border`}>
                      <statusInfo.icon className='size-3 mr-1' />
                      {formatSlug(publicRoom?.status)}
                    </Badge>
                  )}
                </>
              )}
              <p className='text-sm text-gray-500'>
                Enter your details to join this coding session
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {statusInfo && !statusInfo.canJoin && (
              <div className={cn('flex items-start gap-2 p-4 rounded mb-4', statusInfo.color)}>
                <p className='text-sm text-gray-700'>{statusInfo.message}</p>
              </div>
            )}

            <div className='space-y-4'>
              {/* Name Field */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='Enter your full name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={!statusInfo?.canJoin}
                />
              </div>

              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!statusInfo?.canJoin}
                />
              </div>

              {/* Join as Guest Button */}
              <Button
                className='w-full'
                onClick={handleJoinAsGuest}
                disabled={!canJoin || isLoading}
                isLoading={isLoading}
                icon={RiArrowRightLine}
                iconPosition='right'
              >
                Join as Guest
              </Button>

              <Divider />

              {/* Login as Host */}
              <div className='text-center'>
                <p className='text-sm text-gray-600 mb-3'>Are you the host of this room?</p>
                <Link to='/login' search={{ callbackUrl: location.href }}>
                  <Button variant='secondary' className='w-full' icon={RiLoginBoxLine}>
                    Login as Host
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
