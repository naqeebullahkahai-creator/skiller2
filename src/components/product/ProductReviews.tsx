import { useState, useEffect } from "react";
import { Star, User, CheckCircle, Loader2, Image as ImageIcon, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProductReviews, useCanReview, useSubmitReview, uploadReviewImage } from "@/hooks/useProductReviews";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { reviews, stats, isLoading, customerImages } = useProductReviews(productId);
  const { canReview, deliveredOrderId } = useCanReview(productId);
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload up to 3 images only.",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((f) => f.type.startsWith("image/") && f.size < 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only images under 5MB are allowed.",
        variant: "destructive",
      });
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!deliveredOrderId || !userId) return;

    setUploadingImages(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const file of selectedImages) {
        const url = await uploadReviewImage(userId, file);
        if (url) imageUrls.push(url);
      }

      await submitReview.mutateAsync({
        productId,
        orderId: deliveredOrderId,
        userId,
        rating,
        reviewText,
        images: imageUrls,
      });

      setShowReviewForm(false);
      setRating(5);
      setReviewText("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
          <div className="text-5xl font-bold text-foreground">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={cn(
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {stats.totalReviews} reviews
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingCounts[star] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star} ★</span>
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Images Gallery */}
      {customerImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <ImageIcon size={18} />
            Images from Customers ({customerImages.length})
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {customerImages.slice(0, 16).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImage(img)}
                className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <img
                  src={img}
                  alt={`Customer photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {customerImages.length > 16 && (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                +{customerImages.length - 16}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canReview && !showReviewForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-sm mb-3">
            You purchased this product. Share your experience!
          </p>
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Write Your Review</h4>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Review</label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Add Photos (up to 3)
            </Label>
            <div className="flex flex-wrap gap-3 items-center">
              {imagePreviewUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {selectedImages.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    multiple
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitReview.isPending || uploadingImages}
            >
              {submitReview.isPending || uploadingImages ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {uploadingImages ? "Uploading..." : "Submitting..."}
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-medium">Customer Reviews ({reviews.length})</h4>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{review.user_name}</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle size={12} className="mr-1" />
                      Verified Purchase
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
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
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {review.review_text && (
                    <p className="text-sm text-foreground mt-2">{review.review_text}</p>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxImage(img)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                        >
                          <img
                            src={img}
                            alt={`Review photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Seller Reply */}
                  {review.seller_reply && (
                    <div className="mt-3 bg-muted/50 rounded-lg p-3 ml-4 border-l-2 border-primary">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                        <MessageSquare size={14} />
                        Seller Response
                      </div>
                      <p className="text-sm text-foreground">{review.seller_reply}</p>
                      {review.seller_replied_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.seller_replied_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Review Image</DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <img
              src={lightboxImage}
              alt="Review"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;
