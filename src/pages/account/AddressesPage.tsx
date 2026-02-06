import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserAddresses, PROVINCES, CITIES_BY_PROVINCE, UserAddress, ADDRESS_LABELS } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Trash2, Star, Loader2, Phone, Home, Pencil, Building2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/empty-state";

const addressSchema = z.object({
  full_name: z.string().min(3, "Full name must be at least 3 characters").max(100),
  phone: z
    .string()
    .regex(/^03[0-9]{2}-?[0-9]{7}$/, "Enter a valid Pakistan phone number (e.g., 0300-1234567)"),
  province: z.string().min(1, "Please select a province"),
  city: z.string().min(1, "Please select a city"),
  area: z.string().optional(),
  full_address: z.string().min(10, "Address must be at least 10 characters").max(500),
  is_default: z.boolean().default(false),
  label: z.string().default("Home"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const getLabelIcon = (label: string) => {
  switch (label) {
    case "Office":
      return Building2;
    case "Other":
      return MoreHorizontal;
    default:
      return Home;
  }
};

const AddressesPage = () => {
  const {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useUserAddresses();

  const [showModal, setShowModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      province: "",
      city: "",
      area: "",
      full_address: "",
      is_default: false,
      label: "Home",
    },
  });

  const openAddModal = () => {
    setEditingAddress(null);
    form.reset({
      full_name: "",
      phone: "",
      province: "",
      city: "",
      area: "",
      full_address: "",
      is_default: false,
      label: "Home",
    });
    setSelectedProvince("");
    setShowModal(true);
  };

  const openEditModal = (address: UserAddress) => {
    setEditingAddress(address);
    form.reset({
      full_name: address.full_name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      area: address.area || "",
      full_address: address.full_address,
      is_default: address.is_default,
      label: address.label || "Home",
    });
    setSelectedProvince(address.province);
    setShowModal(true);
  };

  const handleSubmit = async (data: AddressFormData) => {
    if (editingAddress) {
      const success = await updateAddress(editingAddress.id, {
        full_name: data.full_name,
        phone: data.phone,
        province: data.province,
        city: data.city,
        area: data.area || "",
        full_address: data.full_address,
        is_default: data.is_default,
        label: data.label,
      });
      if (success) {
        setShowModal(false);
        setEditingAddress(null);
        form.reset();
        setSelectedProvince("");
      }
    } else {
      const newAddress = await addAddress({
        full_name: data.full_name,
        phone: data.phone,
        province: data.province,
        city: data.city,
        area: data.area || "",
        full_address: data.full_address,
        is_default: data.is_default,
        label: data.label,
      });
      if (newAddress) {
        setShowModal(false);
        form.reset();
        setSelectedProvince("");
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteAddress(id);
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Saved Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Address Book
          </CardTitle>
          <CardDescription>
            Manage your delivery addresses
          </CardDescription>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <EmptyState
            type="default"
            title="No addresses saved"
            description="Add a delivery address to make checkout faster and easier."
            actionLabel="Add Your First Address"
            onAction={openAddModal}
            icon={<MapPin size={56} strokeWidth={1.5} />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => {
              const LabelIcon = getLabelIcon(address.label || "Home");
              return (
                <div
                  key={address.id}
                  className={cn(
                    "relative p-4 border rounded-lg bg-card hover:shadow-md transition-shadow",
                    address.is_default ? "border-primary ring-1 ring-primary/20" : "border-border"
                  )}
                >
                  {/* Header with Label and Default Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-md",
                        address.is_default ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <LabelIcon size={16} />
                      </div>
                      <span className="font-medium text-sm">{address.label || "Home"}</span>
                    </div>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        <Star size={10} />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1">
                    <p className="font-semibold">{address.full_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone size={12} />
                      {address.phone}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {address.full_address}
                      {address.area && `, ${address.area}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.province}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star size={14} className="mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(address)}
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                    >
                      {deletingId === address.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Address Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} />
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Address Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label</FormLabel>
                    <div className="flex gap-2">
                      {ADDRESS_LABELS.map((label) => {
                        const Icon = getLabelIcon(label);
                        return (
                          <Button
                            key={label}
                            type="button"
                            variant={field.value === label ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => field.onChange(label)}
                          >
                            <Icon size={14} className="mr-1" />
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipient's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0300-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedProvince(value);
                        form.setValue("city", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedProvince}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(CITIES_BY_PROVINCE[selectedProvince] || []).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area / Sector (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DHA Phase 5, Gulberg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House/Flat No., Street, Landmark"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default address</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AddressesPage;
