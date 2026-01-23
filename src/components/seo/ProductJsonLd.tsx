import { Helmet } from "react-helmet-async";
import { DatabaseProduct } from "@/hooks/useProducts";

interface ProductJsonLdProps {
  product: DatabaseProduct;
  reviewCount?: number;
  averageRating?: number;
  baseUrl?: string;
}

const ProductJsonLd = ({
  product,
  reviewCount = 0,
  averageRating = 0,
  baseUrl = "https://fanzon.pk",
}: ProductJsonLdProps) => {
  const productUrl = `${baseUrl}/product/${product.slug || product.id}`;
  const productImage = product.images?.[0] || `${baseUrl}/placeholder.svg`;
  const displayPrice = product.discount_price_pkr || product.price_pkr;
  const availability = product.stock_count > 0 
    ? "https://schema.org/InStock" 
    : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: productImage,
    description: product.description || `Buy ${product.title} at the best price in Pakistan. Fast delivery, Cash on Delivery available.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "FANZON",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: displayPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability,
      seller: {
        "@type": "Organization",
        name: "FANZON Pakistan",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default ProductJsonLd;
