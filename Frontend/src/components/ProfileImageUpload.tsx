import { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';

const backendUrl = "http://localhost:5258";

interface ProfileImageUploadProps {
  profileImage: string;
  onImageChange: (file: File, previewUrl: string) => void;
}

const ProfileImageUpload = ({ profileImage, onImageChange }: ProfileImageUploadProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 3 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

      if (file.size > maxSize) {
        alert('File troppo grande. Massimo 3MB');
        return;
      }

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Formato non supportato. Usa JPG, PNG o GIF');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPreviewUrl = e.target?.result as string;
        setPreviewImage(newPreviewUrl);
        onImageChange(file, newPreviewUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageUrl = () => {
    if (previewImage) {
      return previewImage;
    }

    if (profileImage) {
      if (profileImage.startsWith('http') || profileImage.startsWith('data:')) {
        return profileImage;
      }
      return `${backendUrl}${profileImage}`;
    }

    return null;
  };

  const imageUrl = getImageUrl();

  return (
      <div className="relative">
        <div
            className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors relative group"
            onClick={handleImageClick}
        >
          {imageUrl ? (
              <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
              />
          ) : (
              <User className="h-8 w-8 text-blue-600" />
          )}
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
        />
      </div>
  );
};

export default ProfileImageUpload;