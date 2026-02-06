import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const WhatsAppFloatingButton = () => {
  const { getSetting, isLoading } = useSiteSettings();
  const whatsappSetting = getSetting("social_whatsapp");

  if (isLoading || !whatsappSetting?.is_enabled || !whatsappSetting.setting_value) return null;

  const phone = whatsappSetting.setting_value.replace(/\D/g, "");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent("Hi FANZON Support! I need help.")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 left-4 z-50 bg-[#25D366] text-white rounded-full p-3.5 shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-105"
      aria-label="WhatsApp Support"
    >
      <MessageCircle size={22} fill="white" />
    </a>
  );
};

export default WhatsAppFloatingButton;
