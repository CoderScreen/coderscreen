import { RiCloseLine, RiDeleteBinLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FsNode } from '@/query/realtime/editor.query';

interface DeleteFileDialogProps {
  file: FsNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export const DeleteFileDialog = ({ file, open, onOpenChange, onDelete }: DeleteFileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {file?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete "{file?.name}"? This action is irreversible.
            {file?.type === 'folder' && ' All files and subfolders will be deleted.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant='secondary' icon={RiCloseLine} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' icon={RiDeleteBinLine} onClick={onDelete}>
            Delete {file?.type === 'folder' ? 'Folder' : 'File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
