import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LargeHeader } from '@/components/ui/heading';
import { RiUserLine, RiArrowRightLine, RiLoginBoxLine } from '@remixicon/react';
import { Label } from '@/components/ui/label';
import { Divider } from '@/components/ui/divider';
import { Link } from '@tanstack/react-router';
import { usePublicRoom } from '@/query/publicRoom.query';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestStartViewProps {
  onJoinAsGuest: (name: string, email: string) => void;
  isLoading?: boolean;
}

export const GuestStartView = ({
  onJoinAsGuest,
  isLoading = false,
}: GuestStartViewProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { publicRoom, isLoading: isRoomLoading } = usePublicRoom();

  const handleJoinAsGuest = () => {
    if (!name.trim() || !email.trim()) {
      return;
    }
    onJoinAsGuest(name.trim(), email.trim());
  };

  const isFormValid = name.trim().length > 0 && email.trim().length > 0;

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
                <p className='text-gray-600 font-medium'>{publicRoom?.title}</p>
              )}
              <p className='text-sm text-gray-500'>
                Enter your details to join this coding session
              </p>
            </div>
          </CardHeader>

          <CardContent>
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
                />
              </div>

              {/* Join as Guest Button */}
              <Button
                className='w-full'
                onClick={handleJoinAsGuest}
                disabled={!isFormValid || isLoading}
                isLoading={isLoading}
                icon={RiArrowRightLine}
                iconPosition='right'
              >
                Join as Guest
              </Button>

              <Divider />

              {/* Login as Host */}
              <div className='text-center'>
                <p className='text-sm text-gray-600 mb-3'>
                  Are you the host of this room?
                </p>
                <Link to='/login'>
                  <Button
                    variant='secondary'
                    className='w-full'
                    icon={RiLoginBoxLine}
                  >
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
