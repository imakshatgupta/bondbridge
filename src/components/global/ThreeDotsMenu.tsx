import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Share2, Flag, Trash } from "lucide-react";

interface ThreeDotsMenuProps {
  showDelete?: boolean;
  onShare?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
}

export default function ThreeDotsMenu({ showDelete = true, onShare, onReport, onDelete }: ThreeDotsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onShare} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" /> Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReport} className="cursor-pointer">
          <Flag className="w-4 h-4 mr-2" /> Report
        </DropdownMenuItem>
        {showDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer">
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 