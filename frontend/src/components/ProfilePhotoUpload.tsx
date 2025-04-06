import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import brain from "brain";
import { useState } from "react";

interface Props {
  photoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  name?: string;
}

export function ProfilePhotoUpload({ photoUrl, onPhotoUploaded, name }: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(photoUrl);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return;
    }

    try {
      setUploading(true);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        // Upload to server
        // Create a new File object from the base64 data
const byteCharacters = atob(base64Data);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
// Create a File object from the base64 data
const uploadFile = new File([base64Data], file.name, { type: file.type, lastModified: Date.now() });

const response = await brain.upload_profile_image({
  file: uploadFile
});

        const data = await response.json();
        onPhotoUploaded(data.url);

        toast({
          title: "Success",
          description: "Profile photo updated",
        });
      };
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload profile photo",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={previewUrl} />
        <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById("photo-upload")?.click()}
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
