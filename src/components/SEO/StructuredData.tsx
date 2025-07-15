import { useEffect } from 'react';

export interface StructuredDataProps {
  type: string;
  data: any;
  id?: string;
}

export const StructuredData = ({ type, data, id }: StructuredDataProps) => {
  useEffect(() => {
    // Create unique identifier for this structured data
    const dataId = id || `structured-data-${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Remove existing structured data script with the same ID
    const existingScript = document.querySelector(`script[data-structured-data="${dataId}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', dataId);
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    });
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(`script[data-structured-data="${dataId}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data, id]);

  return null; // This component doesn't render anything visible
};