import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  area: string | null;
  full_address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  full_name: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  full_address: string;
  is_default: boolean;
}

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha"],
  "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Dera Ismail Khan"],
  "Balochistan": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Hub"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Azad Kashmir": ["Muzaffarabad", "Mirpur", "Rawalakot", "Kotli"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza"],
};

export { PROVINCES, CITIES_BY_PROVINCE };

export const useUserAddresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (addressData: AddressFormData): Promise<UserAddress | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .insert([{
          user_id: user.id,
          full_name: addressData.full_name,
          phone: addressData.phone,
          province: addressData.province,
          city: addressData.city,
          area: addressData.area || null,
          full_address: addressData.full_address,
          is_default: addressData.is_default || addresses.length === 0, // First address is default
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved successfully.",
      });

      await fetchAddresses();
      return data;
    } catch (err: any) {
      console.error("Error adding address:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save address",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAddress = async (id: string, addressData: Partial<AddressFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_addresses")
        .update(addressData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Address Updated",
        description: "Your address has been updated successfully.",
      });

      await fetchAddresses();
      return true;
    } catch (err: any) {
      console.error("Error updating address:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update address",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Address Deleted",
        description: "Your address has been removed.",
      });

      await fetchAddresses();
      return true;
    } catch (err: any) {
      console.error("Error deleting address:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete address",
        variant: "destructive",
      });
      return false;
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    return updateAddress(id, { is_default: true });
  };

  const getDefaultAddress = (): UserAddress | null => {
    return addresses.find((a) => a.is_default) || addresses[0] || null;
  };

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    refetch: fetchAddresses,
  };
};
