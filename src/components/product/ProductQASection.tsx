import { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProductQuestions, useAskQuestion, maskUserName } from "@/hooks/useProductQA";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductQASectionProps {
  productId: string;
  sellerId: string;
  productTitle: string;
}

const ProductQASection = ({ productId, sellerId, productTitle }: ProductQASectionProps) => {
  const { user } = useAuth();
  const { questions, allQuestions, isLoading, searchQuery, setSearchQuery, refetch } = useProductQuestions(productId);
  const { askQuestion, isSubmitting } = useAskQuestion();
  const [newQuestion, setNewQuestion] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);

  const handleSubmitQuestion = async () => {
    const success = await askQuestion(productId, sellerId, newQuestion);
    if (success) {
      setNewQuestion("");
      setShowAskForm(false);
      refetch();
    }
  };

  const answeredCount = allQuestions.filter(q => q.status === "answered").length;

  return (
    <div className="mt-8">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Questions & Answers</h2>
            <Badge variant="secondary" className="ml-2">
              {answeredCount} answered
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          
          {user && (
            <Button 
              size="sm" 
              onClick={() => setShowAskForm(!showAskForm)}
              variant={showAskForm ? "secondary" : "default"}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask a Question
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Ask Question Form */}
          {showAskForm && user && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Ask the Seller</h3>
                <Textarea
                  placeholder="Type your question about this product... (e.g., What is the warranty period?)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Your name will be shown as "{maskUserName(user.user_metadata?.full_name || user.email || '')}"
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAskForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitQuestion}
                      disabled={isSubmitting || !newQuestion.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Post Question"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Login prompt for non-authenticated users */}
          {!user && (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <a href="/auth" className="text-primary font-medium hover:underline">Login</a> to ask a question about this product
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          {allQuestions.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions (e.g., warranty, size, color...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Questions List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No questions yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to ask about this product!
              </p>
            </div>
          ) : (
            <ScrollArea className={questions.length > 5 ? "h-[400px]" : ""}>
              <div className="space-y-4">
                {questions.map((qa) => (
                  <QAItem 
                    key={qa.id} 
                    qa={qa} 
                    isOwnQuestion={qa.customer_id === user?.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {searchQuery && questions.length === 0 && allQuestions.length > 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No questions matching "{searchQuery}"
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Individual Q&A Item
interface QAItemProps {
  qa: {
    id: string;
    question_text: string;
    answer_text: string | null;
    status: "pending" | "answered" | "rejected";
    customer_name?: string;
    asked_at: string;
    answered_at: string | null;
  };
  isOwnQuestion: boolean;
}

const QAItem = ({ qa, isOwnQuestion }: QAItemProps) => {
  return (
    <Card className={cn(
      "transition-colors",
      isOwnQuestion && qa.status === "pending" && "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
    )}>
      <CardContent className="p-4">
        {/* Question */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">Q</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{qa.question_text}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {maskUserName(qa.customer_name || "")}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(qa.asked_at), { addSuffix: true })}
              </span>
              {isOwnQuestion && qa.status === "pending" && (
                <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                  <Clock className="h-3 w-3" />
                  Awaiting answer
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Answer */}
        {qa.answer_text && qa.status === "answered" && (
          <div className="flex items-start gap-3 mt-4 pl-9 border-l-2 border-green-200 dark:border-green-900">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{qa.answer_text}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs gap-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-0">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Seller
                </Badge>
                {qa.answered_at && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(qa.answered_at), { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductQASection;
