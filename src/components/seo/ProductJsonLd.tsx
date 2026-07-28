import { DatabaseProduct } from "@/hooks/useProducts";

interface ProductJsonLdProps {
  product: DatabaseProduct;
  reviewCount?: number;
  averageRating?: number;
  baseUrl?: string;
}

const ProductJsonLd = (_props: ProductJsonLdProps) => null;

export default ProductJsonLd;
