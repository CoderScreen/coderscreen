import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/table';

const pads = [
  {
    title: 'Frontend Interview',
    status: 'Active',
    creator: 'Alice Smith',
    created: '2024-06-01',
    language: 'TypeScript',
  },
  {
    title: 'Backend NodeJS',
    status: 'Draft',
    creator: 'Bob Lee',
    created: '2024-05-28',
    language: 'NodeJS',
  },
  {
    title: 'Vue Live Coding',
    status: 'Completed',
    creator: 'Carol White',
    created: '2024-05-20',
    language: 'Vue',
  },
];

export default function PadsTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Creator</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>Language</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pads.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className='text-center'>
              No records found
            </TableCell>
          </TableRow>
        ) : (
          pads.map((pad, idx) => (
            <TableRow key={idx}>
              <TableCell>{pad.title}</TableCell>
              <TableCell>{pad.status}</TableCell>
              <TableCell>{pad.creator}</TableCell>
              <TableCell>{pad.created}</TableCell>
              <TableCell>{pad.language}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
