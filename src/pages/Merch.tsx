import { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addFAQSchemaToPage, merchFAQs } from "@/utils/faqSchema";
import { useFlashSaleTimer } from "@/utils/flashSaleTimer";

const Merch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flashSaleTimer = useFlashSaleTimer();

  useEffect(() => {
    // Hide loading state after components load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Add FAQ schema for better SEO
    addFAQSchemaToPage(merchFAQs);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Ecommerce structured data for better search visibility
  const ecommerceSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "The Juicy Lightning™ - The Secret Weapon Every Natural Influencer Doesn't Want You to Know",
    "description": "Professional gear that transforms your fitness content ⚡",
    "brand": {
      "@type": "Brand",
      "name": "Natty or Juicy"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://606ejf-hf.myshopify.com/products/the-juicy-lightning™-the-secret-weapon-every-natural-influencer-doesnt-want-you-to-know",
      "priceCurrency": "USD",
      "price": "17.99",
      "priceValidUntil": "2024-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Natty or Juicy"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "USD"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitText": "d"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Fitness Enthusiast"
        },
        "reviewBody": "Game-changing equipment for content creation"
      }
    ]
  };

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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
          {/* Hero Section - Mobile Optimized */}
          <div className="text-center space-y-4 sm:space-y-6 bg-gradient-to-r from-natty/20 to-juicy/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-border">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold leading-tight">
              Official <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span> Store
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Professional gear that transforms your fitness content ⚡
            </p>
          </div>

          {/* Countdown Timer - Mobile Responsive */}
          <div className="bg-gradient-to-r from-destructive/90 to-destructive rounded-xl p-4 sm:p-6 text-center text-white">
            <div className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">⚡ FLASH SALE ENDS IN ⚡</div>
            <div className="flex justify-center gap-2 sm:gap-4 max-w-sm mx-auto">
              <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg flex-1 min-w-0">
                <span className="block text-lg sm:text-2xl font-bold">{flashSaleTimer.hours.toString().padStart(2, '0')}</span>
                <span className="text-xs uppercase opacity-90">Hours</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg flex-1 min-w-0">
                <span className="block text-lg sm:text-2xl font-bold">{flashSaleTimer.minutes.toString().padStart(2, '0')}</span>
                <span className="text-xs uppercase opacity-90">Minutes</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg flex-1 min-w-0">
                <span className="block text-lg sm:text-2xl font-bold">{flashSaleTimer.seconds.toString().padStart(2, '0')}</span>
                <span className="text-xs uppercase opacity-90">Seconds</span>
              </div>
            </div>
          </div>

          {/* Search & Filter - Mobile Optimized */}
          <div className="max-w-lg mx-auto px-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your secret weapons...</p>
            </div>
          )}

          {/* Shopify Store Container - Mobile Optimized */}
          <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <shopify-store 
              store-domain="606ejf-hf.myshopify.com"
              public-access-token="abe5bbfdabf81963d9104f5dfc4ba552"
              country="US" 
              language="en"
            >
              {/* Products Grid - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-7xl mx-auto">
                <shopify-list-context 
                  type="product" 
                  query="products" 
                  first="12"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <template>
                      <div 
                        onclick="window.open('https://606ejf-hf.myshopify.com/products/the-juicy-lightning%E2%84%A2-the-secret-weapon-every-natural-influencer-doesnt-want-you-to-know', '_blank')"
                        class="bg-card/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-border/50 overflow-hidden hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 group hover:border-natty/30 relative cursor-pointer">
                        <!-- Product Image -->
                        <div class="relative group overflow-hidden">
                          <div class="aspect-square bg-gradient-to-br from-muted/50 to-muted">
                            <shopify-media 
                              query="product.featuredImage" 
                              width="500" 
                              height="500"
                              style="width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 0;"
                              class="transition-transform duration-500 group-hover:scale-105"
                            ></shopify-media>
                          </div>
                          
                          <!-- Hot Badge -->
                          <div class="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                            <div class="bg-gradient-to-r from-destructive to-destructive/90 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase backdrop-blur-sm shadow-lg">
                              🔥 BESTSELLER
                            </div>
                          </div>
                          
                          <!-- Sale Badge -->
                          <div class="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                            <div class="bg-gradient-to-r from-natty to-natty/90 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
                              50% OFF
                            </div>
                          </div>
                          
                          <!-- Hover Overlay -->
                          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                        
                        <!-- Product Info - Mobile Optimized -->
                        <div class="p-4 sm:p-6 space-y-3 sm:space-y-5">
                          <!-- Product Title -->
                          <div class="space-y-1 sm:space-y-2">
                            <shopify-data query="product.title" tag="h3" class="font-bold text-lg sm:text-xl leading-tight text-foreground group-hover:text-natty transition-colors line-clamp-2"></shopify-data>
                            <shopify-data query="product.vendor" class="text-sm text-muted-foreground font-medium"></shopify-data>
                          </div>
                          
                          <!-- Key Features - Mobile Grid */}
                          <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
                            <span class="bg-secondary/80 text-secondary-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-center transition-colors hover:bg-secondary">✨ Premium</span>
                            <span class="bg-secondary/80 text-secondary-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-center transition-colors hover:bg-secondary">🔋 Long Lasting</span>
                            <span class="bg-secondary/80 text-secondary-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-center transition-colors hover:bg-secondary">🧲 Ergonomic</span>
                            <span class="bg-secondary/80 text-secondary-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-center transition-colors hover:bg-secondary">⚡ Fast Ship</span>
                          </div>
                          
                          <!-- Stock Warning -->
                          <div class="bg-gradient-to-r from-destructive/15 to-destructive/10 border border-destructive/20 text-destructive px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-center relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent"></div>
                            <div class="relative">⚠️ Only 7 left - Order now!</div>
                          </div>
                          
                          <!-- Pricing - Mobile Optimized */}
                          <div class="space-y-3 sm:space-y-4">
                            <div class="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                              <shopify-data query="product.priceRange.minVariantPrice.amount" class="text-2xl sm:text-4xl font-black text-natty"></shopify-data>
                              <span class="text-lg sm:text-xl text-muted-foreground line-through opacity-75">34.99</span>
                              <div class="bg-gradient-to-r from-juicy to-juicy/90 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                                Save 50%
                              </div>
                            </div>
                            
                            <!-- Availability Status -->
                            <div class="flex items-center justify-center gap-2 py-1 sm:py-2">
                              <div class="w-2 sm:w-3 h-2 sm:h-3 bg-natty rounded-full animate-pulse"></div>
                              <span class="text-xs sm:text-sm text-natty font-semibold tracking-wide">In Stock & Ready to Ship</span>
                            </div>
                          </div>
                          
                          <!-- Buy Now Button - Touch Optimized -->
                          <div class="pt-2">
                            <button 
                              onclick="event.stopPropagation(); window.open('https://606ejf-hf.myshopify.com/products/the-juicy-lightning%E2%84%A2-the-secret-weapon-every-natural-influencer-doesnt-want-you-to-know', '_blank')"
                              class="w-full bg-gradient-to-r from-natty via-natty to-juicy hover:from-juicy hover:via-juicy hover:to-natty text-white px-4 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-natty/25 transform uppercase tracking-wider relative overflow-hidden group min-h-[48px]"
                            >
                              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div class="relative flex items-center justify-center gap-2 sm:gap-3">
                                <span class="text-xl sm:text-2xl">🚀</span>
                                <span class="text-sm sm:text-base">Buy Now - $17.99</span>
                                <span class="text-xs sm:text-sm opacity-90">→</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                      </template>
                    `
                  }}
                />
              </div>
            </shopify-store>
          </div>

          {/* Error State - Mobile Optimized */}
          <div id="shopify-error" className="hidden text-center py-8 sm:py-12">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 max-w-md mx-auto">
              <div className="text-destructive mb-4">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Store Temporarily Unavailable</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">We're working on getting our store back online. Please check back later.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Script to handle Shopify loading errors */}
      {/* @ts-ignore */}
      <script dangerouslySetInnerHTML={{
        __html: `
          setTimeout(() => {
            const products = document.querySelectorAll('shopify-list-context');
            if (products.length === 0 || document.querySelector('.shopify-error')) {
              document.getElementById('shopify-error').classList.remove('hidden');
            }
          }, 5000);
        `
      }} />
    </Layout>
  );
};

export default Merch; 