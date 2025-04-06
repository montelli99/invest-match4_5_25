import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ZoomIn, ZoomOut, Hand, MousePointer } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, cropArea: CropArea): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped size
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

export const ImageUpload = ({ onImageUploaded, currentImageUrl }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const { toast } = useToast();

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels || !previewUrl) return;

    try {
      setUploading(true);
      
      // Get cropped image blob
      const croppedImageBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
      
      // Create a new file from the blob
      const croppedFile = new File([croppedImageBlob], selectedFile.name, {
        type: 'image/jpeg',
      });

      const response = await brain.upload_profile_image({
        file: croppedFile,
      });
      const data = await response.json();
      onImageUploaded(data.url);

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });

      setCropDialogOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Create preview and open crop dialog
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setCropDialogOpen(true);
      return; // Don't upload yet, wait for cropping

      // Upload handled by handleUpload after cropping
    },
    [onImageUploaded, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-border"
        }`}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="mx-auto w-32 h-32 rounded-full object-cover"
            />
            <p className="text-sm text-muted-foreground">
              Drag & drop a new image or click to change
            </p>
          </div>
        ) : isDragActive ? (
          <p className="text-primary">Drop the image here</p>
        ) : (
          <div className="space-y-4">
            <div className="w-32 h-32 rounded-full bg-muted mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Upload profile image</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Image</DialogTitle>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-2 bg-background rounded-full">
                    <Hand className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Drag to Position</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-2 bg-background rounded-full">
                    <MousePointer className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium">Center Face</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex gap-1">
                    <div className="p-2 bg-background rounded-full">
                      <ZoomIn className="w-5 h-5 text-primary" />
                    </div>
                    <div className="p-2 bg-background rounded-full">
                      <ZoomOut className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs font-medium">Zoom In/Out</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Adjust your profile picture to get the perfect fit:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Drag the image to position your face in the center</li>
                <li>Use pinch gesture or scroll to zoom in/out</li>
                <li>The circular area shows how your profile picture will appear</li>
              </ul>
              </div>
            </div>
          </DialogHeader>
          <div className="relative h-96 w-full">
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              minZoom={0.5}
              maxZoom={3}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCropDialogOpen(false);
                setPreviewUrl(currentImageUrl || "");
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {uploading && (
        <div className="mt-4">
          <Button disabled className="w-full">
            Uploading...
          </Button>
        </div>
      )}
    </Card>
  );
};
