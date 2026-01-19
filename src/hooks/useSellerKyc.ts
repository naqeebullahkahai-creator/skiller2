import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SellerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  legal_name: string;
  business_address: string;
  city: string;
  cnic_number: string;
  cnic_front_url: string | null;
  cnic_back_url: string | null;
  bank_name: string;
  account_title: string;
  iban: string;
  bank_cheque_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  submitted_at: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycFormData {
  // Step 1: Business Info
  shop_name: string;
  legal_name: string;
  business_address: string;
  city: string;
  // Step 2: Identity
  cnic_number: string;
  cnic_front: File | null;
  cnic_back: File | null;
  // Step 3: Banking
  bank_name: string;
  account_title: string;
  iban: string;
  bank_cheque: File | null;
}

export const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Mardan', 'Kasur',
  'Mingora', 'Dera Ghazi Khan', 'Sahiwal', 'Gujrat', 'Okara'
];

export const PAKISTAN_BANKS = [
  'Habib Bank Limited (HBL)',
  'United Bank Limited (UBL)',
  'Meezan Bank',
  'Allied Bank Limited (ABL)',
  'MCB Bank',
  'Bank Alfalah',
  'Standard Chartered Pakistan',
  'Faysal Bank',
  'Askari Bank',
  'Bank of Punjab',
  'JS Bank',
  'Soneri Bank',
  'Summit Bank',
  'Silk Bank',
  'Dubai Islamic Bank Pakistan',
  'Bank Islami Pakistan',
  'Easypaisa (Telenor Microfinance Bank)',
  'JazzCash (Mobilink Microfinance Bank)'
];

export const useSellerKyc = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sellerProfile, isLoading, refetch } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as SellerProfile | null;
    },
    enabled: !!user?.id,
  });

  const uploadDocument = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('seller-docs')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
    
    // Get signed URL for private bucket
    const { data: signedData } = await supabase.storage
      .from('seller-docs')
      .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year

    return signedData?.signedUrl || data.path;
  };

  const submitKyc = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Upload documents
      let cnic_front_url = null;
      let cnic_back_url = null;
      let bank_cheque_url = null;

      if (formData.cnic_front) {
        const ext = formData.cnic_front.name.split('.').pop();
        cnic_front_url = await uploadDocument(
          formData.cnic_front, 
          `${user.id}/cnic_front.${ext}`
        );
      }

      if (formData.cnic_back) {
        const ext = formData.cnic_back.name.split('.').pop();
        cnic_back_url = await uploadDocument(
          formData.cnic_back, 
          `${user.id}/cnic_back.${ext}`
        );
      }

      if (formData.bank_cheque) {
        const ext = formData.bank_cheque.name.split('.').pop();
        bank_cheque_url = await uploadDocument(
          formData.bank_cheque, 
          `${user.id}/bank_cheque.${ext}`
        );
      }

      // Insert seller profile
      const { data, error } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
          shop_name: formData.shop_name,
          legal_name: formData.legal_name,
          business_address: formData.business_address,
          city: formData.city,
          cnic_number: formData.cnic_number,
          cnic_front_url,
          cnic_back_url,
          bank_name: formData.bank_name,
          account_title: formData.account_title,
          iban: formData.iban,
          bank_cheque_url,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('KYC submitted successfully! Your application is under review.');
      queryClient.invalidateQueries({ queryKey: ['seller-profile', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit KYC: ${error.message}`);
    },
  });

  const isVerified = sellerProfile?.verification_status === 'verified';
  const isPending = sellerProfile?.verification_status === 'pending';
  const isRejected = sellerProfile?.verification_status === 'rejected';
  const hasSubmittedKyc = !!sellerProfile;

  return {
    sellerProfile,
    isLoading,
    isVerified,
    isPending,
    isRejected,
    hasSubmittedKyc,
    submitKyc,
    refetch,
  };
};
