import { useState, useEffect } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversations, Conversation } from "@/hooks/useMessaging";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MessagesPageProps {
  userRole: "customer" | "seller";
}

const MessagesPage = ({ userRole }: MessagesPageProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { conversations, loading } = useConversations(userRole);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="border border-border rounded-lg overflow-hidden h-[calc(100%-60px)]">
        <div className="flex h-full">
          {/* Conversation List - Hidden on mobile when chat is open */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 border-r border-border bg-background",
              selectedConversation ? "hidden md:block" : "block"
            )}
          >
            <ConversationList
              conversations={conversations}
              loading={loading}
              selectedId={selectedConversation?.id || null}
              onSelect={setSelectedConversation}
              userRole={userRole}
            />
          </div>

          {/* Chat Window */}
          <div
            className={cn(
              "flex-1 bg-muted/30",
              selectedConversation ? "block" : "hidden md:flex"
            )}
          >
            {selectedConversation && currentUserId ? (
              <div className="flex flex-col h-full w-full">
                {/* Mobile back button */}
                <div className="md:hidden p-2 border-b border-border bg-background">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <div className="flex-1">
                  <ChatWindow
                    conversation={selectedConversation}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center justify-center h-full text-center p-8">
                <div>
                  <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
