import { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import '../types/shopify-web-components';

const Merch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading state after components load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Add custom styles for Shopify components
    const style = document.createElement('style');
    style.textContent = `
      /* Style the Shopify cart */
      shopify-cart::part(dialog) {
        border-radius: 12px;
        border: none;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        max-width: 500px;
      }

      shopify-cart::part(primary-button) {
        background: hsl(var(--primary));
        border-radius: 8px;
        font-weight: 600;
        font-family: inherit;
        border: none;
        color: white;
      }

      shopify-cart::part(secondary-button) {
        background: transparent;
        border: 2px solid hsl(var(--primary));
        border-radius: 8px;
        color: hsl(var(--primary));
        font-weight: 500;
      }

      /* Style the variant selector */
      shopify-variant-selector::part(form) {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      shopify-variant-selector::part(radio) {
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        padding: 8px 12px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      shopify-variant-selector::part(radio-selected) {
        border-color: hsl(var(--primary));
        background: hsl(var(--primary) / 0.1);
        color: hsl(var(--primary));
      }

      /* Style product cards */
      .product-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        height: fit-content;
        position: relative;
        overflow: hidden;
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
      }

      .sale-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #ef4444;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10;
      }

      .lightning-effect {
        background: linear-gradient(45deg, #ffd700, #ffed4e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
      }

      .add-to-cart-btn {
        width: 100%;
        background: hsl(var(--primary));
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 1rem;
      }

      .add-to-cart-btn:hover {
        background: hsl(var(--primary) / 0.9);
        transform: translateY(-1px);
      }

      /* Shopping cart button */
      .cart-button {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: hsl(var(--primary));
        color: white;
        border: none;
        border-radius: 50px;
        padding: 16px 24px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .cart-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAddToCart = (event: any) => {
    const cart = document.getElementById('main-cart') as any;
    if (cart) {
      cart.addLine(event).then(() => {
        cart.showModal();
      });
    }
  };

  const openCart = () => {
    const cart = document.getElementById('main-cart') as any;
    if (cart) {
      cart.showModal();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span> Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the secret weapons and gear that every influencer doesn't want you to know about. 
            Discover the truth behind the gains! ⚡
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mt-8">
            <Input
              type="text"
              placeholder="Search for secret weapons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-center"
            />
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-natty/10 to-juicy/10 border border-primary/20 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            <span className="lightning-effect">⚡ THE JUICY LIGHTNING™ ⚡</span>
          </h2>
          <p className="text-muted-foreground">
            The secret weapon every "natural" influencer doesn't want you to know about
          </p>
          <p className="text-sm font-semibold text-primary mt-2">
            Limited Time: Save 50% on all secret weapons!
          </p>
        </div>

        {/* Shopify Store Container - Connected to your live store */}
        <shopify-store 
          store-domain="606ejf-hf.myshopify.com"
          public-access-token="abe5bbfdabf81963d9104f5dfc4ba552"
          country="US" 
          language="en"
        >
          {/* Shopping Cart */}
          <shopify-cart id="main-cart"></shopify-cart>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <shopify-list-context 
              type="product" 
              query={searchQuery ? `products(first: 12, query: "${searchQuery}")` : "products"} 
              first="12"
            >
              <template>
                <div className="product-card">
                  {/* Sale Badge */}
                  <div className="sale-badge">🔥 HOT</div>
                  
                  <shopify-media 
                    query="product.featuredImage" 
                    width="300" 
                    height="300"
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  ></shopify-media>
                  
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      <shopify-data query="product.title"></shopify-data>
                    </h3>

                    {/* Product Description */}
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '1rem',
                      lineHeight: '1.4'
                    }}>
                      <shopify-data query="product.description"></shopify-data>
                    </p>
                    
                    {/* Price Display */}
                    <div style={{
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: 'hsl(var(--primary))',
                        marginBottom: '0.25rem'
                      }}>
                        <shopify-money 
                          query="product.selectedOrFirstAvailableVariant.price"
                          format="money_with_currency"
                        ></shopify-money>
                      </div>
                      
                      {/* Compare at price (if on sale) */}
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#9ca3af',
                        textDecoration: 'line-through'
                      }}>
                        <shopify-money 
                          query="product.selectedOrFirstAvailableVariant.compareAtPrice"
                          format="money_with_currency"
                        ></shopify-money>
                      </div>
                    </div>
                    
                    <shopify-variant-selector></shopify-variant-selector>
                    
                    <button 
                      className="add-to-cart-btn"
                      onClick={handleAddToCart}
                    >
                      🔥 Get Secret Weapon
                    </button>
                  </div>
                </div>
              </template>
            </shopify-list-context>
          </div>

          {/* Floating Cart Button */}
          <button 
            className="cart-button"
            onClick={openCart}
          >
            ⚡ Arsenal (<shopify-data query="cart.totalQuantity">0</shopify-data>)
          </button>
        </shopify-store>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading secret weapons...</p>
            <p className="text-sm text-muted-foreground mt-2">Connecting to store...</p>
          </div>
        )}

        {/* No Results State */}
        {searchQuery && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No secret weapons found for "{searchQuery}"</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Merch; 