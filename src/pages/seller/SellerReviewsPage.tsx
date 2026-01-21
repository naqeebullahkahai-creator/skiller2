import { useState } from "react";
import { Star, MessageSquare, Loader2, Send, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerProductReviews, useSellerReplyToReview } from "@/hooks/useProductReviews";
import { formatDistanceToNow } from "date-fns";
import VerifiedSellerGuard from "@/components/seller/VerifiedSellerGuard";

const SellerReviewsPage = () => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useSellerProductReviews(user?.id);
  const replyMutation = useSellerReplyToReview();

  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  const handleOpenReply = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.seller_reply || "");
    setShowReplyDialog(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    await replyMutation.mutateAsync({
      reviewId: selectedReview.id,
      reply: replyText.trim(),
    });

    setShowReplyDialog(false);
    setSelectedReview(null);
    setReplyText("");
  };

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const repliedCount = reviews.filter((r: any) => r.seller_reply).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <VerifiedSellerGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Customer Reviews
          </h1>
          <p className="text-muted-foreground">
            Manage and respond to customer feedback on your products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{avgRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Replied</p>
                  <p className="text-2xl font-bold">{repliedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>
              Respond to reviews to show customers you care
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground text-sm">
                  Reviews from customers will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {review.product?.images?.[0] && (
                            <img
                              src={review.product.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="line-clamp-1 font-medium max-w-[150px]">
                            {review.product?.title || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{review.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
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
                            {review.review_text || <span className="text-muted-foreground italic">No comment</span>}
                          </p>
                          {review.images?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <ImageIcon size={12} />
                              {review.images.length} photo(s)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {review.seller_reply ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle size={12} className="mr-1" />
                            Replied
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={review.seller_reply ? "outline" : "default"}
                          onClick={() => handleOpenReply(review)}
                        >
                          <MessageSquare size={14} className="mr-1" />
                          {review.seller_reply ? "Edit Reply" : "Reply"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Review</DialogTitle>
            </DialogHeader>

            {selectedReview && (
              <div className="space-y-4">
                {/* Original Review */}
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

                {/* Reply Input */}
                <div>
                  <Textarea
                    placeholder="Write your response to this customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your reply will be visible to all customers viewing this product.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || replyMutation.isPending}
              >
                {replyMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </VerifiedSellerGuard>
  );
};

export default SellerReviewsPage;
