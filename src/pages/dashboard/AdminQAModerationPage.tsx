import { useState } from "react";
import { 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminQAModeration, maskUserName } from "@/hooks/useProductQA";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminQAModerationPage = () => {
  const { questions, isLoading, toggleVisibility, deleteQuestion, refetch } = useAdminQAModeration();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "answered">("all");

  const filteredQuestions = questions.filter(q => {
    // Status filter
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    
    // Search filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(query) ||
      q.answer_text?.toLowerCase().includes(query) ||
      q.product_title?.toLowerCase().includes(query) ||
      q.customer_name?.toLowerCase().includes(query)
    );
  });

  const visibleCount = questions.filter(q => q.is_visible).length;
  const hiddenCount = questions.filter(q => !q.is_visible).length;
  const pendingCount = questions.filter(q => q.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Q&A Moderation</h1>
          <p className="text-muted-foreground">
            Manage product questions and answers across the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{questions.length}</p>
            <p className="text-sm text-muted-foreground">Total Q&A</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
            <p className="text-sm text-amber-600 dark:text-amber-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{visibleCount}</p>
            <p className="text-sm text-green-600 dark:text-green-500">Visible</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{hiddenCount}</p>
            <p className="text-sm text-red-600 dark:text-red-500">Hidden</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === "pending" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("pending")}
          >
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Button>
          <Button 
            variant={filterStatus === "answered" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterStatus("answered")}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Answered
          </Button>
        </div>
        
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Product Q&A</CardTitle>
          <CardDescription>
            Hide inappropriate content or delete spam questions
          </CardDescription>
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
                Adjust your filters or search query
              </p>
            </div>
          ) : (
            <ScrollArea className={filteredQuestions.length > 5 ? "h-[500px]" : ""}>
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div 
                    key={q.id} 
                    className={cn(
                      "p-4 border rounded-lg",
                      !q.is_visible && "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/product/${q.product_id}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {q.product_title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        {!q.is_visible && (
                          <Badge variant="destructive" className="gap-1">
                            <EyeOff className="h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <Badge variant={q.status === "pending" ? "secondary" : "outline"}>
                        {q.status === "pending" ? "Pending" : "Answered"}
                      </Badge>
                    </div>

                    {/* Question */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">Q</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{q.question_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {maskUserName(q.customer_name || "")} • {formatDistanceToNow(new Date(q.asked_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Answer */}
                    {q.answer_text && (
                      <div className="flex items-start gap-3 mt-3 ml-9 pl-3 border-l-2 border-green-200 dark:border-green-900">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">A</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{q.answer_text}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 ml-9">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVisibility(q.id, !q.is_visible)}
                      >
                        {q.is_visible ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Show</>
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Q&A?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this question and its answer. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQuestion(q.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

export default AdminQAModerationPage;
