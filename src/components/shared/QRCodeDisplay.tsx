import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
  triggerVariant?: "icon" | "button" | "menuItem";
}

const QRCodeDisplay = ({
  url,
  title = "QR Code",
  subtitle,
  size = 200,
  className,
  triggerVariant = "icon",
}: QRCodeDisplayProps) => {
  const { toast } = useToast();
  const fullUrl = url.startsWith("http") ? url : `https://fanzon.pk${url}`;

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, size, size);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `fanzon-qr-${Date.now()}.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: subtitle || "Scan this QR code",
          url: fullUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: "Link Copied!", description: "QR code link copied to clipboard" });
    }
  };

  const trigger = triggerVariant === "button" ? (
    <Button variant="outline" size="sm" className={cn("gap-2", className)}>
      <QrCode size={16} />
      QR Code
    </Button>
  ) : triggerVariant === "menuItem" ? (
    <button className={cn("flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm", className)}>
      <QrCode size={16} />
      Show QR Code
    </button>
  ) : (
    <button className={cn("p-2 rounded-full hover:bg-muted transition-colors", className)} aria-label="Show QR Code">
      <QrCode size={18} />
    </button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-xl shadow-inner">
            <QRCodeSVG
              id="qr-code-svg"
              value={fullUrl}
              size={size}
              level="H"
              includeMargin={false}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
            />
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground text-center max-w-[250px]">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-muted-foreground break-all text-center px-4">
            {fullUrl}
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
              <Download size={16} />
              Download
            </Button>
            <Button className="flex-1 gap-2" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDisplay;
