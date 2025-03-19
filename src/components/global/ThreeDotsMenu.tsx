import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share2, Flag, Trash, UserX } from "lucide-react";

export interface ThreeDotsMenuProps {
  // Options for showing different menu items
  showBlock?: boolean;
  showDelete?: boolean;
  showShare?: boolean;
  showReport?: boolean;
  
  // Callback functions for actions
  onBlock?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onReport?: () => void;
}

export default function ThreeDotsMenu({ 
  showBlock = false,
  showDelete = false,
  showShare = true,
  showReport = true,
  onBlock,
  onDelete,
  onShare,
  onReport
}: ThreeDotsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showShare && (
          <DropdownMenuItem onClick={onShare} className="cursor-pointer">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </DropdownMenuItem>
        )}
        {showReport && (
          <DropdownMenuItem onClick={onReport} className="cursor-pointer">
            <Flag className="w-4 h-4 mr-2" /> Report
          </DropdownMenuItem>
        )}
        {showBlock && (
          <DropdownMenuItem onClick={onBlock} className="cursor-pointer">
            <UserX className="w-4 h-4 mr-2" /> Block User
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer">
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 