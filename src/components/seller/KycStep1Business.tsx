import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAKISTAN_CITIES } from "@/hooks/useSellerKyc";
import { Building2, Phone, User } from "lucide-react";

interface KycStep1Props {
  form: UseFormReturn<any>;
}

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 11) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
};

const KycStep1Business = ({ form }: KycStep1Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Business & Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself and your business
          </p>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4" />
          Personal Details
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="legal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Legal Name *</FormLabel>
                <FormControl>
                  <Input placeholder="As per CNIC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="father_husband_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father/Husband Name *</FormLabel>
                <FormControl>
                  <Input placeholder="As per CNIC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Business Details Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Business Details
        </h4>

        <FormField
          control={form.control}
          name="shop_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your shop/store name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAKISTAN_CITIES.map((city) => (
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
            name="ntn_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NTN Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="National Tax Number" {...field} />
                </FormControl>
                <FormDescription>If registered with FBR</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="business_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your complete business address"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Emergency Contact Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Emergency Contact
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Emergency contact person" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="03XX-XXXXXXX"
                    value={field.value}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      if (formatted.replace(/\D/g, "").length <= 11) {
                        field.onChange(formatted);
                      }
                    }}
                    maxLength={12}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default KycStep1Business;
