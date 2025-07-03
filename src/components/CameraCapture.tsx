import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, SwitchCamera, X, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, isOpen, onClose }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Auto-start with correct camera immediately
      const initCamera = async () => {
        await startCamera();
        await checkCameraCount();
      };
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const checkCameraCount = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (error) {
      console.error("Error checking camera count:", error);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera Not Supported: navigator.mediaDevices or getUserMedia missing");
        toast({
          title: "Camera Not Supported",
          description: "Your browser does not support camera access.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      let mediaStream: MediaStream | null = null;
      let errorMsg = "";
      // 1. Try environment
      try {
        console.log("Trying getUserMedia with facingMode:", facingMode);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        console.log("Camera opened with facingMode:", facingMode);
      } catch (error) {
        errorMsg = (error as Error).message;
        console.warn("Failed with facingMode", facingMode, errorMsg);
        // 2. Try user
        if (facingMode !== 'user') {
          try {
            console.log("Trying getUserMedia with facingMode: user");
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
            setFacingMode('user');
            console.log("Camera opened with facingMode: user");
          } catch (userError) {
            errorMsg = (userError as Error).message;
            console.warn("Failed with facingMode user", errorMsg);
            // 3. Try no facingMode
            try {
              console.log("Trying getUserMedia with no facingMode constraint");
              mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              });
              console.log("Camera opened with no facingMode constraint");
            } catch (noFacingError) {
              errorMsg = (noFacingError as Error).message;
              console.warn("Failed with no facingMode constraint", errorMsg);
              // 4. Final fallback: { video: true }
              try {
                console.log("Trying getUserMedia with { video: true }");
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                console.log("Camera opened with { video: true }");
              } catch (finalError) {
                errorMsg = (finalError as Error).message;
                console.error("Failed with { video: true }", errorMsg);
              }
            }
          }
        }
      }

      if (mediaStream) {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays immediately
          await videoRef.current.play();
        }
      } else {
        toast({
          title: "Camera Error",
          description: `Could not access camera. ${errorMsg || "Please check permissions, device connection, and try again."}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    // No need to manually restart camera here; useEffect will handle it
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.8);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Capture
          </DialogTitle>
          <DialogDescription>
            Use your device camera to capture an image of your ingredients. Position your ingredients in the camera view and tap the capture button. Use the switch button to change between front and rear cameras if available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview */}
          <Card className="relative overflow-hidden bg-black">
            <div className="aspect-[4/3] relative">
              <video
                ref={el => {
                  videoRef.current = el;
                  if (el) {
                    console.log('Video element mounted. srcObject:', el.srcObject);
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ background: '#000' }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}
              {/* Fallback message if video cannot be shown */}
              {!isLoading && videoRef.current && !videoRef.current.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                  <div className="text-white text-center">
                    <p>Camera stream not available.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls Overlay */}
            {!isLoading && (
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                {/* Switch Camera Button */}
                {hasMultipleCameras && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchCamera}
                    className="bg-black/50 border-white/50 text-white hover:bg-black/70"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </Button>
                )}

                {/* Capture Button */}
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-white/20 border-2 border-white hover:bg-white/30 rounded-full w-16 h-16 p-0"
                >
                  <Circle className="h-8 w-8 text-white" />
                </Button>

                {/* Close Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="bg-black/50 border-white/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Position your ingredients in the camera view and tap the capture button</p>
            {hasMultipleCameras && (
              <p className="mt-1">Use the switch button to change between front and rear cameras</p>
            )}
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};