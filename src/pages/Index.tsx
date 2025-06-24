
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import InfluencerGrid from "@/components/InfluencerGrid";
import VirtualizedInfluencerGrid from "@/components/VirtualizedInfluencerGrid";
import FlippableInfluencerGrid from "@/components/FlippableInfluencerGrid";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Button } from "@/components/ui/button";
import { Zap, Grid3X3, RotateCcw } from "lucide-react";

type GridMode = 'masonry' | 'virtualized' | 'flip';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gridMode, setGridMode] = useState<GridMode>(() => {
    // Check localStorage or default to masonry for compatibility
    const saved = localStorage.getItem('natty-grid-mode') as GridMode;
    return saved && ['masonry', 'virtualized', 'flip'].includes(saved) ? saved : 'masonry';
  });

  // Save grid mode preference
  useEffect(() => {
    localStorage.setItem('natty-grid-mode', gridMode);
  }, [gridMode]);

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
          
          {/* Grid Mode Toggle */}
          <div className="flex items-center justify-center gap-3 p-4 bg-card/50 rounded-xl border">
            <span className="text-sm font-medium text-muted-foreground">Grid Mode:</span>
            <Button
              variant={gridMode === 'masonry' ? "default" : "outline"}
              size="sm"
              onClick={() => setGridMode('masonry')}
              className="gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Masonry
            </Button>
            <Button
              variant={gridMode === 'virtualized' ? "default" : "outline"}
              size="sm"
              onClick={() => setGridMode('virtualized')}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Virtualized
            </Button>
            <Button
              variant={gridMode === 'flip' ? "default" : "outline"}
              size="sm"
              onClick={() => setGridMode('flip')}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Flip Cards
            </Button>
          </div>
        </div>
        
        {/* Conditional Grid Rendering */}
        {gridMode === 'virtualized' ? (
          <VirtualizedInfluencerGrid searchTerm={searchTerm} />
        ) : gridMode === 'flip' ? (
          <FlippableInfluencerGrid searchTerm={searchTerm} />
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
