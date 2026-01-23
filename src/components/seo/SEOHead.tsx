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
  keywords?: string;
  noindex?: boolean;
}

const BASE_URL = "https://fanzon.pk";
const DEFAULT_IMAGE = `${BASE_URL}/pwa-512x512.png`;

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
  keywords,
  noindex = false,
}: SEOHeadProps) => {
  const pageTitle = title
    ? `${title} | FANZON Pakistan`
    : "FANZON - Pakistan's Premium Multi-Vendor Store";

  const pageDescription =
    description ||
    "Shop authentic products at FANZON Pakistan. Best prices in PKR, Cash on Delivery, Easy Returns!";

  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  
  const defaultKeywords = "online shopping pakistan, cash on delivery, electronics pakistan, fashion pakistan, FANZON";
  const pageKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
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

      {/* Product meta tags */}
      {type === "product" && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {availability && <meta property="product:availability" content={availability} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large"} />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
    </Helmet>
  );
};

export default SEOHead;
