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

// SEO disabled — component is a no-op stub.
const SEOHead = (_props: SEOHeadProps) => null;

export default SEOHead;
