import { useState } from "react";
import { Star, Eye, EyeOff, Loader2, Image as ImageIcon, AlertTriangle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminReviews, useAdminModerateReview } from "@/hooks/useProductReviews";
import { formatDistanceToNow, format } from "date-fns";

const AdminReviewsPage = () => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useAdminReviews();
  const moderateMutation = useAdminModerateReview();

  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [hideReason, setHideReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "visible" | "hidden">("all");

  const handleHideReview = async () => {
    if (!selectedReview || !user) return;

    await moderateMutation.mutateAsync({
      reviewId: selectedReview.id,
      isHidden: true,
      reason: hideReason,
      adminId: user.id,
    });

    setShowHideDialog(false);
    setSelectedReview(null);
    setHideReason("");
  };

  const handleUnhideReview = async (review: any) => {
    if (!user) return;

    await moderateMutation.mutateAsync({
      reviewId: review.id,
      isHidden: false,
      adminId: user.id,
    });
  };

  const filteredReviews = reviews.filter((r: any) => {
    const matchesSearch = !searchQuery ||
      r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review_text?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "visible" && !r.is_hidden) ||
      (filterStatus === "hidden" && r.is_hidden);

    return matchesSearch && matchesStatus;
  });

  const hiddenCount = reviews.filter((r: any) => r.is_hidden).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Review Moderation
        </h1>
        <p className="text-muted-foreground">
          Monitor and moderate customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visible</p>
                <p className="text-2xl font-bold">{reviews.length - hiddenCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <EyeOff className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hidden</p>
                <p className="text-2xl font-bold">{hiddenCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-80"
        />
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="visible">Visible Only</SelectItem>
            <SelectItem value="hidden">Hidden Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            Hide reviews with abusive or irrelevant content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review: any) => (
                <TableRow key={review.id} className={review.is_hidden ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {review.product_image && (
                        <img
                          src={review.product_image}
                          alt=""
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span className="line-clamp-1 font-medium max-w-[120px]">
                        {review.product_title || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.user_name}</p>
                      <p className="text-xs text-muted-foreground">{review.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={cn(
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm line-clamp-2">
                        {review.review_text || <span className="italic text-muted-foreground">No comment</span>}
                      </p>
                      {review.images?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <ImageIcon size={12} />
                          {review.images.length} photo(s)
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {review.is_hidden ? (
                      <Badge variant="destructive">
                        <EyeOff size={12} className="mr-1" />
                        Hidden
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Eye size={12} className="mr-1" />
                        Visible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {review.is_hidden ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnhideReview(review)}
                        disabled={moderateMutation.isPending}
                      >
                        <Eye size={14} className="mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowHideDialog(true);
                        }}
                      >
                        <EyeOff size={14} className="mr-1" />
                        Hide
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No reviews found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters."
                  : "No reviews have been submitted yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hide Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Hide Review
            </DialogTitle>
            <DialogDescription>
              This will hide the review from all customers. Provide a reason for moderation records.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.user_name}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={cn(
                          star <= selectedReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">
                  {selectedReview.review_text || <span className="italic text-muted-foreground">No comment</span>}
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <Textarea
                  placeholder="Reason for hiding (e.g., abusive language, spam, irrelevant content)..."
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHideDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHideReview}
              disabled={moderateMutation.isPending}
            >
              {moderateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Hiding...
                </>
              ) : (
                <>
                  <EyeOff size={16} className="mr-2" />
                  Hide Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviewsPage;
