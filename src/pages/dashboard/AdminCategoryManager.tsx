import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCategoriesWithSubcategories,
  useMainCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

// Icon options for categories
const ICON_OPTIONS = [
  "Smartphone", "Shirt", "Home", "Heart", "Dumbbell", "ShoppingBasket",
  "Baby", "Car", "Watch", "BookOpen", "Gamepad2", "Laptop", "Tablet",
  "Headphones", "Footprints", "ShoppingBag", "Gem", "Sofa", "ChefHat",
  "Lamp", "Droplets", "Palette", "Flower", "Folder",
];

// Auto-generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  image_url: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  icon: "Folder",
  image_url: "",
  parent_id: null,
  display_order: 0,
  is_active: true,
};

const AdminCategoryManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const { data: mainCategories } = useMainCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();

  // Auto-generate slug when name changes
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Error",
        description: "URL slug is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData,
          image_url: formData.image_url || null,
        });
        toast({
          title: "Category Updated",
          description: `"${formData.name}" has been updated successfully.`,
        });
      } else {
        await createCategory.mutateAsync({ ...formData, image_url: formData.image_url || null });
        toast({
          title: "Category Created",
          description: `"${formData.name}" is now live at /category/${formData.slug}`,
        });
      }
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      toast({
        title: "Category Deleted",
        description: `"${deletingCategory.name}" has been removed.`,
      });
      setDeletingCategory(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      image_url: category.image_url || "",
      parent_id: category.parent_id,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingCategory(null);
    setFormData(initialFormData);
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        is_active: !category.is_active,
      });
      toast({
        title: category.is_active ? "Category Deactivated" : "Category Activated",
        description: `"${category.name}" is now ${category.is_active ? "hidden" : "visible"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category status.",
        variant: "destructive",
      });
    }
  };

  // Flatten categories for table display
  const flattenedCategories = categories?.flatMap((cat) => [
    cat,
    ...(cat.subcategories || []).map((sub) => ({ ...sub, isSubcategory: true })),
  ]) || [];

  const filteredCategories = flattenedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Category Manager</h1>
          <p className="text-muted-foreground">
            Create and manage product categories with auto-generated URLs
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search categories by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} />
            Categories ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.isSubcategory && (
                          <span className="text-muted-foreground ml-4">↳</span>
                        )}
                        <span className={category.isSubcategory ? "text-muted-foreground" : "font-medium"}>
                          {category.name}
                        </span>
                        {category.subcategories?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {category.subcategories.length} sub
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /{category.slug}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <Badge variant="secondary">{category.icon}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => handleToggleStatus(category)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/category/${category.slug}`} target="_blank">
                                <Eye size={14} className="mr-2" />
                                View Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingCategory(category)}
                              className="text-destructive"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details. The URL will be updated automatically."
                : "Create a new category. A unique URL will be generated automatically."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Electronics"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Slug (auto-generated) */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug (auto-generated)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/category/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                  }
                  className="flex-1"
                />
              </div>
              {formData.slug && (
                <p className="text-xs text-muted-foreground">
                  Live URL: /category/{formData.slug}
                </p>
              )}
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={formData.parent_id || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent_id: value === "none" ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-level)</SelectItem>
                  {mainCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, icon: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Category Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.png"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                }
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingCategory?.name}" and remove its URL.
              Products in this category won't be deleted but will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategoryManager;
