
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { type AppUser } from '@/services/userService';
import UserEditDialogHeader from './user-edit/UserEditDialogHeader';
import UserEditForm from './user-edit/UserEditForm';
import UserEditDialogFooter from './user-edit/UserEditDialogFooter';
import { useUserEdit } from './user-edit/useUserEdit';

interface EditUserDialogProps {
  user: AppUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onOpenChange
}) => {
  const {
    formData,
    phoneError,
    setPhoneError,
    handleInputChange,
    handleSubmit,
    updateMutation,
    isAdminUser
  } = useUserEdit({ user, onClose: () => onOpenChange(false) });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <UserEditDialogHeader />

        <form onSubmit={handleSubmit} className="space-y-4">
          <UserEditForm
            formData={formData}
            onInputChange={handleInputChange}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            isDisabled={updateMutation.isPending}
            isAdminUser={isAdminUser}
          />

          <UserEditDialogFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            hasError={!!phoneError}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
