import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const logos = [
  { name: "FANZON Icon (512px)", file: "/fanzon-icon-512.png", size: "512×512" },
  { name: "PWA Icon (192px)", file: "/pwa-192x192.png", size: "192×192" },
  { name: "PWA Icon (512px)", file: "/pwa-512x512.png", size: "512×512" },
  { name: "Favicon", file: "/favicon.ico", size: "ICO" },
];

const AdminBrandAssetsPage = () => {
  const handleDownload = (file: string, name: string) => {
    const link = document.createElement("a");
    link.href = file;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brand Assets</h1>
        <p className="text-muted-foreground">Download official FANZON logos and brand assets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {logos.map((logo) => (
          <Card key={logo.file}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{logo.name}</CardTitle>
              <CardDescription>{logo.size}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center bg-muted rounded-lg p-6">
                <img
                  src={logo.file}
                  alt={logo.name}
                  className="max-w-[128px] max-h-[128px] object-contain"
                />
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleDownload(logo.file, logo.name.replace(/\s/g, "-").toLowerCase())}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBrandAssetsPage;
