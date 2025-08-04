import Script from 'next/script';

interface StructuredDataProps {
  data: object;
  id?: string;
}

/**
 * Component for adding JSON-LD structured data to pages
 */
export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script
      id={id || 'structured-data'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
