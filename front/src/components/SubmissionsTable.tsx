import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Submission {
  id: number;
  text: string;
  timestamp: string;
}

interface SubmissionsTableProps {
  submissions: Submission[];
}

const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No submissions yet. Add some text above!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Text</TableHead>
            <TableHead className="w-[200px]">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">{submission.id}</TableCell>
              <TableCell>{submission.text}</TableCell>
              <TableCell>{submission.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsTable;