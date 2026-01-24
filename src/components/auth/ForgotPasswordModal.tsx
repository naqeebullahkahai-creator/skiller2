import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: "customer" | "seller";
}

const ForgotPasswordModal = ({ open, onOpenChange, userType }: ForgotPasswordModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      emailSchema.parse(email);
      setError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Invalid email");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the reset URL based on user type
      const redirectUrl = `${window.location.origin}/reset-password`;

      // Use Supabase's built-in password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        toast({
          title: "Error",
          description: resetError.message,
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        
        // Also send our custom styled email via edge function
        try {
          await supabase.functions.invoke("send-password-reset", {
            body: {
              email,
              resetUrl: redirectUrl,
              userType,
            },
          });
        } catch (emailError) {
          // Silently fail the custom email - Supabase's built-in email is the backup
          console.log("Custom email failed, but Supabase email was sent");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Check Your Email</DialogTitle>
              <DialogDescription className="text-center pt-2">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. 
                Please check your inbox and spam folder.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground">
                The link will expire in 1 hour for your security.
              </p>
              <Button onClick={handleClose} variant="outline" className="w-full gap-2">
                <ArrowLeft size={16} />
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reset Your Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  {userType === "seller" ? "Business Email" : "Email Address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={userType === "seller" ? "seller@business.com" : "you@example.com"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={cn(
                      "pl-10 h-12 text-base bg-muted/50 border-border focus:bg-background transition-colors",
                      error && "border-destructive focus:ring-destructive"
                    )}
                  />
                </div>
                {error && <p className="text-destructive text-xs">{error}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
