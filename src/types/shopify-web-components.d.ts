// TypeScript declarations for Shopify Web Components
declare namespace JSX {
  interface IntrinsicElements {
    'shopify-store': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'store-domain'?: string;
      'public-access-token'?: string;
      'country'?: string;
      'language'?: string;
    };
    'shopify-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'shopify-list-context': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'type'?: string;
      'query'?: string;
      'first'?: string;
    };
    'shopify-media': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'query'?: string;
      'width'?: string;
      'height'?: string;
    };
    'shopify-data': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'query'?: string;
    };
    'shopify-money': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'query'?: string;
      'format'?: string;
    };
    'shopify-variant-selector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
} 