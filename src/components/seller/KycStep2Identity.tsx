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
import { Shield, Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycStep2Props {
  form: UseFormReturn<any>;
}

const formatCnic = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

const FileUploadZone = ({
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
      if (file && file.type.startsWith("image/")) {
        onChange(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label} *</label>
      {preview ? (
        <div className="relative rounded-lg border overflow-hidden">
          <img
            src={preview}
            alt={label}
            className="w-full h-40 object-cover"
          />
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
            accept="image/*"
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
                  PNG, JPG up to 5MB
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

const KycStep2Identity = ({ form }: KycStep2Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Identity Verification</h3>
          <p className="text-sm text-muted-foreground">
            We need to verify your identity
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="cnic_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNIC Number *</FormLabel>
            <FormControl>
              <Input
                placeholder="00000-0000000-0"
                value={field.value}
                onChange={(e) => {
                  const formatted = formatCnic(e.target.value);
                  if (formatted.replace(/\D/g, "").length <= 13) {
                    field.onChange(formatted);
                  }
                }}
                maxLength={15}
              />
            </FormControl>
            <FormDescription>
              Enter your 13-digit CNIC number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="cnic_front"
          render={({ field }) => (
            <FormItem>
              <FileUploadZone
                label="CNIC Front"
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.cnic_front?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnic_back"
          render={({ field }) => (
            <FormItem>
              <FileUploadZone
                label="CNIC Back"
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.cnic_back?.message as string}
              />
            </FormItem>
          )}
        />
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Photo Guidelines</p>
            <ul className="text-muted-foreground mt-1 space-y-1">
              <li>• Ensure the entire card is visible</li>
              <li>• Photo should be clear and not blurry</li>
              <li>• All text must be readable</li>
              <li>• Avoid glare or shadows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycStep2Identity;
