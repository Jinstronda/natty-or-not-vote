import { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addFAQSchemaToPage, merchFAQs } from "@/utils/faqSchema";
import { useFlashSaleTimer } from "@/utils/flashSaleTimer";
import { ShoppingCart, Star, Truck, Shield, RefreshCw } from "lucide-react";

// Modern robust product data structure
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  features: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  shopifyUrl: string;
}

// Real Shopify product data - no fake information
const PRODUCTS: Product[] = [
  {
    id: "juicy-lightning-1",
    title: "Juicy Lightning™",
    description: "Professional gym lighting for content creators",
    price: 17.99,
    originalPrice: 34.99,
    image: "https://606ejf-hf.myshopify.com/cdn/shop/files/image_2025-06-30_111357976.png",
    features: ["800 lumens", "8-hour runtime", "Magnetic mount", "USB-C charging"],
    inStock: true,
    stockCount: 7,
    rating: 0,
    reviewCount: 0,
    shopifyUrl: "https://606ejf-hf.myshopify.com/products/the-juicy-lightning%E2%84%A2-the-secret-weapon-every-natural-influencer-doesnt-want-you-to-know"
  }
];

// Modern error boundary component
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Clean loading skeleton
const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-square bg-muted animate-pulse" />
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Professional minimal product card
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleCardClick = useCallback(() => {
    window.open(product.shopifyUrl, '_blank', 'noopener,noreferrer');
  }, [product.shopifyUrl]);
  
  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-square bg-muted overflow-hidden">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Simple discount badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-destructive text-white font-semibold">
            {discountPercentage}% OFF
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Clean title and description */}
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold leading-tight">
              {product.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
          
          {/* Clean features */}
          <div className="grid grid-cols-2 gap-2">
            {product.features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs justify-center py-1 font-normal"
              >
                {feature}
              </Badge>
            ))}
          </div>
          
          {/* Clean pricing - SHOWN ONLY ONCE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                €{product.price}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                €{product.originalPrice}
              </span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Save €{(product.originalPrice - product.price).toFixed(2)}
            </Badge>
          </div>
          
          {/* Simple buy button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          {/* Clean trust signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>Free Shipping</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Merch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flashSaleTimer = useFlashSaleTimer();
  
  // Simulate loading for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    addFAQSchemaToPage(merchFAQs);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCTS;
    
    return PRODUCTS.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  
  // Retry mechanism
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Structured data for SEO
  const ecommerceSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": PRODUCTS[0].title,
    "description": PRODUCTS[0].description,
    "brand": {
      "@type": "Brand",
      "name": "Natty or Juicy"
    },
    "offers": {
      "@type": "Offer",
      "url": PRODUCTS[0].shopifyUrl,
      "priceCurrency": "USD",
      "price": PRODUCTS[0].price.toString(),
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Natty or Juicy"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": PRODUCTS[0].rating.toString(),
      "reviewCount": PRODUCTS[0].reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  }), []);

  return (
    <Layout>
      <SEOHead
        title="Official Natty or Juicy Store - Premium Fitness Gear | 50% OFF Flash Sale"
        description="Transform your fitness content with professional gear. The Juicy Lightning™ - now 50% OFF. In stock & ready to ship. Free shipping on all orders."
        canonicalUrl="https://nattyorjuicy.com/merch"
        ogType="product"
        ogImage="https://lovable.dev/opengraph-image-p98pqg.png"
        keywords={["fitness gear", "content creation", "natty or juicy", "fitness equipment", "bodybuilding", "workout accessories", "fitness influencer gear"]}
        structuredData={ecommerceSchema}
      />
      <BreadcrumbSchema customBreadcrumbs={[
        { name: 'Home', url: 'https://nattyorjuicy.com/' },
        { name: 'Store', url: 'https://nattyorjuicy.com/merch' }
      ]} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Clean Hero Section */}
          <div className="text-center space-y-6 py-12">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Official <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span> Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional gear for content creators
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2">
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                Free Shipping
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                30-Day Guarantee
              </Badge>
            </div>
          </div>
          
          {/* Flash Sale Timer - Keep RED for urgency */}
          <div className="bg-gradient-to-r from-destructive to-destructive/90 rounded-xl p-6 text-center text-white">
            <div className="text-lg font-bold mb-4 uppercase tracking-wider">
              ⚡ FLASH SALE ENDS IN ⚡
            </div>
            <div className="flex justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <span className="block text-2xl font-bold">
                  {flashSaleTimer.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-xs uppercase opacity-90">Hours</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <span className="block text-2xl font-bold">
                  {flashSaleTimer.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-xs uppercase opacity-90">Minutes</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <span className="block text-2xl font-bold">
                  {flashSaleTimer.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-xs uppercase opacity-90">Seconds</span>
              </div>
            </div>
          </div>
          
          {/* Simple Search Section */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Error State */}
          {error && (
            <Alert className="max-w-md mx-auto">
              <AlertDescription className="text-center">
                {error}
                <Button 
                  onClick={handleRetry}
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Enhanced Products Grid Section */}
          <div className="space-y-8">
            {/* Simple Section Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Professional gear for content creators
              </p>
            </div>

            {/* Products Grid */}
            <ErrorBoundary fallback={
              <Alert className="max-w-md mx-auto border-2 border-juicy/30 bg-gradient-to-r from-juicy/10 to-pink-500/10">
                <AlertDescription className="text-center font-medium">
                  Something went wrong loading products. Please refresh the page.
                </AlertDescription>
              </Alert>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                ) : (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </ErrorBoundary>

          </div>
          
          {/* No Results */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Merch; 