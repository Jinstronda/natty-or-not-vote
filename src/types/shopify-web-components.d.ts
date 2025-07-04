// TypeScript declarations for Shopify Web Components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'shopify-store': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'store-domain'?: string;
        'public-access-token'?: string;
        country?: string;
        language?: string;
      }, HTMLElement>;
      
      'shopify-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'shopify-list-context': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        query?: string;
        first?: string;
      }, HTMLElement>;
      
      'shopify-data': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
        tag?: string;
        format?: string;
      }, HTMLElement>;
      
      'shopify-media': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
        width?: string;
        height?: string;
      }, HTMLElement>;
      
      'shopify-variant-selector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'shopify-product-form': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'shopify-money': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
        format?: string;
      }, HTMLElement>;
      
      template: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTemplateElement> & {
        condition?: string;
      }, HTMLTemplateElement>;
    }
  }
}

export {}; 