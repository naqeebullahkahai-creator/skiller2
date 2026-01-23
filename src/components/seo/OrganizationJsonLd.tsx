import { Helmet } from "react-helmet-async";

interface OrganizationJsonLdProps {
  baseUrl?: string;
}

const OrganizationJsonLd = ({ baseUrl = "https://fanzon.pk" }: OrganizationJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FANZON Pakistan",
    alternateName: "FANZON",
    url: baseUrl,
    logo: `${baseUrl}/pwa-512x512.png`,
    description: "Pakistan's Premium Multi-Vendor Store. Shop authentic products with Cash on Delivery.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: [
      "https://facebook.com/fanzon.pk",
      "https://instagram.com/fanzon.pk",
      "https://twitter.com/fanzon_pk",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FANZON",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </script>
    </Helmet>
  );
};

export default OrganizationJsonLd;
