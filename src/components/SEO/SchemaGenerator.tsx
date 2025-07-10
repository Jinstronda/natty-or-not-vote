import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { validateSchema, SchemaMarkup, ValidationResult } from '@/utils/seo/schemaValidator';
import { StructuredData } from './StructuredData';

/**
 * Dynamic Schema Generator Component
 * Generates, caches, and validates JSON-LD schemas with preview capabilities
 */

interface SchemaGeneratorProps {
  type: 'Person' | 'Review' | 'FAQPage' | 'WebSite' | 'Organization' | 'Article' | 'Product' | 'BreadcrumbList' | 'LocalBusiness';
  data: any;
  autoValidate?: boolean;
  enableCaching?: boolean;
  enablePreview?: boolean;
  onValidation?: (result: ValidationResult) => void;
  onSchemaGenerated?: (schema: any) => void;
  children?: React.ReactNode;
}

interface SchemaCache {
  [key: string]: {
    schema: any;
    timestamp: number;
    validation: ValidationResult;
  };
}

// Global schema cache
const schemaCache: SchemaCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const SchemaGenerator: React.FC<SchemaGeneratorProps> = ({
  type,
  data,
  autoValidate = true,
  enableCaching = true,
  enablePreview = false,
  onValidation,
  onSchemaGenerated,
  children
}) => {
  const [schema, setSchema] = useState<any>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(enablePreview);

  // Generate cache key
  const cacheKey = useMemo(() => {
    return `${type}_${JSON.stringify(data)}`.replace(/\s+/g, '');
  }, [type, data]);

  // Check if schema is in cache
  const getCachedSchema = useCallback(() => {
    if (!enableCaching) return null;
    
    const cached = schemaCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    
    return null;
  }, [cacheKey, enableCaching]);

  // Cache schema
  const cacheSchema = useCallback((generatedSchema: any, validationResult: ValidationResult) => {
    if (!enableCaching) return;
    
    schemaCache[cacheKey] = {
      schema: generatedSchema,
      timestamp: Date.now(),
      validation: validationResult
    };
  }, [cacheKey, enableCaching]);

  // Generate schema based on type
  const generateSchema = useCallback((schemaType: string, inputData: any): any => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType
    };

    switch (schemaType) {
      case 'Person':
        return generatePersonSchema(inputData, baseSchema);
      case 'Review':
        return generateReviewSchema(inputData, baseSchema);
      case 'FAQPage':
        return generateFAQPageSchema(inputData, baseSchema);
      case 'WebSite':
        return generateWebSiteSchema(inputData, baseSchema);
      case 'Organization':
        return generateOrganizationSchema(inputData, baseSchema);
      case 'Article':
        return generateArticleSchema(inputData, baseSchema);
      case 'Product':
        return generateProductSchema(inputData, baseSchema);
      case 'BreadcrumbList':
        return generateBreadcrumbSchema(inputData, baseSchema);
      case 'LocalBusiness':
        return generateLocalBusinessSchema(inputData, baseSchema);
      default:
        return { ...baseSchema, ...inputData };
    }
  }, []);

  // Main schema generation and validation effect
  useEffect(() => {
    const generateAndValidateSchema = async () => {
      if (!data || !type) return;

      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = getCachedSchema();
        if (cached) {
          setSchema(cached.schema);
          setValidation(cached.validation);
          setIsLoading(false);
          
          if (onValidation) onValidation(cached.validation);
          if (onSchemaGenerated) onSchemaGenerated(cached.schema);
          return;
        }

        // Generate new schema
        const generatedSchema = generateSchema(type, data);
        setSchema(generatedSchema);

        // Validate if auto-validate is enabled
        let validationResult: ValidationResult | null = null;
        if (autoValidate) {
          const schemaMarkup: SchemaMarkup = {
            type,
            data: generatedSchema
          };
          validationResult = await validateSchema(schemaMarkup);
          setValidation(validationResult);
        }

        // Cache the result
        if (validationResult) {
          cacheSchema(generatedSchema, validationResult);
        }

        // Call callbacks
        if (onValidation && validationResult) {
          onValidation(validationResult);
        }
        if (onSchemaGenerated) {
          onSchemaGenerated(generatedSchema);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate schema';
        setError(errorMessage);
        console.error('Schema generation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generateAndValidateSchema();
  }, [type, data, autoValidate, getCachedSchema, cacheSchema, generateSchema, onValidation, onSchemaGenerated]);

  // Render preview if enabled
  const renderPreview = () => {
    if (!showPreview || !schema) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Schema Preview</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
        
        {validation && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Validation:</span>
              <span className={`text-sm px-2 py-1 rounded ${
                validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </span>
              <span className="text-sm text-gray-600">
                Score: {validation.score}/100
              </span>
            </div>
            
            {validation.errors.length > 0 && (
              <div className="text-sm text-red-600">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside ml-2">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="text-sm text-yellow-600">
                <strong>Warnings:</strong>
                <ul className="list-disc list-inside ml-2">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        Generating schema...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        Schema Error: {error}
      </div>
    );
  }

  // Render the actual structured data and optional preview
  return (
    <>
      {schema && <StructuredData data={schema} id={`generated-${type.toLowerCase()}`} />}
      {renderPreview()}
      {children}
    </>
  );
};

// Schema generation functions

function generatePersonSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    name: data.name,
    description: data.description,
    image: data.image,
    url: data.url,
    jobTitle: data.jobTitle || 'Fitness Influencer',
    knowsAbout: data.knowsAbout || ['Fitness', 'Bodybuilding'],
    sameAs: data.sameAs?.filter(Boolean) || [],
    height: data.height,
    weight: data.weight,
    additionalProperty: data.additionalProperty?.filter(Boolean) || [],
    mainEntityOfPage: data.mainEntityOfPage,
    audience: data.audience,
    affiliation: data.affiliation
  };
}

function generateReviewSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    author: data.author,
    datePublished: data.datePublished,
    reviewBody: data.reviewBody,
    reviewRating: data.reviewRating,
    itemReviewed: data.itemReviewed,
    additionalProperty: data.additionalProperty
  };
}

function generateFAQPageSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    mainEntity: data.mainEntity?.map((item: any) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.acceptedAnswer?.text || item.answer
      }
    })) || []
  };
}

function generateWebSiteSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: data.potentialAction
  };
}

function generateOrganizationSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs?.filter(Boolean) || [],
    contactPoint: data.contactPoint,
    address: data.address
  };
}

function generateArticleSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    headline: data.headline || data.title,
    description: data.description,
    author: data.author,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    image: data.image,
    url: data.url,
    wordCount: data.wordCount,
    publisher: data.publisher,
    mainEntityOfPage: data.mainEntityOfPage,
    articleSection: data.articleSection,
    keywords: data.keywords
  };
}

function generateProductSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    name: data.name,
    description: data.description,
    image: data.image,
    url: data.url,
    category: data.category,
    brand: data.brand,
    aggregateRating: data.aggregateRating,
    review: data.review,
    offers: data.offers
  };
}

function generateBreadcrumbSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    itemListElement: data.itemListElement?.map((item: any) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.item || item.url
    })) || []
  };
}

function generateLocalBusinessSchema(data: any, baseSchema: any): any {
  return {
    ...baseSchema,
    name: data.name,
    description: data.description,
    address: data.address,
    telephone: data.telephone,
    email: data.email,
    url: data.url,
    openingHours: data.openingHours,
    priceRange: data.priceRange,
    '@id': data.url,
    additionalType: data.additionalType,
    areaServed: data.areaServed
  };
}

// Utility components

export const SchemaPreview: React.FC<{ schema: any; validation?: ValidationResult }> = ({ 
  schema, 
  validation 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Schema Preview</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      )}
      
      {validation && (
        <div className="mt-2 text-sm">
          <span className={`px-2 py-1 rounded ${
            validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {validation.isValid ? 'Valid' : 'Invalid'} - Score: {validation.score}/100
          </span>
        </div>
      )}
    </div>
  );
};

export const SchemaDebugger: React.FC<{ schemas: any[] }> = ({ schemas }) => {
  const [selectedSchema, setSelectedSchema] = useState(0);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Schema Debugger</h3>
      
      <div className="flex gap-2 mb-4">
        {schemas.map((schema, index) => (
          <button
            key={index}
            onClick={() => setSelectedSchema(index)}
            className={`px-3 py-1 rounded text-sm ${
              selectedSchema === index 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {schema['@type']} {index + 1}
          </button>
        ))}
      </div>
      
      {schemas[selectedSchema] && (
        <SchemaPreview schema={schemas[selectedSchema]} />
      )}
    </div>
  );
};

// Cache management utilities
export const SchemaCacheManager = {
  clearCache: () => {
    Object.keys(schemaCache).forEach(key => delete schemaCache[key]);
  },
  
  getCacheStats: () => ({
    totalEntries: Object.keys(schemaCache).length,
    totalSize: JSON.stringify(schemaCache).length,
    oldestEntry: Math.min(...Object.values(schemaCache).map(entry => entry.timestamp)),
    newestEntry: Math.max(...Object.values(schemaCache).map(entry => entry.timestamp))
  }),
  
  cleanExpiredEntries: () => {
    const now = Date.now();
    Object.keys(schemaCache).forEach(key => {
      if (now - schemaCache[key].timestamp > CACHE_DURATION) {
        delete schemaCache[key];
      }
    });
  }
};

export default SchemaGenerator;