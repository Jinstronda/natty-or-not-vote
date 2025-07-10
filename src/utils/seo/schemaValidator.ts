/**
 * Schema Validator for SEO Structured Data
 * Validates JSON-LD schemas against schema.org specifications
 * Tests Google Rich Results eligibility and provides error reporting
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  richResultsEligible: boolean;
  score: number;
  recommendations: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface SchemaMarkup {
  type: 'Person' | 'Review' | 'FAQPage' | 'WebSite' | 'Organization' | 'Article' | 'Product' | 'BreadcrumbList' | 'LocalBusiness';
  data: any;
  validation_errors?: string[];
}

/**
 * Main schema validation function
 * Validates against schema.org specifications and Google Rich Results
 */
export async function validateSchema(schema: SchemaMarkup): Promise<ValidationResult> {
  try {
    // Step 1: Basic structure validation
    const structureValidation = validateSchemaStructure(schema);
    
    // Step 2: Schema.org compliance validation
    const schemaValidation = validateSchemaOrgCompliance(schema);
    
    // Step 3: Google Rich Results eligibility
    const googleValidation = validateGoogleRichResults(schema);
    
    // Step 4: Performance and optimization checks
    const performanceValidation = validatePerformanceOptimization(schema);
    
    // Combine all validation results
    const allErrors = [
      ...structureValidation.errors,
      ...schemaValidation.errors,
      ...googleValidation.errors,
      ...performanceValidation.errors
    ];
    
    const allWarnings = [
      ...structureValidation.warnings,
      ...schemaValidation.warnings,
      ...googleValidation.warnings,
      ...performanceValidation.warnings
    ];
    
    const isValid = allErrors.length === 0;
    const score = calculateValidationScore(allErrors, allWarnings);
    const recommendations = generateRecommendations(allErrors, allWarnings);
    
    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      richResultsEligible: googleValidation.richResultsEligible,
      score,
      recommendations
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'schema',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        severity: 'error',
        code: 'VALIDATION_ERROR'
      }],
      warnings: [],
      richResultsEligible: false,
      score: 0,
      recommendations: ['Fix validation errors and try again']
    };
  }
}

/**
 * Validate basic schema structure
 */
function validateSchemaStructure(schema: SchemaMarkup): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check for required @context
  if (!schema.data['@context']) {
    errors.push({
      field: '@context',
      message: '@context is required for JSON-LD',
      severity: 'error',
      code: 'MISSING_CONTEXT',
      suggestion: 'Add "@context": "https://schema.org" to your schema'
    });
  } else if (schema.data['@context'] !== 'https://schema.org') {
    warnings.push({
      field: '@context',
      message: 'Recommend using "https://schema.org" as @context',
      suggestion: 'Use the standard schema.org context URL'
    });
  }
  
  // Check for required @type
  if (!schema.data['@type']) {
    errors.push({
      field: '@type',
      message: '@type is required for JSON-LD',
      severity: 'error',
      code: 'MISSING_TYPE',
      suggestion: 'Add "@type" property to specify the schema type'
    });
  }
  
  // Check for valid JSON structure
  try {
    JSON.stringify(schema.data);
  } catch (e) {
    errors.push({
      field: 'structure',
      message: 'Invalid JSON structure',
      severity: 'error',
      code: 'INVALID_JSON',
      suggestion: 'Ensure all properties are properly formatted JSON'
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate schema.org compliance
 */
function validateSchemaOrgCompliance(schema: SchemaMarkup): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const schemaType = schema.data['@type'];
  
  switch (schemaType) {
    case 'Person':
      return validatePersonSchema(schema.data, errors, warnings);
    case 'Review':
      return validateReviewSchema(schema.data, errors, warnings);
    case 'FAQPage':
      return validateFAQPageSchema(schema.data, errors, warnings);
    case 'WebSite':
      return validateWebSiteSchema(schema.data, errors, warnings);
    case 'Organization':
      return validateOrganizationSchema(schema.data, errors, warnings);
    case 'Article':
      return validateArticleSchema(schema.data, errors, warnings);
    case 'Product':
      return validateProductSchema(schema.data, errors, warnings);
    case 'BreadcrumbList':
      return validateBreadcrumbSchema(schema.data, errors, warnings);
    case 'LocalBusiness':
      return validateLocalBusinessSchema(schema.data, errors, warnings);
    default:
      warnings.push({
        field: '@type',
        message: `Schema type ${schemaType} not specifically validated`,
        suggestion: 'Ensure this is a valid schema.org type'
      });
  }
  
  return { errors, warnings };
}

/**
 * Validate Person schema
 */
function validatePersonSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  // Required fields
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required for Person schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add a name property to the Person schema'
    });
  }
  
  // Recommended fields
  if (!data.image) {
    warnings.push({
      field: 'image',
      message: 'Image is recommended for Person schema',
      suggestion: 'Add an image URL to improve rich results'
    });
  }
  
  if (!data.url) {
    warnings.push({
      field: 'url',
      message: 'URL is recommended for Person schema',
      suggestion: 'Add a URL to the person\'s profile or website'
    });
  }
  
  // Validate social links
  if (data.sameAs && Array.isArray(data.sameAs)) {
    data.sameAs.forEach((link: string, index: number) => {
      if (!isValidURL(link)) {
        errors.push({
          field: `sameAs[${index}]`,
          message: 'Invalid URL in sameAs array',
          severity: 'error',
          code: 'INVALID_URL',
          suggestion: 'Ensure all sameAs links are valid URLs'
        });
      }
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate Review schema
 */
function validateReviewSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  // Required fields
  if (!data.author) {
    errors.push({
      field: 'author',
      message: 'Author is required for Review schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add author information to the review'
    });
  }
  
  if (!data.reviewBody && !data.reviewRating) {
    errors.push({
      field: 'reviewBody',
      message: 'Either reviewBody or reviewRating is required',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add either review text or a rating'
    });
  }
  
  if (!data.itemReviewed) {
    errors.push({
      field: 'itemReviewed',
      message: 'itemReviewed is required for Review schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the item being reviewed'
    });
  }
  
  // Validate rating
  if (data.reviewRating) {
    if (!data.reviewRating.ratingValue) {
      errors.push({
        field: 'reviewRating.ratingValue',
        message: 'ratingValue is required when reviewRating is present',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add a numerical rating value'
      });
    }
    
    if (!data.reviewRating.bestRating) {
      warnings.push({
        field: 'reviewRating.bestRating',
        message: 'bestRating is recommended for rating clarity',
        suggestion: 'Add the maximum possible rating (e.g., 5)'
      });
    }
  }
  
  return { errors, warnings };
}

/**
 * Validate FAQPage schema
 */
function validateFAQPageSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.mainEntity || !Array.isArray(data.mainEntity)) {
    errors.push({
      field: 'mainEntity',
      message: 'mainEntity array is required for FAQPage schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add an array of Question objects'
    });
    return { errors, warnings };
  }
  
  data.mainEntity.forEach((question: any, index: number) => {
    if (!question.name) {
      errors.push({
        field: `mainEntity[${index}].name`,
        message: 'Question name is required',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add a question text'
      });
    }
    
    if (!question.acceptedAnswer) {
      errors.push({
        field: `mainEntity[${index}].acceptedAnswer`,
        message: 'acceptedAnswer is required for each question',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add an answer object with text'
      });
    } else if (!question.acceptedAnswer.text) {
      errors.push({
        field: `mainEntity[${index}].acceptedAnswer.text`,
        message: 'Answer text is required',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add answer text content'
      });
    }
  });
  
  return { errors, warnings };
}

/**
 * Validate WebSite schema
 */
function validateWebSiteSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required for WebSite schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the website name'
    });
  }
  
  if (!data.url) {
    errors.push({
      field: 'url',
      message: 'URL is required for WebSite schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the website URL'
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate Organization schema
 */
function validateOrganizationSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required for Organization schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the organization name'
    });
  }
  
  if (!data.logo) {
    warnings.push({
      field: 'logo',
      message: 'Logo is recommended for Organization schema',
      suggestion: 'Add a logo URL for better branding'
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate Article schema
 */
function validateArticleSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.headline) {
    errors.push({
      field: 'headline',
      message: 'Headline is required for Article schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add an article headline'
    });
  }
  
  if (!data.author) {
    errors.push({
      field: 'author',
      message: 'Author is required for Article schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add author information'
    });
  }
  
  if (!data.datePublished) {
    errors.push({
      field: 'datePublished',
      message: 'datePublished is required for Article schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add publication date'
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate Product schema
 */
function validateProductSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required for Product schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the product name'
    });
  }
  
  if (data.aggregateRating) {
    if (!data.aggregateRating.ratingValue) {
      errors.push({
        field: 'aggregateRating.ratingValue',
        message: 'ratingValue is required for aggregateRating',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add the average rating value'
      });
    }
    
    if (!data.aggregateRating.ratingCount) {
      errors.push({
        field: 'aggregateRating.ratingCount',
        message: 'ratingCount is required for aggregateRating',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add the number of ratings'
      });
    }
  }
  
  return { errors, warnings };
}

/**
 * Validate BreadcrumbList schema
 */
function validateBreadcrumbSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
    errors.push({
      field: 'itemListElement',
      message: 'itemListElement array is required for BreadcrumbList',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add an array of breadcrumb items'
    });
    return { errors, warnings };
  }
  
  data.itemListElement.forEach((item: any, index: number) => {
    if (!item.name) {
      errors.push({
        field: `itemListElement[${index}].name`,
        message: 'Breadcrumb item name is required',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add a name for each breadcrumb item'
      });
    }
    
    if (!item.position) {
      errors.push({
        field: `itemListElement[${index}].position`,
        message: 'Breadcrumb item position is required',
        severity: 'error',
        code: 'MISSING_REQUIRED_FIELD',
        suggestion: 'Add a position number for each breadcrumb item'
      });
    }
  });
  
  return { errors, warnings };
}

/**
 * Validate LocalBusiness schema
 */
function validateLocalBusinessSchema(data: any, errors: ValidationError[], warnings: ValidationWarning[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required for LocalBusiness schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the business name'
    });
  }
  
  if (!data.address) {
    errors.push({
      field: 'address',
      message: 'Address is required for LocalBusiness schema',
      severity: 'error',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Add the business address'
    });
  }
  
  return { errors, warnings };
}

/**
 * Validate Google Rich Results eligibility
 */
function validateGoogleRichResults(schema: SchemaMarkup): { errors: ValidationError[], warnings: ValidationWarning[], richResultsEligible: boolean } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const schemaType = schema.data['@type'];
  let richResultsEligible = false;
  
  // Check if schema type is eligible for rich results
  const richResultsTypes = ['Person', 'Review', 'FAQPage', 'Article', 'Product', 'BreadcrumbList', 'Organization'];
  
  if (richResultsTypes.includes(schemaType)) {
    richResultsEligible = true;
    
    // Additional rich results validation
    if (schemaType === 'Person' && !schema.data.image) {
      warnings.push({
        field: 'image',
        message: 'Image improves rich results for Person schema',
        suggestion: 'Add a high-quality image for better rich results'
      });
    }
    
    if (schemaType === 'Review' && !schema.data.reviewRating) {
      warnings.push({
        field: 'reviewRating',
        message: 'Rating improves rich results for Review schema',
        suggestion: 'Add a rating for better rich results display'
      });
    }
    
    if (schemaType === 'Article' && !schema.data.image) {
      warnings.push({
        field: 'image',
        message: 'Image improves rich results for Article schema',
        suggestion: 'Add a featured image for better rich results'
      });
    }
  }
  
  return { errors, warnings, richResultsEligible };
}

/**
 * Validate performance optimization
 */
function validatePerformanceOptimization(schema: SchemaMarkup): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check schema size
  const schemaSize = JSON.stringify(schema.data).length;
  if (schemaSize > 8000) {
    warnings.push({
      field: 'schema',
      message: 'Schema is quite large, consider optimization',
      suggestion: 'Large schemas may impact page performance'
    });
  }
  
  // Check for circular references
  try {
    JSON.stringify(schema.data);
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('circular')) {
      errors.push({
        field: 'schema',
        message: 'Circular reference detected in schema',
        severity: 'error',
        code: 'CIRCULAR_REFERENCE',
        suggestion: 'Remove circular references from schema data'
      });
    }
  }
  
  return { errors, warnings };
}

/**
 * Calculate validation score (0-100)
 */
function calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
  let score = 100;
  
  // Deduct points for errors
  errors.forEach(error => {
    if (error.severity === 'error') {
      score -= 20;
    } else {
      score -= 10;
    }
  });
  
  // Deduct points for warnings
  warnings.forEach(() => {
    score -= 5;
  });
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(errors: ValidationError[], warnings: ValidationWarning[]): string[] {
  const recommendations: string[] = [];
  
  if (errors.length > 0) {
    recommendations.push('Fix all validation errors for optimal SEO performance');
  }
  
  if (warnings.length > 0) {
    recommendations.push('Address warnings to improve rich results eligibility');
  }
  
  // Add specific recommendations
  const missingFields = errors.filter(e => e.code === 'MISSING_REQUIRED_FIELD');
  if (missingFields.length > 0) {
    recommendations.push('Add all required fields for schema compliance');
  }
  
  const imageWarnings = warnings.filter(w => w.field === 'image');
  if (imageWarnings.length > 0) {
    recommendations.push('Add high-quality images to improve rich results');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Schema is well-optimized for SEO');
  }
  
  return recommendations;
}

/**
 * Utility function to validate URLs
 */
function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Batch validate multiple schemas
 */
export async function validateMultipleSchemas(schemas: SchemaMarkup[]): Promise<ValidationResult[]> {
  const results = await Promise.all(schemas.map(schema => validateSchema(schema)));
  return results;
}

/**
 * Generate validation report
 */
export function generateValidationReport(results: ValidationResult[]): string {
  const totalSchemas = results.length;
  const validSchemas = results.filter(r => r.isValid).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalSchemas;
  
  return `
Schema Validation Report
========================
Total Schemas: ${totalSchemas}
Valid Schemas: ${validSchemas}
Total Errors: ${totalErrors}
Total Warnings: ${totalWarnings}
Average Score: ${avgScore.toFixed(1)}/100

Rich Results Eligible: ${results.filter(r => r.richResultsEligible).length}/${totalSchemas}
  `.trim();
}

/**
 * Export validation utilities
 */
export const SchemaValidationUtils = {
  validateSchema,
  validateMultipleSchemas,
  generateValidationReport,
  isValidURL
};