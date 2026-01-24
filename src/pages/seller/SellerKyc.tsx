import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import KycStepper from "@/components/seller/KycStepper";
import KycStep1Business from "@/components/seller/KycStep1Business";
import KycStep2Identity from "@/components/seller/KycStep2Identity";
import KycStep3Banking from "@/components/seller/KycStep3Banking";
import VerificationPending from "@/components/seller/VerificationPending";
import { useSellerKyc, KycFormData, isAtLeast18, calculateCnicExpiry } from "@/hooks/useSellerKyc";

const step1Schema = z.object({
  shop_name: z.string().min(2, "Shop name must be at least 2 characters"),
  legal_name: z.string().min(3, "Legal name must be at least 3 characters"),
  father_husband_name: z.string().min(3, "Father/Husband name is required"),
  city: z.string().min(1, "Please select a city"),
  business_address: z.string().min(10, "Please enter a complete address"),
  ntn_number: z.string().optional(),
  emergency_contact_name: z.string().min(2, "Emergency contact name is required"),
  emergency_contact_phone: z.string().regex(/^\d{4}-\d{7}$/, "Phone must be in format 03XX-XXXXXXX"),
});

const step2Schema = z.object({
  gender: z.string().min(1, "Please select a gender"),
  date_of_birth: z.string().min(1, "Date of birth is required").refine(
    (val) => isAtLeast18(val),
    "You must be at least 18 years old"
  ),
  cnic_number: z
    .string()
    .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format 00000-0000000-0"),
  cnic_issue_date: z.string().min(1, "CNIC issue date is required"),
  cnic_expiry_date: z.string(),
  cnic_front: z.custom<File>((val) => val instanceof File, "CNIC front image is required"),
  cnic_back: z.custom<File>((val) => val instanceof File, "CNIC back image is required"),
  selfie: z.custom<File>((val) => val instanceof File, "Profile selfie is required"),
});

const step3Schema = z.object({
  bank_name: z.string().min(1, "Please select a bank"),
  account_title: z.string().min(3, "Account title must be at least 3 characters"),
  iban: z
    .string()
    .length(24, "IBAN must be exactly 24 characters")
    .regex(/^PK/, "IBAN must start with PK"),
  bank_cheque: z.custom<File | null>().optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

const steps = [
  { title: "Business Info", description: "Shop & personal details" },
  { title: "Identity", description: "CNIC verification" },
  { title: "Banking", description: "Payment details" },
];

const SellerKyc = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { sellerProfile, isLoading, hasSubmittedKyc, submitKyc } = useSellerKyc();

  const form = useForm<KycFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      shop_name: "",
      legal_name: "",
      father_husband_name: "",
      business_address: "",
      city: "",
      ntn_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      gender: "",
      date_of_birth: "",
      cnic_number: "",
      cnic_issue_date: "",
      cnic_expiry_date: "",
      cnic_front: null,
      cnic_back: null,
      selfie: null,
      bank_name: "",
      account_title: "",
      iban: "",
      bank_cheque: null,
    },
    mode: "onChange",
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof KycFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "shop_name", "legal_name", "father_husband_name", 
          "city", "business_address", "emergency_contact_name", "emergency_contact_phone"
        ];
        break;
      case 2:
        fieldsToValidate = ["gender", "date_of_birth", "cnic_number", "cnic_issue_date", "cnic_front", "cnic_back", "selfie"];
        break;
      case 3:
        fieldsToValidate = ["bank_name", "account_title", "iban"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: KycFormData) => {
    // Ensure expiry date is calculated
    if (data.cnic_issue_date) {
      data.cnic_expiry_date = calculateCnicExpiry(data.cnic_issue_date);
    }
    await submitKyc.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending state if KYC already submitted
  if (hasSubmittedKyc && sellerProfile) {
    return <VerificationPending sellerProfile={sellerProfile} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Seller Verification
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Complete your KYC to start selling on FANZON
          </p>
        </CardHeader>

        <CardContent>
          {/* Stepper */}
          <div className="mb-8">
            <KycStepper currentStep={currentStep} steps={steps} />
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {currentStep === 1 && <KycStep1Business form={form} />}
              {currentStep === 2 && <KycStep2Identity form={form} />}
              {currentStep === 3 && <KycStep3Banking form={form} />}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitKyc.isPending}
                    className="min-w-[120px]"
                  >
                    {submitKyc.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit KYC"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerKyc;
