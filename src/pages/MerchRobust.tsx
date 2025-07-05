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

// Static product data as fallback (more reliable than API calls)
const PRODUCTS: Product[] = [
  {
    id: "juicy-lightning-1",
    title: "The Juicy Lightning™ - The Secret Weapon Every Natural Influencer Doesn't Want You to Know",
    description: "Professional gear that transforms your fitness content ⚡",
    price: 17.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    features: ["✨ Premium Quality", "🔋 Long Lasting", "🧲 Ergonomic", "⚡ Fast Delivery"],
    inStock: true,
    stockCount: 7,
    rating: 4.8,
    reviewCount: 127,
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

// Modern loading component with skeleton
const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-square bg-muted animate-pulse" />
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Modern product card with accessibility
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleBuyNow = useCallback(() => {
    window.open(product.shopifyUrl, '_blank', 'noopener,noreferrer');
  }, [product.shopifyUrl]);
  
  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
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
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-destructive hover:bg-destructive/90">
            🔥 BESTSELLER
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-primary hover:bg-primary/90">
            {discountPercentage}% OFF
          </Badge>
        </div>
        
        {/* Stock warning */}
        {product.stockCount <= 10 && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <Alert className="bg-destructive/90 border-destructive text-destructive-foreground">
              <AlertDescription className="text-center text-sm font-bold">
                ⚠️ Only {product.stockCount} left in stock!
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Rating */}
          <div className="space-y-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {product.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {product.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs justify-center">
                {feature}
              </Badge>
            ))}
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            </div>
            
            {/* Stock status */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">
                In Stock & Ready to Ship
              </span>
            </div>
          </div>
          
          {/* Buy button */}
          <Button 
            onClick={handleBuyNow}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold py-3 text-lg transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buy Now - ${product.price}
          </Button>
          
          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MerchRobust = () => {
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
        ogImage="https://i.imgur.com/n0sDxaT.png"
        keywords={["fitness gear", "content creation", "natty or juicy", "fitness equipment", "bodybuilding", "workout accessories", "fitness influencer gear"]}
        structuredData={ecommerceSchema}
      />
      <BreadcrumbSchema customBreadcrumbs={[
        { name: 'Home', url: 'https://nattyorjuicy.com/' },
        { name: 'Store', url: 'https://nattyorjuicy.com/merch' }
      ]} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-border">
            <h1 className="text-4xl md:text-6xl font-bold">
              Official <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span> Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional gear that transforms your fitness content ⚡
            </p>
          </div>
          
          {/* Flash Sale Timer */}
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
          
          {/* Search */}
          <div className="max-w-lg mx-auto">
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
          
          {/* Products Grid */}
          <ErrorBoundary fallback={
            <Alert className="max-w-md mx-auto">
              <AlertDescription>
                Something went wrong loading products. Please refresh the page.
              </AlertDescription>
            </Alert>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </ErrorBoundary>
          
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

export default MerchRobust;