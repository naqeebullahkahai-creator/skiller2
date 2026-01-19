import { useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAKISTAN_BANKS } from "@/hooks/useSellerKyc";
import { Landmark, Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycStep3Props {
  form: UseFormReturn<any>;
}

const DocumentUploadZone = ({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onChange(file);
        if (file.type.startsWith("image/")) {
          setPreview(URL.createObjectURL(file));
        } else {
          setPreview(null);
        }
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="relative rounded-lg border overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 flex flex-col items-center justify-center bg-muted">
              <FileText className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{value.name}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50",
            error && "border-destructive"
          )}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleChange}
            className="hidden"
            id={`upload-${label}`}
          />
          <label htmlFor={`upload-${label}`} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-muted rounded-full">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, PDF up to 5MB
                </p>
              </div>
            </div>
          </label>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

const formatIban = (value: string) => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 24);
};

const KycStep3Banking = ({ form }: KycStep3Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Landmark className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Banking Details</h3>
          <p className="text-sm text-muted-foreground">
            For receiving your payments
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="bank_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PAKISTAN_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
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
        name="account_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Title *</FormLabel>
            <FormControl>
              <Input placeholder="Name on bank account" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="iban"
        render={({ field }) => (
          <FormItem>
            <FormLabel>IBAN *</FormLabel>
            <FormControl>
              <Input
                placeholder="PK00XXXX0000000000000000"
                value={field.value}
                onChange={(e) => {
                  const formatted = formatIban(e.target.value);
                  field.onChange(formatted);
                }}
                maxLength={24}
                className="font-mono"
              />
            </FormControl>
            <FormDescription>
              24-character IBAN starting with PK
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bank_cheque"
        render={({ field }) => (
          <FormItem>
            <DocumentUploadZone
              label="Cancelled Cheque / Bank Statement (Optional)"
              value={field.value}
              onChange={field.onChange}
              error={form.formState.errors.bank_cheque?.message as string}
            />
          </FormItem>
        )}
      />

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <Landmark className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Payment Information</p>
            <p className="text-muted-foreground mt-1">
              Your earnings will be transferred to this account after order
              completion. Please ensure the account details are correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycStep3Banking;
