import React, { useState } from "react";
import { useAppDispatch } from "@/store";
import { setSettingsActive } from "@/store/settingsSlice";
import { resetUser } from "@/store/currentUserSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const LogoutDeletePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLogout = () => {
    dispatch(resetUser());
    localStorage.removeItem("userId");
    // Redirect to login page
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    dispatch(resetUser());
    localStorage.removeItem("userId");
    setDeleteDialogOpen(false);
    toast.success("Account deleted successfully");
    // Redirect to login page
    window.location.href = "/login";
  };

  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium cursor-pointer">
        <ArrowLeft
          className="h-4 w-4 mr-2 inline cursor-pointer"
          onClick={handleCloseSettings}
        />
        Account Settings
      </h3>

      <div className="space-y-6">
        {/* Logout Section */}
        <div className="p-4 border border-border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Logout</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-300 hover:bg-red-50 hover:text-red-600 text-red-500 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="p-4 border border-border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="cursor-pointer"
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently lost.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted p-3 rounded-md mt-2">
              <p className="text-sm font-medium">
                What happens when you delete your account:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-5">
                <li>
                  Your profile and all personal information will be deleted
                </li>
                <li>Your posts, comments, and messages will be removed</li>
                <li>You will lose access to all your connections and groups</li>
                <li>This action is permanent and cannot be reversed</li>
              </ul>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LogoutDeletePage;
