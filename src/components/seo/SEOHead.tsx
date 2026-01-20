import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock";
  category?: string;
}

const BASE_URL = "https://fanzon.pk";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = "website",
  price,
  currency = "PKR",
  availability,
  category,
}: SEOHeadProps) => {
  const pageTitle = title
    ? `${title} | FANZON Pakistan`
    : "FANZON - Pakistan's Premium Multi-Vendor Store";

  const pageDescription =
    description ||
    "Shop authentic products at FANZON Pakistan. Best prices in PKR, Cash on Delivery, Easy Returns!";

  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type === "product" ? "product" : "website"} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FANZON" />
      <meta property="og:locale" content="en_PK" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Product-specific meta tags */}
      {type === "product" && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {availability && (
            <meta property="product:availability" content={availability} />
          )}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
    </Helmet>
  );
};

export default SEOHead;
