import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, X } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
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

      // Use BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
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
        // Wait for video to be ready
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

  const handleScanResult = (rawValue: string) => {
    stopCamera();
    setOpen(false);

    try {
      const url = new URL(rawValue);
      // Check if it's a fanzon URL
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
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Button onClick={startScanning} className="gap-2">
                  <Camera size={18} />
                  Start Camera
                </Button>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary rounded-2xl animate-pulse" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a FANZON QR code to open the product, store, or order.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
