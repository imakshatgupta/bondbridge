import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiCall } from "@/apis/globalCatchError";
import { reportPost } from "@/apis/commonApiCalls/reportApi";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  reporterId: string;
}

export function ReportModal({ isOpen, onClose, postId, reporterId }: ReportModalProps) {
  const [description, setDescription] = useState('');
  const [executeReport, isReporting] = useApiCall(reportPost);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description for your report');
      return;
    }

    const result = await executeReport({
      postId,
      reporterId,
      description: description.trim()
    });

    if (result.success) {
      toast.success('Report submitted successfully');
      onClose();
      setDescription('');
    }
    else {
      toast.error('Failed to report post');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Textarea
              id="description"
              placeholder="Please describe why you are reporting this post..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isReporting}
            className="cursor-pointer"
          >
            {isReporting ? 'Submitting...' : 'Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 