import { useState } from "react";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send, 
  ExternalLink,
  Filter,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSellerQuestions, maskUserName } from "@/hooks/useProductQA";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const SellerQAPage = () => {
  const { 
    questions, 
    isLoading, 
    filter, 
    setFilter, 
    answerQuestion, 
    pendingCount 
  } = useSellerQuestions();
  
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAnswer = async (questionId: string, customerId: string, productTitle: string) => {
    setIsSubmitting(true);
    const success = await answerQuestion(questionId, answerText, customerId, productTitle);
    if (success) {
      setAnsweringId(null);
      setAnswerText("");
    }
    setIsSubmitting(false);
  };

  const filteredQuestions = questions.filter(q => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(query) ||
      q.product_title?.toLowerCase().includes(query) ||
      q.customer_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Customer Q&A
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingCount} pending
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Answer customer questions about your products
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {questions.filter(q => q.status === "pending").length}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {questions.filter(q => q.status === "answered").length}
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">Answered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="flex-1">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="answered" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Answered
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filter === "pending" ? "Questions Awaiting Your Answer" : 
             filter === "answered" ? "Answered Questions" : "All Questions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No questions found</p>
              <p className="text-sm text-muted-foreground">
                {filter === "pending" 
                  ? "Great! You've answered all customer questions." 
                  : "No questions match your search."}
              </p>
            </div>
          ) : (
            <ScrollArea className={filteredQuestions.length > 5 ? "h-[500px]" : ""}>
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div 
                    key={q.id} 
                    className={cn(
                      "p-4 border rounded-lg transition-colors",
                      q.status === "pending" && "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
                    )}
                  >
                    {/* Product Info */}
                    <div className="flex items-center justify-between mb-3">
                      <Link 
                        to={`/product/${q.product_id}`}
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {q.product_title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Badge variant={q.status === "pending" ? "secondary" : "outline"}>
                        {q.status === "pending" ? (
                          <><Clock className="h-3 w-3 mr-1" /> Pending</>
                        ) : (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Answered</>
                        )}
                      </Badge>
                    </div>

                    {/* Question */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">Q</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {maskUserName(q.customer_name || "")} • {formatDistanceToNow(new Date(q.asked_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Answer (if exists) */}
                    {q.answer_text && (
                      <div className="flex items-start gap-3 mt-3 ml-9 pl-3 border-l-2 border-green-200 dark:border-green-900">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">A</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{q.answer_text}</p>
                          {q.answered_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Answered {formatDistanceToNow(new Date(q.answered_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Answer Form */}
                    {q.status === "pending" && (
                      <div className="mt-4 ml-9">
                        {answeringId === q.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Type your answer..."
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAnsweringId(null);
                                  setAnswerText("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAnswer(q.id, q.customer_id, q.product_title || "")}
                                disabled={isSubmitting || !answerText.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {isSubmitting ? "Sending..." : "Submit Answer"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAnsweringId(q.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Answer This Question
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerQAPage;
