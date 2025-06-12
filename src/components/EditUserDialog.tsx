
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <UserEditDialogHeader />

        <ScrollArea className="flex-1 pr-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <UserEditForm
              formData={formData}
              onInputChange={handleInputChange}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
              isDisabled={updateMutation.isPending}
              isAdminUser={isAdminUser}
            />
          </form>
        </ScrollArea>

        <UserEditDialogFooter
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          hasError={!!phoneError}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
