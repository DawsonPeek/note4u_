
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ProfileActionsProps {
  showDeleteDialog: boolean;
  onShowDeleteDialog: (show: boolean) => void;
  onDeleteProfile: () => void;
  onSaveProfile: () => void;
}

const ProfileActions = ({
  showDeleteDialog,
  onShowDeleteDialog,
  onDeleteProfile,
  onSaveProfile
}: ProfileActionsProps) => {
  return (
    <div className="flex justify-between">
      <Dialog open={showDeleteDialog} onOpenChange={onShowDeleteDialog}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Elimina Profilo</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il tuo profilo? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onShowDeleteDialog(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={onDeleteProfile}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button onClick={onSaveProfile} size="lg">
        Salva Modifiche
      </Button>
    </div>
  );
};

export default ProfileActions;
