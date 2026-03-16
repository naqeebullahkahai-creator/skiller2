import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronRight, ChevronLeft, Upload, X, Loader2, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/mockData";
import { brands } from "@/data/dashboardData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage } from "@/hooks/useProducts";
import VariantManager, { LocalVariant } from "@/components/dashboard/VariantManager";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 1, name: "Basic Info", description: "Title, category & description" },
  { id: 2, name: "Pricing & Stock", description: "Set price and inventory" },
  { id: 3, name: "Media", description: "Upload images & video" },
];

const SellerAddProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(productId);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    brand: "",
    sku: "",
    originalPrice: "",
    discountedPrice: "",
    stock: "",
    images: [] as string[],
    description: "",
    videoUrl: "",
  });
  const [variants, setVariants] = useState<LocalVariant[]>([]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isEditMode || !productId || !user) return;

    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const [{ data: product, error: productError }, { data: variantRows, error: variantError }] = await Promise.all([
          supabase
            .from("products")
            .select("id, seller_id, title, category, brand, sku, price_pkr, discount_price_pkr, stock_count, images, description, video_url")
            .eq("id", productId)
            .eq("seller_id", user.id)
            .maybeSingle(),
          supabase
            .from("product_variants")
            .select("variant_name, variant_value, additional_price_pkr, stock_count")
            .eq("product_id", productId),
        ]);

        if (productError) throw productError;
        if (variantError) throw variantError;
        if (!product) throw new Error("Product not found");

        setFormData({
          title: product.title || "",
          category: product.category || "",
          brand: product.brand || "",
          sku: product.sku || "",
          originalPrice: String(product.price_pkr ?? ""),
          discountedPrice: String(product.discount_price_pkr ?? product.price_pkr ?? ""),
          stock: String(product.stock_count ?? ""),
          images: product.images || [],
          description: product.description || "",
          videoUrl: product.video_url || "",
        });

        setVariants((variantRows || []).map((variant) => ({
          variant_name: variant.variant_name,
          variant_value: variant.variant_value,
          additional_price_pkr: variant.additional_price_pkr,
          stock_count: variant.stock_count,
        })));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load product",
          variant: "destructive",
        });
        navigate("/seller/products", { replace: true });
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [isEditMode, productId, user, toast, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length && formData.images.length + uploadedUrls.length < 6; i++) {
      const file = files[i];
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const url = await uploadProductImage(file, user.id);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      updateFormData("images", [...formData.images, ...uploadedUrls]);
      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    updateFormData("images", formData.images.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast({ title: "Error", description: "Product title is required", variant: "destructive" });
        return;
      }
      if (!formData.category) {
        toast({ title: "Error", description: "Category is required", variant: "destructive" });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
        toast({ title: "Error", description: "Valid original price is required", variant: "destructive" });
        return;
      }
      if (!formData.discountedPrice || Number(formData.discountedPrice) <= 0) {
        toast({ title: "Error", description: "Valid sale price is required", variant: "destructive" });
        return;
      }
      if (!formData.stock || Number(formData.stock) < 0) {
        toast({ title: "Error", description: "Valid stock quantity is required", variant: "destructive" });
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    if (formData.images.length === 0) {
      toast({ title: "Error", description: "Please upload at least one product image", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const productPayload = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        brand: formData.brand || null,
        sku: formData.sku || null,
        price_pkr: Number(formData.originalPrice),
        discount_price_pkr: Number(formData.discountedPrice),
        stock_count: Number(formData.stock),
        images: formData.images,
        status: isEditMode ? undefined : "pending",
        video_url: formData.videoUrl || null,
      };

      const { data: savedProduct, error: productError } = isEditMode
        ? await supabase
            .from("products")
            .update({
              title: productPayload.title,
              description: productPayload.description,
              category: productPayload.category,
              brand: productPayload.brand,
              sku: productPayload.sku,
              price_pkr: productPayload.price_pkr,
              discount_price_pkr: productPayload.discount_price_pkr,
              stock_count: productPayload.stock_count,
              images: productPayload.images,
              video_url: productPayload.video_url,
            })
            .eq("id", productId)
            .eq("seller_id", user.id)
            .select("id")
            .single()
        : await supabase
            .from("products")
            .insert({
              seller_id: user.id,
              title: productPayload.title,
              description: productPayload.description,
              category: productPayload.category,
              brand: productPayload.brand,
              sku: productPayload.sku,
              price_pkr: productPayload.price_pkr,
              discount_price_pkr: productPayload.discount_price_pkr,
              stock_count: productPayload.stock_count,
              images: productPayload.images,
              status: "pending",
              video_url: productPayload.video_url,
            })
            .select("id")
            .single();

      if (productError) throw productError;
      if (!savedProduct?.id) throw new Error("Product save failed");

      await supabase.from("product_variants").delete().eq("product_id", savedProduct.id);

      if (variants.length > 0) {
        const variantsToInsert = variants.map((v) => ({
          product_id: savedProduct.id,
          variant_name: v.variant_name,
          variant_value: v.variant_value,
          additional_price_pkr: v.additional_price_pkr,
          stock_count: v.stock_count,
        }));

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert);

        if (variantsError) {
          console.error("Error saving variants:", variantsError);
          toast({
            title: "Warning",
            description: "Product saved but some variants failed to save.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: isEditMode ? "Product Updated" : "Product Submitted! 🎉",
        description: isEditMode
          ? "Your product changes have been saved successfully."
          : "Your product has been submitted for approval. You'll be notified once it's live.",
      });

      navigate("/seller/products");
    } catch (err: any) {
      console.error("Error saving product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoadingProduct) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/seller/products")}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEditMode ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Update your product details" : "Fill in the details to list your product"}
            </p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check size={18} /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      "font-medium text-sm",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-4",
                    currentStep > step.id ? "bg-green-500" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use a clear, descriptive title that customers will search for
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand (Optional)</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => updateFormData("brand", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.slug}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input
                  id="sku"
                  placeholder="e.g., PRD-001"
                  value={formData.sku}
                  onChange={(e) => updateFormData("sku", e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Stock */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (PKR) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      Rs.
                    </span>
                    <Input
                      id="originalPrice"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={formData.originalPrice}
                      onChange={(e) => updateFormData("originalPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Sale Price (PKR) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      Rs.
                    </span>
                    <Input
                      id="discountedPrice"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={formData.discountedPrice}
                      onChange={(e) => updateFormData("discountedPrice", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {formData.originalPrice && formData.discountedPrice && Number(formData.discountedPrice) < Number(formData.originalPrice) && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    🎉 Discount: {Math.round(
                      ((Number(formData.originalPrice) - Number(formData.discountedPrice)) /
                        Number(formData.originalPrice)) *
                        100
                    )}% off
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="How many units do you have?"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                />
              </div>

              {/* Variants Section */}
              <div className="border-t border-border pt-6">
                <VariantManager variants={variants} onChange={setVariants} />
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Product Images * (Max 6)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                  {formData.images.length < 6 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 size={24} className="text-muted-foreground animate-spin" />
                      ) : (
                        <Upload size={24} className="text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isUploading ? "Uploading..." : "Add Image"}
                      </span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  First image will be used as cover. Max 5MB per image.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Product Video (Optional)</Label>
                <Input
                  id="videoUrl"
                  placeholder="YouTube, TikTok, or direct video URL"
                  value={formData.videoUrl}
                  onChange={(e) => updateFormData("videoUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a short video to showcase your product
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight size={18} />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2 min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={18} />
                Submit for Approval
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SellerAddProductPage;
