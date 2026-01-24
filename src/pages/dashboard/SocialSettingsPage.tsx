import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Music2, 
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
  Globe
} from "lucide-react";
import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const socialIcons: Record<string, React.ReactNode> = {
  social_facebook: <Facebook className="w-5 h-5" />,
  social_instagram: <Instagram className="w-5 h-5" />,
  social_twitter: <Twitter className="w-5 h-5" />,
  social_youtube: <Youtube className="w-5 h-5" />,
  social_tiktok: <Music2 className="w-5 h-5" />,
  social_whatsapp: <MessageCircle className="w-5 h-5" />,
};

const contactIcons: Record<string, React.ReactNode> = {
  contact_phone: <Phone className="w-5 h-5" />,
  contact_email: <Mail className="w-5 h-5" />,
  contact_address: <MapPin className="w-5 h-5" />,
};

const getLabel = (key: string): string => {
  const labels: Record<string, string> = {
    social_facebook: "Facebook",
    social_instagram: "Instagram",
    social_twitter: "Twitter / X",
    social_youtube: "YouTube",
    social_tiktok: "TikTok",
    social_whatsapp: "WhatsApp",
    contact_phone: "Phone Number",
    contact_email: "Email Address",
    contact_address: "Office Address",
  };
  return labels[key] || key;
};

const SocialSettingsPage = () => {
  const { settings, isLoading, updateSetting } = useSiteSettings();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<string[]>([]);

  const socialSettings = settings?.filter(s => s.setting_key.startsWith('social_')) || [];
  const contactSettings = settings?.filter(s => s.setting_key.startsWith('contact_')) || [];

  const handleToggle = async (setting: SiteSetting) => {
    setSavingKeys(prev => [...prev, setting.setting_key]);
    await updateSetting.mutateAsync({
      key: setting.setting_key,
      isEnabled: !setting.is_enabled,
    });
    setSavingKeys(prev => prev.filter(k => k !== setting.setting_key));
  };

  const handleSave = async (setting: SiteSetting) => {
    const newValue = editedValues[setting.setting_key];
    if (newValue === undefined || newValue === setting.setting_value) return;

    setSavingKeys(prev => [...prev, setting.setting_key]);
    await updateSetting.mutateAsync({
      key: setting.setting_key,
      value: newValue,
    });
    setEditedValues(prev => {
      const next = { ...prev };
      delete next[setting.setting_key];
      return next;
    });
    setSavingKeys(prev => prev.filter(k => k !== setting.setting_key));
  };

  const getValue = (setting: SiteSetting) => {
    return editedValues[setting.setting_key] ?? setting.setting_value ?? '';
  };

  const hasChanges = (setting: SiteSetting) => {
    return editedValues[setting.setting_key] !== undefined && 
           editedValues[setting.setting_key] !== setting.setting_value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Site Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage social media links and contact information displayed on the website
        </p>
      </div>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Facebook className="w-5 h-5 text-primary" />
            </div>
            Social Media Links
          </CardTitle>
          <CardDescription>
            Configure social media links. Toggle OFF to hide the icon from the website footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialSettings.map((setting) => (
            <div 
              key={setting.id} 
              className={cn(
                "p-4 rounded-lg border transition-colors",
                setting.is_enabled ? "bg-background" : "bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    setting.is_enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {socialIcons[setting.setting_key]}
                  </div>
                  <div>
                    <Label className="text-base font-medium">{getLabel(setting.setting_key)}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={setting.is_enabled ? "default" : "secondary"}>
                    {setting.is_enabled ? "Visible" : "Hidden"}
                  </Badge>
                  <Switch
                    checked={setting.is_enabled}
                    onCheckedChange={() => handleToggle(setting)}
                    disabled={savingKeys.includes(setting.setting_key)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`Enter ${getLabel(setting.setting_key)} URL`}
                  value={getValue(setting)}
                  onChange={(e) => setEditedValues(prev => ({
                    ...prev,
                    [setting.setting_key]: e.target.value
                  }))}
                  disabled={!setting.is_enabled}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSave(setting)}
                  disabled={!hasChanges(setting) || savingKeys.includes(setting.setting_key)}
                >
                  {savingKeys.includes(setting.setting_key) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            Contact Information
          </CardTitle>
          <CardDescription>
            Update official contact details displayed on Contact Us and footer sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactSettings.map((setting) => (
            <div 
              key={setting.id} 
              className={cn(
                "p-4 rounded-lg border transition-colors",
                setting.is_enabled ? "bg-background" : "bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    setting.is_enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {contactIcons[setting.setting_key]}
                  </div>
                  <div>
                    <Label className="text-base font-medium">{getLabel(setting.setting_key)}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={setting.is_enabled ? "default" : "secondary"}>
                    {setting.is_enabled ? "Visible" : "Hidden"}
                  </Badge>
                  <Switch
                    checked={setting.is_enabled}
                    onCheckedChange={() => handleToggle(setting)}
                    disabled={savingKeys.includes(setting.setting_key)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`Enter ${getLabel(setting.setting_key)}`}
                  value={getValue(setting)}
                  onChange={(e) => setEditedValues(prev => ({
                    ...prev,
                    [setting.setting_key]: e.target.value
                  }))}
                  disabled={!setting.is_enabled}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSave(setting)}
                  disabled={!hasChanges(setting) || savingKeys.includes(setting.setting_key)}
                >
                  {savingKeys.includes(setting.setting_key) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSettingsPage;
