import { useActiveProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecommendedProductsProps {
  excludeProductId?: string;
  limit?: number;
}

const RecommendedProducts = ({ excludeProductId, limit = 6 }: RecommendedProductsProps) => {
  const { t } = useLanguage();
  const { products, isLoading } = useActiveProducts(limit + 1);

  if (isLoading) return null;

  const recommended = products
    .filter((p) => p.id !== excludeProductId)
    .slice(0, limit);

  if (recommended.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">{t("search.recommended")}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
