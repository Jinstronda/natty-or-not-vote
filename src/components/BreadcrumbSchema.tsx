import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  customBreadcrumbs?: BreadcrumbItem[];
  showVisual?: boolean;
}

const BreadcrumbSchema = ({ customBreadcrumbs, showVisual = false }: BreadcrumbSchemaProps) => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: `${baseUrl}/` }
    ];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      breadcrumbs.push({
        name,
        url: `${baseUrl}${currentPath}`
      });
    });

    return breadcrumbs;
  };

  useEffect(() => {
    const breadcrumbs = generateBreadcrumbs();
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    // Remove existing breadcrumb schema
    const existingScript = document.querySelector('script[data-breadcrumb-schema="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new breadcrumb schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb-schema', 'true');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const cleanup = document.querySelector('script[data-breadcrumb-schema="true"]');
      if (cleanup) cleanup.remove();
    };
  }, [location.pathname, customBreadcrumbs]);

  if (!showVisual) return null;

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={item.url} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-3 h-3 mx-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{item.name}</span>
            ) : (
              <a
                href={item.url}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbSchema; 