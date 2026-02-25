import { useParams } from "react-router-dom";
import { useCampaigns, useCampaignProducts } from "@/hooks/useCampaigns";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import SEOHead from "@/components/seo/SEOHead";

const CampaignPage = () => {
  const { slug } = useParams();
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find((c: any) => c.slug === slug);
  const { data: products = [], isLoading } = useCampaignProducts(campaign?.id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Campaign not found</h1>
            <p className="text-muted-foreground">This campaign may have ended.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`${campaign.title} - FANZON`} description={campaign.description || ""} url={`/campaign/${slug}`} />
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Banner */}
          {campaign.banner_image_url && (
            <div className="w-full aspect-[3/1] md:aspect-[4/1] overflow-hidden">
              <img src={campaign.banner_image_url} alt={campaign.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold" style={{ color: campaign.theme_color }}>{campaign.title}</h1>
              {campaign.discount_label && <p className="text-xl font-semibold text-destructive mt-1">{campaign.discount_label}</p>}
              {campaign.description && <p className="text-muted-foreground mt-2">{campaign.description}</p>}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><FanzonSpinner size="lg" /></div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No products in this campaign yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((item: any) => item.products && (
                  <ProductCard key={item.id} product={item.products} />
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CampaignPage;
