import { useState } from "react";
import { Check, ChevronRight, Upload, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface AddProductFormProps {
  onClose: () => void;
}

const steps = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Pricing & Stock" },
  { id: 3, name: "Media" },
  { id: 4, name: "Details" },
];

const AddProductForm = ({ onClose }: AddProductFormProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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
    specifications: [{ key: "", value: "" }],
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const specs = [...formData.specifications];
    specs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: specs }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = () => {
    // Simulate image upload with placeholder
    const placeholderImages = [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
    ];
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    updateFormData("images", [...formData.images, randomImage]);
  };

  const removeImage = (index: number) => {
    updateFormData("images", formData.images.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Product Submitted",
      description: "Your product has been submitted for approval.",
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep > step.id
                    ? "bg-fanzon-success text-white"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:block",
                  currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-2 text-muted-foreground hidden sm:block" size={16} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="Enter product title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
              />
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
                <Label>Brand</Label>
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="e.g., PRD-001"
                value={formData.sku}
                onChange={(e) => updateFormData("sku", e.target.value.toUpperCase())}
              />
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Stock */}
        {currentStep === 2 && (
          <div className="space-y-4">
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
                <Label htmlFor="discountedPrice">Discounted Price (PKR) *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Enter available quantity"
                value={formData.stock}
                onChange={(e) => updateFormData("stock", e.target.value)}
              />
            </div>

            {formData.originalPrice && formData.discountedPrice && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Discount:{" "}
                  <span className="font-semibold text-fanzon-success">
                    {Math.round(
                      ((Number(formData.originalPrice) - Number(formData.discountedPrice)) /
                        Number(formData.originalPrice)) *
                        100
                    )}
                    % off
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Media */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Label>Product Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {formData.images.length < 6 && (
                <button
                  onClick={handleImageUpload}
                  className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload up to 6 images. First image will be the cover.
            </p>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                placeholder="Enter detailed product description..."
                rows={5}
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                  className="gap-1"
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Attribute (e.g., Color)"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, "key", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., Black)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, "value", e.target.value)}
                      className="flex-1"
                    />
                    {formData.specifications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpecification(index)}
                        className="text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={currentStep === 1 ? onClose : handleBack}>
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        <Button onClick={currentStep === 4 ? handleSubmit : handleNext}>
          {currentStep === 4 ? "Submit for Approval" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default AddProductForm;
