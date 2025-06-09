
import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import OptimizedInfluencerGrid from "@/components/OptimizedInfluencerGrid";
import SuggestInfluencer from "@/components/SuggestInfluencer";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 bg-gradient-to-r from-natty to-juicy bg-clip-text text-transparent leading-tight">
            Natty or Not?
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            The community verdict on whether your favorite influencer is natty or juicy.
          </p>
        </div>

        {/* Search */}
        <div className="mb-16 max-w-2xl mx-auto">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        
        {/* Influencers Grid */}
        <OptimizedInfluencerGrid searchTerm={searchTerm} />
        
        {/* Suggest Influencer Section - Enhanced */}
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
    </div>
  );
};

export default Index;
