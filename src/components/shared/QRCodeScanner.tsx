import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QRCodeScannerProps {
  className?: string;
  variant?: "icon" | "button";
}

const QRCodeScanner = ({ className, variant = "icon" }: QRCodeScannerProps) => {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!open) stopCamera();
    return () => stopCamera();
  }, [open]);

  const hasBarcodeDetector = "BarcodeDetector" in window;

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);

      if (hasBarcodeDetector) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const scanLoop = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              handleScanResult(barcodes[0].rawValue);
              return;
            }
          } catch {}
          if (streamRef.current) requestAnimationFrame(scanLoop);
        };
        setTimeout(scanLoop, 1000);
      } else {
        toast({
          title: "QR Scanner",
          description: "QR scanning requires a modern browser. Try Chrome on your phone.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasBarcodeDetector) {
      toast({
        title: "Not Supported",
        description: "QR scanning from images requires a modern browser (Chrome 83+).",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      const barcodes = await detector.detect(canvas);

      if (barcodes.length > 0) {
        handleScanResult(barcodes[0].rawValue);
      } else {
        toast({
          title: "No QR Code Found",
          description: "Could not detect a QR code in the selected image. Try a clearer photo.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Scan Failed",
        description: "Could not process the image. Please try another photo.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScanResult = (rawValue: string) => {
    stopCamera();
    setOpen(false);

    try {
      const url = new URL(rawValue);
      if (url.hostname.includes("fanzon") || url.hostname.includes("lovable")) {
        navigate(url.pathname);
        toast({ title: "QR Scanned!", description: "Navigating to the scanned page." });
      } else {
        window.open(rawValue, "_blank");
      }
    } catch {
      toast({ title: "QR Code Scanned", description: rawValue });
    }
  };

  const trigger = variant === "button" ? (
    <Button variant="outline" size="sm" className={cn("gap-2", className)}>
      <ScanLine size={16} />
      Scan QR
    </Button>
  ) : (
    <button className={cn("p-2 rounded-full hover:bg-muted transition-colors", className)} aria-label="Scan QR Code">
      <ScanLine size={18} />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!scanning && !processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                <Button onClick={startScanning} className="gap-2">
                  <Camera size={18} />
                  Start Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <ImagePlus size={18} />
                  Upload from Gallery
                </Button>
              </div>
            )}
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Scanning image...</p>
                </div>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary rounded-2xl animate-pulse" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a FANZON QR code or upload a photo from your gallery.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryUpload}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
