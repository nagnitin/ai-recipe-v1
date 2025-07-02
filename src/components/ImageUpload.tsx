import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { CameraCapture } from "./CameraCapture";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleCameraCapture = (file: File) => {
    onImageUpload(file);
    setIsCameraOpen(false);
  };

  const openCamera = () => {
    setIsCameraOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        {/* Camera Capture */}
        <Button
          variant="outline"
          size="sm"
          onClick={openCamera}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Camera</span>
        </Button>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};