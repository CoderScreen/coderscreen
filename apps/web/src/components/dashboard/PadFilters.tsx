import { Input } from '../ui/input';
import { Select } from '../ui/select';

export default function PadFilters() {
  return (
    <div className='flex gap-2 items-center my-2'>
      <Input placeholder='Search pads' />
      <Select>
        <option>Any format</option>
      </Select>
      <Select>
        <option>Any status</option>
      </Select>
      <Select>
        <option>Created anytime</option>
      </Select>
    </div>
  );
}
