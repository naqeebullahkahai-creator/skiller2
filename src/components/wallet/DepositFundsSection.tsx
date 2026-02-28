import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Loader2,
  Upload,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ScanLine,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePaymentMethods,
  useUserDepositRequests,
  useDepositFeatureEnabled,
  PaymentMethod,
} from "@/hooks/useDeposits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DepositFundsSectionProps {
  requesterType: 'customer' | 'seller';
  formatCurrency: (amount: number) => string;
}

const DepositFundsSection = ({ requesterType, formatCurrency }: DepositFundsSectionProps) => {
  const { user } = useAuth();
  const { data: isEnabled, isLoading: checkingEnabled } = useDepositFeatureEnabled();
  const { data: paymentMethods, isLoading: loadingMethods } = usePaymentMethods();
  const { depositRequests, isLoading: loadingRequests, createDeposit } = useUserDepositRequests(requesterType);
  
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const activePaymentMethods = paymentMethods?.filter(m => m.is_active) || [];

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setScanResult(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('deposit-screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from('deposit-screenshots')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      setScreenshotUrl(signedData?.signedUrl || filePath);
      setScreenshotFile(file);
      toast.success('Screenshot uploaded');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleScanScreenshot = async () => {
    if (!screenshotFile) return;
    setScanning(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(screenshotFile);
      });

      const { data, error } = await supabase.functions.invoke("scan-image", {
        body: { 
          imageUrl: dataUrl, 
          scanType: "deposit_screenshot",
          transactionReference: transactionRef || null,
        },
      });

      if (error) throw error;
      if (data?.success && data?.data) {
        setScanResult(data.data);
        
        // Auto-fill amount if detected and not already entered
        if (data.data.extracted_amount && !amount) {
          setAmount(String(data.data.extracted_amount));
        }
        // Auto-fill reference if detected and not already entered
        if (data.data.extracted_reference && !transactionRef) {
          setTransactionRef(data.data.extracted_reference);
        }
        
        toast.success("Screenshot analyzed successfully!");
      } else {
        toast.error(data?.error || "Could not analyze screenshot");
      }
    } catch (err: any) {
      toast.error("Scan failed: " + (err.message || "Unknown error"));
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !amount || !screenshotUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await createDeposit.mutateAsync({
      paymentMethodId: selectedMethod.id,
      amount: amountNum,
      screenshotUrl,
      transactionReference: transactionRef || undefined,
    });

    setShowDialog(false);
    setSelectedMethod(null);
    setAmount('');
    setTransactionRef('');
    setScreenshotUrl('');
    setScreenshotFile(null);
    setScanResult(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (checkingEnabled || loadingMethods) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isEnabled) return null;
  if (activePaymentMethods.length === 0) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                Deposit Funds
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add funds to your wallet via bank transfer or mobile wallet
              </p>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Make Deposit
            </Button>
          </div>
        </CardContent>
      </Card>

      {depositRequests && depositRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{request.payment_methods?.method_name || 'Unknown'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(request.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{request.transaction_reference || '-'}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Deposit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setScanResult(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Select a payment method, transfer the funds, and upload proof of payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Select Payment Method */}
            <div className="space-y-3">
              <Label className="text-base font-medium">1. Select Payment Method</Label>
              <RadioGroup
                value={selectedMethod?.id || ''}
                onValueChange={(value) => {
                  const method = activePaymentMethods.find(m => m.id === value);
                  setSelectedMethod(method || null);
                }}
              >
                <div className="grid gap-3">
                  {activePaymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedMethod?.id === method.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                    >
                      <RadioGroupItem value={method.id} />
                      {method.logo_url ? (
                        <img src={method.logo_url} alt={method.method_name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{method.method_name}</p>
                        <p className="text-sm text-muted-foreground">{method.account_name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Step 2: Payment Details */}
            {selectedMethod && (
              <div className="space-y-3">
                <Label className="text-base font-medium">2. Transfer to These Details</Label>
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Name</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedMethod.account_name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(selectedMethod.account_name, 'name')}>
                        {copiedField === 'name' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  {selectedMethod.account_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{selectedMethod.account_number}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(selectedMethod.account_number!, 'account')}>
                          {copiedField === 'account' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.iban && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IBAN</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{selectedMethod.iban}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(selectedMethod.iban!, 'iban')}>
                          {copiedField === 'iban' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.till_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Till ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{selectedMethod.till_id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(selectedMethod.till_id!, 'till')}>
                          {copiedField === 'till' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Amount */}
            <div className="space-y-2">
              <Label className="text-base font-medium">3. Enter Amount (PKR) *</Label>
              <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" />
            </div>

            {/* Step 4: Transaction Reference */}
            <div className="space-y-2">
              <Label>Transaction Reference (Optional)</Label>
              <Input placeholder="e.g., TXN123456789" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
            </div>

            {/* Step 5: Upload Screenshot */}
            <div className="space-y-2">
              <Label className="text-base font-medium">4. Upload Payment Screenshot *</Label>
              <div className="flex items-center gap-4">
                {screenshotUrl && (
                  <img src={screenshotUrl} alt="Screenshot preview" className="w-20 h-20 object-cover rounded border" />
                )}
                <label className="cursor-pointer flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg hover:bg-muted transition-colors">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {screenshotUrl ? 'Change Screenshot' : 'Upload Screenshot'}
                        </span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {/* AI Scan Button */}
              {screenshotUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleScanScreenshot} disabled={scanning} className="w-full mt-2">
                  {scanning ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Screenshot...</>
                  ) : (
                    <><ScanLine className="w-4 h-4 mr-2" /> Verify Screenshot with AI</>
                  )}
                </Button>
              )}

              {/* Scan Results */}
              {scanResult && (
                <div className="mt-3 p-3 rounded-lg border space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    AI Verification Results
                  </div>
                  
                  {scanResult.extracted_amount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detected Amount:</span>
                      <span className="font-medium">Rs. {scanResult.extracted_amount}</span>
                    </div>
                  )}
                  {scanResult.extracted_reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detected Ref:</span>
                      <span className="font-mono text-xs">{scanResult.extracted_reference}</span>
                    </div>
                  )}
                  {scanResult.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment App:</span>
                      <span>{scanResult.payment_method}</span>
                    </div>
                  )}
                  {scanResult.status && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={scanResult.status === 'successful' ? 'default' : 'destructive'} className={scanResult.status === 'successful' ? 'bg-green-500' : ''}>
                        {scanResult.status}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Reference Match Check */}
                  {transactionRef && scanResult.reference_match !== undefined && (
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded mt-2",
                      scanResult.reference_match ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"
                    )}>
                      {scanResult.reference_match ? (
                        <><CheckCircle2 className="w-4 h-4" /> Reference number matches screenshot</>
                      ) : (
                        <><AlertTriangle className="w-4 h-4" /> Reference number does NOT match screenshot</>
                      )}
                    </div>
                  )}

                  {/* Amount mismatch warning */}
                  {scanResult.extracted_amount && amount && Math.abs(scanResult.extracted_amount - parseFloat(amount)) > 1 && (
                    <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      Amount mismatch! You entered Rs. {amount} but screenshot shows Rs. {scanResult.extracted_amount}
                    </div>
                  )}

                  {scanResult.confidence && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Confidence: {scanResult.confidence}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createDeposit.isPending || !selectedMethod || !amount || !screenshotUrl}
            >
              {createDeposit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Deposit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepositFundsSection;
