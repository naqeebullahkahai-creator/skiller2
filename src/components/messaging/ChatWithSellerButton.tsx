import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateConversation, Conversation } from "@/hooks/useMessaging";
import { supabase } from "@/integrations/supabase/client";
import ChatWindow from "./ChatWindow";

interface ChatWithSellerButtonProps {
  sellerId: string;
  productId?: string;
  productTitle?: string;
  sellerName?: string;
}

const ChatWithSellerButton = ({
  sellerId,
  productId,
  productTitle,
  sellerName,
}: ChatWithSellerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createOrGetConversation } = useCreateConversation();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleClick = async () => {
    if (!currentUserId) {
      // Trigger login modal
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
      return;
    }

    if (currentUserId === sellerId) {
      return; // Can't chat with yourself
    }

    setLoading(true);
    const conversationId = await createOrGetConversation(sellerId, productId);
    
    if (conversationId) {
      setConversation({
        id: conversationId,
        customer_id: currentUserId,
        seller_id: sellerId,
        product_id: productId || null,
        last_message: null,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller_name: sellerName || "Seller",
        product_title: productTitle,
      });
      setIsOpen(true);
    }
    setLoading(false);
  };

  // Don't show if user is the seller
  if (currentUserId === sellerId) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with Seller
      </Button>

      {isOpen && conversation && currentUserId && (
        <ChatWindow
          conversation={conversation}
          currentUserId={currentUserId}
          onClose={() => setIsOpen(false)}
          isFloating={true}
        />
      )}
    </>
  );
};

export default ChatWithSellerButton;
