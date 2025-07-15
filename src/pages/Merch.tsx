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
    description: "The juicy influencers secret",
    price: 17.99,
    originalPrice: 34.99,
    image: "https://606ejf-hf.myshopify.com/cdn/shop/files/image_2025-06-30_111357976.png",
    features: ["800 lumens", "8-hour runtime", "Magnetic mount", "USB-C charging"],
    inStock: true,
    stockCount: 7,
    rating: 0,
    reviewCount: 0,
    shopifyUrl: "https://606ejf-hf.myshopify.com/products/the-juicy-lightning%E2%84%A2-the-secret-weapon-every-natural-influencer-doesnt-want-you-to-know"
  },
  {
    id: "natty-tshirt-1",
    title: "My mom said I look Natty Oversized T-Shirt",
    description: "\"My mom said I look Natty\". Prove her and everybody else wrong! Best Gym clothes from Natty or Juicy, the most controversial platform of Gym lovers.",
    price: 49.90, // EUR, adjust if you want to convert to USD
    originalPrice: 59.90, // Example original price, adjust as needed
    image: "/natty-tshirt-lightning.jpg", // Updated to use the new provided image in the public directory
    features: [
      "Dropped shoulders for a relaxed fit",
      "Stabilizing shoulder-to-shoulder tape",
      "Long-lasting double needle stitch hems",
      "100% durable carded cotton",
      "Medium-heavy fabric for comfort"
    ],
    inStock: true, // Set to false if sold out
    stockCount: 10, // Adjust as needed
    rating: 0, // Update if you have reviews
    reviewCount: 0,
    shopifyUrl: "https://606ejf-hf.myshopify.com/products/funny-oversized-t-shirt-gym-wear-gift-for-gym-goyer-oversized-t-shirt-gym-gym-mem-gym-gym-lovers?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web"
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

// Juicy-themed loading skeleton
const ProductSkeleton = () => (
  <Card className="overflow-hidden border-2 border-juicy/20 bg-gradient-to-br from-juicy/5 via-background to-juicy/10">
    <div className="aspect-square bg-gradient-to-br from-juicy/20 to-pink-500/20 animate-pulse relative">
      <div className="absolute inset-0 bg-gradient-to-br from-juicy/10 to-transparent animate-pulse opacity-50" />
    </div>
    <CardContent className="p-6 bg-gradient-to-b from-background to-juicy/5">
      <div className="space-y-4">
        <div className="h-6 bg-gradient-to-r from-juicy/20 to-pink-500/20 rounded animate-pulse" />
        <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-juicy/10 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-10 bg-gradient-to-r from-juicy/30 to-pink-500/30 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Juicy-themed product card with hover effects
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleCardClick = useCallback(() => {
    window.open(product.shopifyUrl, '_blank', 'noopener,noreferrer');
  }, [product.shopifyUrl]);
  
  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-2xl hover:shadow-juicy/30 transition-all duration-500 hover:scale-[1.03] group cursor-pointer border-2 border-juicy/30 hover:border-juicy bg-gradient-to-br from-juicy/5 via-background to-juicy/10"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-juicy/20 via-juicy/10 to-juicy/30 overflow-hidden relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-juicy/10 to-transparent animate-pulse opacity-30" />
          
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 relative z-10 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center',
                minHeight: '100%',
                minWidth: '100%'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-juicy/20 to-juicy/40">
              <ShoppingCart className="w-20 h-20 text-juicy animate-bounce" />
            </div>
          )}
          
          {/* Hover overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-juicy/20 via-transparent to-transparent group-hover:from-juicy/40 transition-all duration-500" />
        </div>
        
        {/* Stylish discount badge */}
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-gradient-to-r from-destructive to-red-600 text-white shadow-lg shadow-destructive/50 font-bold text-lg px-4 py-2">
            {discountPercentage}% OFF
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 bg-gradient-to-b from-background to-juicy/5">
        <div className="space-y-4">
          {/* Juicy title and description */}
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-juicy transition-colors duration-300 bg-gradient-to-r from-juicy to-pink-500 bg-clip-text text-transparent">
              {product.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium italic">
              {product.description}
            </p>
          </div>
          
          {/* Juicy features */}
          <div className="grid grid-cols-2 gap-2">
            {product.features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs justify-center py-2 bg-gradient-to-r from-juicy/20 to-pink-500/20 text-juicy border-juicy/30 hover:from-juicy/30 hover:to-pink-500/30 transition-all duration-300 font-semibold"
              >
                {feature}
              </Badge>
            ))}
          </div>
          
          {/* Juicy pricing - SHOWN ONLY ONCE */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black bg-gradient-to-r from-juicy to-pink-500 bg-clip-text text-transparent">
              €{product.price}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              €{product.originalPrice}
            </span>
          </div>
          
          {/* Juicy buy button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full bg-gradient-to-r from-juicy via-pink-500 to-juicy hover:from-pink-600 hover:via-juicy hover:to-pink-600 text-white font-bold py-4 text-lg transition-all duration-500 hover:scale-[1.02] shadow-lg shadow-juicy/50 hover:shadow-xl hover:shadow-juicy/70 relative overflow-hidden group"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </div>
          </Button>
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
          {/* Juicy Hero Section */}
          <div className="text-center space-y-8 bg-gradient-to-br from-juicy/20 via-juicy/10 to-pink-500/20 rounded-3xl p-12 border-2 border-juicy/30 shadow-2xl shadow-juicy/20 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-juicy/10 to-transparent animate-pulse opacity-30" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-juicy/20 rounded-full blur-3xl animate-bounce" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                Official <span className="text-natty drop-shadow-lg">Natty</span> or <span className="bg-gradient-to-r from-juicy to-pink-500 bg-clip-text text-transparent drop-shadow-lg">Juicy</span> Store
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-juicy to-pink-500 mx-auto my-6 rounded-full" />
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Professional gear for content creators ⚡
              </p>
              <div className="flex items-center justify-center gap-8 mt-8">
                <Badge className="bg-gradient-to-r from-juicy to-pink-500 text-white px-6 py-3 text-lg font-bold shadow-lg">
                  ✨ Premium Quality
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 text-lg font-bold shadow-lg">
                  🛡️ Guaranteed
                </Badge>
              </div>
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
          
          {/* Juicy Search Section */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Input
                type="text"
                placeholder="Search for the perfect gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-juicy/30 focus:border-juicy focus:ring-4 focus:ring-juicy/20 rounded-2xl bg-gradient-to-r from-juicy/5 to-pink-500/5 placeholder:text-muted-foreground/70"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-juicy w-5 h-5 group-focus-within:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-juicy/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
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
            {/* Juicy Section Header */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black bg-gradient-to-r from-juicy to-pink-500 bg-clip-text text-transparent">
                🔥 FEATURED PRODUCTS
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Transform your content with professional gear
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-juicy to-pink-500 mx-auto rounded-full" />
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