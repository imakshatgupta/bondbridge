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
import { AlertTriangle, ArrowLeft, KeyRound, EyeOff, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/apis/commonApiCalls/authenticationApi";
import { useApiCall } from "@/apis/globalCatchError";

const LogoutDeletePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Use the useApiCall hook to handle the deleteAccount API call
  const [executeDeleteAccount, isDeleting] = useApiCall(deleteAccount);

  const handleDeleteAccount = async () => {
    // Validate password
    if (!password) {
      setPasswordError("Please enter your password to confirm deletion");
      return;
    }

    // Call the API to delete the account
    const result = await executeDeleteAccount(password);
    
    if (result.success) {
      // Clear user data from localStorage and reset store
      dispatch(resetUser());
      localStorage.clear(); // Clear all localStorage items
      
      setDeleteDialogOpen(false);
      toast.success("Account deleted successfully");
      
      // Redirect to login page
      window.location.href = "/login";
    } else {
      // Handle error, likely incorrect password
      setPasswordError("Incorrect Password. Please Try Again.");
    }
  };

  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };

  const resetDeleteDialog = () => {
    setPassword("");
    setPasswordError("");
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetDeleteDialog();
    }
    setDeleteDialogOpen(open);
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
        {/* Reset Password Section */}
        <div className="p-4 border border-border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Reset Password</h4>
              <p className="text-sm text-muted-foreground">
                Change your Account Password
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setResetPasswordOpen(true)}
              className="border-primary hover:bg-primary/10 hover:text-muted-foreground text-foreground cursor-pointer"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="p-4 border border-border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently Delete Your Account
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

        {/* Reset Password Dialog */}
        <ResetPasswordDialog
          open={resetPasswordOpen}
          onOpenChange={setResetPasswordOpen}
        />

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={handleDialogChange}>
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

            <div className="mt-4 space-y-2">
              <Label htmlFor="confirm-password">
                Enter Your Password to Confirm
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={passwordError ? "border-destructive" : ""}
                  disabled={isDeleting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 px-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isDeleting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p className="text-sm text-foreground font-semibold">{passwordError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleDialogChange(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LogoutDeletePage;
