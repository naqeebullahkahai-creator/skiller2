import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
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
import { Building2 } from "lucide-react";

interface KycStep1Props {
  form: UseFormReturn<any>;
}

const KycStep1Business = ({ form }: KycStep1Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Business Information</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your business
          </p>
        </div>
      </div>

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

      <FormField
        control={form.control}
        name="legal_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Legal Name *</FormLabel>
            <FormControl>
              <Input placeholder="As per CNIC/Passport" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
  );
};

export default KycStep1Business;
