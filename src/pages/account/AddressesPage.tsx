import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserAddresses, PROVINCES, CITIES_BY_PROVINCE, UserAddress } from "@/hooks/useAddresses";
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
import { MapPin, Plus, Trash2, Star, Loader2, Phone, Home } from "lucide-react";
import { cn } from "@/lib/utils";

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
});

type AddressFormData = z.infer<typeof addressSchema>;

const AddressesPage = () => {
  const {
    addresses,
    isLoading,
    addAddress,
    deleteAddress,
    setDefaultAddress,
  } = useUserAddresses();

  const [showModal, setShowModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    },
  });

  const handleAddAddress = async (data: AddressFormData) => {
    const newAddress = await addAddress({
      full_name: data.full_name,
      phone: data.phone,
      province: data.province,
      city: data.city,
      area: data.area || "",
      full_address: data.full_address,
      is_default: data.is_default,
    });
    if (newAddress) {
      setShowModal(false);
      form.reset();
      setSelectedProvince("");
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
            Saved Addresses
          </CardTitle>
          <CardDescription>
            Manage your delivery addresses
          </CardDescription>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <Home size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No addresses saved</h2>
            <p className="text-muted-foreground mb-6">
              Add an address to make checkout faster.
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  "relative p-4 border rounded-lg",
                  address.is_default ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                {address.is_default && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      <Star size={10} />
                      Default
                    </span>
                  </div>
                )}

                <div className="pr-16">
                  <p className="font-semibold">{address.full_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
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

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
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
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Address Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Add New Address
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAddress)} className="space-y-4">
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
                  Save Address
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
