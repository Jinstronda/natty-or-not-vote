
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import InfluencerGrid from "@/components/InfluencerGrid";
import VirtualizedInfluencerGrid from "@/components/VirtualizedInfluencerGrid";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Button } from "@/components/ui/button";
import { Zap, Grid3X3 } from "lucide-react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [useVirtualization, setUseVirtualization] = useState(() => {
    // Check localStorage or default to false for compatibility
    const saved = localStorage.getItem('natty-virtualization');
    return saved === 'true';
  });

  // Save virtualization preference
  useEffect(() => {
    localStorage.setItem('natty-virtualization', useVirtualization.toString());
  }, [useVirtualization]);

  return (
    <Layout>
      
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 bg-gradient-to-r from-natty to-juicy bg-clip-text text-transparent leading-tight">
            Natty or Not?
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            The community verdict on whether your favorite influencer is natty or juicy.
          </p>
        </div>

        <div className="mb-16 max-w-2xl mx-auto space-y-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          {/* Virtualization Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-card/50 rounded-xl border">
            <span className="text-sm font-medium text-muted-foreground">Grid Mode:</span>
            <Button
              variant={!useVirtualization ? "default" : "outline"}
              size="sm"
              onClick={() => setUseVirtualization(false)}
              className="gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Masonry
            </Button>
            <Button
              variant={useVirtualization ? "default" : "outline"}
              size="sm"
              onClick={() => setUseVirtualization(true)}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Virtualized
            </Button>
          </div>
        </div>
        
        {/* Conditional Grid Rendering */}
        {useVirtualization ? (
          <VirtualizedInfluencerGrid searchTerm={searchTerm} />
        ) : (
          <InfluencerGrid searchTerm={searchTerm} />
        )}
        
        <div className="mt-32 mb-16">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-12 text-center border border-border/50">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Don't see your favorite influencer?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Help us grow the community by suggesting new fitness influencers to add to the platform! 
                Your suggestions help make the database more comprehensive.
              </p>
              <div className="flex justify-center">
                <SuggestInfluencer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
