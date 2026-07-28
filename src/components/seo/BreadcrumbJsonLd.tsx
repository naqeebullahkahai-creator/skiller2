interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

const BreadcrumbJsonLd = (_props: BreadcrumbJsonLdProps) => null;

export default BreadcrumbJsonLd;
