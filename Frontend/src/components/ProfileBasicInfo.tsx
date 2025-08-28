import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User as UserIcon, Edit } from 'lucide-react';
import ProfileImageUpload from './ProfileImageUpload';
import { useAuth } from '@/hooks/useAuth';

interface ProfileBasicInfoProps {
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    bio?: string;
    price?: number;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onProfileImageChange: (file: File, previewUrl: string) => void;
    onBioChange?: (value: string) => void;
    onPriceChange?: (value: number) => void;
}

const ProfileBasicInfo = ({
    firstName,
    lastName,
    email,
    profileImage,
    bio = '',
    price = 25,
    onFirstNameChange,
    onLastNameChange,
    onProfileImageChange,
    onBioChange,
    onPriceChange,
}: ProfileBasicInfoProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5" />
          <span>Informazioni Profilo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <ProfileImageUpload
            profileImage={profileImage}
            onImageChange={onProfileImageChange}
          />
          <div className="flex-1">
            {isEditingName ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div>
                  <h3 className="text-lg font-medium">{firstName} {lastName}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifica
                </Button>
              </div>
            )}
            <p className="text-gray-600 mt-2">{email}</p>
          </div>
        </div>

        {isEditingName && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingName(false)}
            >
              Fine Modifica
            </Button>
          </div>
        )}

        {user && user.role === 'Teacher' && (
          <>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={bio}
                onChange={(e) => onBioChange?.(e.target.value)}
                placeholder="Descrivi la tua esperienza e competenze..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="compensation">Compenso per lezione (€)</Label>
              <Input
                id="compensation"
                type="number"
                value={price}
                onChange={(e) => onPriceChange?.(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileBasicInfo;