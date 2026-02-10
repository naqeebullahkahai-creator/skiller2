import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Copy, Share2, Facebook, Check, Link2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";

interface SocialShareButtonsProps {
  productName: string;
  productUrl: string;
  productPrice?: number;
  className?: string;
  compact?: boolean;
}

const SocialShareButtons = ({
  productName,
  productUrl,
  productPrice,
  className,
  compact = false,
}: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://fanzon.pk${productUrl}`;
  
  const whatsappMessage = productPrice
    ? `Check out this ${productName} for only Rs. ${productPrice.toLocaleString()} on FANZON! 🛍️\n\n${fullUrl}`
    : `Check out this ${productName} on FANZON! 🛍️\n\n${fullUrl}`;

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: whatsappMessage,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
            <Share2 size={18} />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleWhatsAppShare}>
            <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
            Share on WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFacebookShare}>
            <Facebook className="mr-2 h-4 w-4 text-blue-600" />
            Share on Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
            <QRCodeDisplay
              url={productUrl}
              title={`QR: ${productName}`}
              subtitle="Scan this QR code to view the product"
              triggerVariant="menuItem"
            />
          </DropdownMenuItem>
          {navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              More Options...
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
      >
        <MessageCircle size={16} />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Facebook size={16} />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check size={16} className="text-green-500" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Link2 size={16} />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SocialShareButtons;
