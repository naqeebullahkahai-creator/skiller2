import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Wallet, TrendingUp, Download, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { useAdminWallet } from "@/hooks/useAdminWallet";
import { formatPKR } from "@/hooks/useSellerWallet";
import { format } from "date-fns";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const AdminWalletPage = () => {
  const { wallet, walletLoading, transactions, txnLoading, setPin, verifyPin, exportCSV, isPinSet } = useAdminWallet();
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleVerify = async () => {
    const result = await verifyPin.mutateAsync(pinInput);
    if (result) { setPinVerified(true); setPinInput(""); }
    else { setPinInput(""); }
  };

  // Show error state for wrong PIN
  const pinVerifyFailed = verifyPin.isSuccess && verifyPin.data === false;

  const handleSetPin = async () => {
    if (newPin.length < 4 || newPin !== confirmPin) return;
    await setPin.mutateAsync(newPin);
    setShowSetPin(false);
    setNewPin("");
    setConfirmPin("");
    setPinVerified(true);
  };

  if (walletLoading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // PIN Gate
  if (isPinSet && !pinVerified) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Admin Wallet</CardTitle>
            <CardDescription>Enter your PIN to access the financial dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={pinInput} onChange={setPinInput}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {verifyPin.isError && <p className="text-sm text-destructive text-center">Invalid PIN</p>}
            <Button className="w-full" onClick={handleVerify} disabled={pinInput.length < 4 || verifyPin.isPending}>
              {verifyPin.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Verify
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Set PIN prompt if not set
  if (!isPinSet && !pinVerified) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <KeyRound className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Set Wallet PIN</CardTitle>
            <CardDescription>Create a 4-6 digit PIN to secure your financial dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">New PIN</label>
              <Input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Enter 4-6 digit PIN" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm PIN</label>
              <Input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Re-enter PIN" className="mt-1" />
            </div>
            {newPin.length >= 4 && confirmPin.length >= 4 && newPin !== confirmPin && (
              <p className="text-sm text-destructive">PINs don't match</p>
            )}
            <Button className="w-full" onClick={handleSetPin} disabled={newPin.length < 4 || newPin !== confirmPin || setPin.isPending}>
              {setPin.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              Set PIN & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Wallet</h1>
          <p className="text-muted-foreground">Platform earnings & financial overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!transactions?.length}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSetPin(true)}>
            <KeyRound className="w-4 h-4 mr-2" />Change PIN
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80">Total Balance</p>
                <p className="text-3xl font-bold mt-1">{formatPKR(wallet?.total_balance || 0)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg"><Wallet className="w-8 h-8" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Subscription Earnings</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatPKR(wallet?.total_subscription_earnings || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">From seller platform fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Commission Earnings</p>
            <p className="text-2xl font-bold mt-1">{formatPKR(wallet?.total_commission_earnings || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Future commission system</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {txnLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !transactions?.length ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-1.5">
              {transactions.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5 capitalize">{txn.transaction_type.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(txn.created_at), 'dd MMM yyyy HH:mm')}</span>
                    </div>
                    {txn.description && <p className="text-xs text-muted-foreground mt-1">{txn.description}</p>}
                  </div>
                  <span className="font-semibold text-green-600">+{formatPKR(txn.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change PIN Dialog */}
      <Dialog open={showSetPin} onOpenChange={setShowSetPin}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Wallet PIN</DialogTitle>
            <DialogDescription>Enter a new 4-6 digit PIN</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN" />
            <Input type="password" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm PIN" />
          </div>
          <DialogFooter>
            <Button onClick={handleSetPin} disabled={newPin.length < 4 || newPin !== confirmPin || setPin.isPending}>
              {setPin.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWalletPage;
