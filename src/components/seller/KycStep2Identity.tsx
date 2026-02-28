import { useState, useCallback, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Shield, Upload, X, Image as ImageIcon, Calendar, AlertTriangle, Camera, User, Loader2, ScanLine, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENDER_OPTIONS, calculateCnicExpiry, isAtLeast18 } from "@/hooks/useSellerKyc";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  aspectSquare = false,
  onScanResult,
  scannable = false,
}: {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  aspectSquare?: boolean;
  onScanResult?: (data: any) => void;
  scannable?: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onChange(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
        setScanned(false);
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
      setScanned(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setScanned(false);
  };

  const handleScan = async () => {
    if (!value || !onScanResult) return;
    setScanning(true);
    try {
      // Convert file to base64 data URL for AI processing
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(value);
      });

      const { data, error } = await supabase.functions.invoke("scan-image", {
        body: { imageUrl: dataUrl, scanType: "cnic" },
      });

      if (error) throw error;
      if (data?.success && data?.data) {
        onScanResult(data.data);
        setScanned(true);
        toast.success("CNIC scanned successfully! Fields auto-filled.");
      } else {
        toast.error(data?.error || "Could not read CNIC data");
      }
    } catch (err: any) {
      toast.error("Scan failed: " + (err.message || "Unknown error"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label} *</label>
      {preview ? (
        <div className="space-y-2">
          <div className={cn(
            "relative rounded-lg border overflow-hidden",
            aspectSquare ? "aspect-square w-40 mx-auto" : "w-full"
          )}>
            <img
              src={preview}
              alt={label}
              className={cn(
                "object-cover",
                aspectSquare ? "w-full h-full aspect-square" : "w-full h-40"
              )}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
            {scanned && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Scanned
              </div>
            )}
          </div>
          {scannable && !aspectSquare && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={scanning}
              className="w-full"
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning CNIC...</>
              ) : scanned ? (
                <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Re-scan CNIC</>
              ) : (
                <><ScanLine className="w-4 h-4 mr-2" /> Scan CNIC & Auto-fill</>
              )}
            </Button>
          )}
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
            aspectSquare && "aspect-square w-40 mx-auto flex items-center justify-center",
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
                {aspectSquare ? (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {aspectSquare ? "Take or Upload Selfie" : "Drag & drop or click to upload"}
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
  const dobValue = form.watch("date_of_birth");
  const issueDateValue = form.watch("cnic_issue_date");

  useEffect(() => {
    if (issueDateValue) {
      const expiryDate = calculateCnicExpiry(issueDateValue);
      form.setValue("cnic_expiry_date", expiryDate);
    }
  }, [issueDateValue, form]);

  const ageValid = dobValue ? isAtLeast18(dobValue) : true;

  const handleCnicScanResult = (data: any) => {
    if (data.cnic_number) {
      form.setValue("cnic_number", formatCnic(data.cnic_number.replace(/\D/g, "")));
    }
    if (data.date_of_birth) {
      form.setValue("date_of_birth", data.date_of_birth);
    }
    if (data.date_of_issue) {
      form.setValue("cnic_issue_date", data.date_of_issue);
    }
    if (data.gender) {
      const g = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
      if (GENDER_OPTIONS.includes(g)) {
        form.setValue("gender", g);
      }
    }
    if (data.full_name) {
      // Optionally set name
    }
  };

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

      {/* AI Scan Info */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium">AI-Powered CNIC Scanning</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Upload your CNIC front image and click "Scan CNIC" to auto-fill your details
        </p>
      </div>

      {/* Selfie/Profile Photo */}
      <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h4 className="font-medium">Profile Photo / Live Selfie</h4>
        </div>
        <FormField
          control={form.control}
          name="selfie"
          render={({ field }) => (
            <FormItem>
              <FileUploadZone
                label="Your Selfie"
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.selfie?.message as string}
                aspectSquare
              />
              <FormDescription className="text-center mt-2">
                Take a clear selfie showing your face for verification
              </FormDescription>
            </FormItem>
          )}
        />
      </div>

      {/* Personal Identity Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
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
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
              </FormControl>
              {!ageValid && dobValue && (
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  You must be at least 18 years old
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
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

      {/* CNIC Date Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cnic_issue_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                CNIC Date of Issue *
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
              </FormControl>
              <FormDescription>
                As shown on your CNIC
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnic_expiry_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                CNIC Date of Expiry
              </FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  disabled 
                  className="bg-muted cursor-not-allowed"
                />
              </FormControl>
              <FormDescription>
                Auto-calculated (Issue + 10 years)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
                scannable
                onScanResult={handleCnicScanResult}
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
