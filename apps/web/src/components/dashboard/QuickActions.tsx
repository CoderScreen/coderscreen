import { Button } from '../ui/button';

export default function QuickActions() {
  return (
    <div className='flex gap-4 my-4'>
      <Button variant='secondary'>Create TypeScript Pad</Button>
      <Button variant='secondary'>Create React Pad</Button>
      <Button variant='secondary'>Create NodeJS Pad</Button>
      <Button variant='secondary'>Create Vue Pad</Button>
      <Button variant='secondary'>Create Angular Pad</Button>
    </div>
  );
}
