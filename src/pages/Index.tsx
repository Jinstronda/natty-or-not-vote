
import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import InfluencerCard from "@/components/InfluencerCard";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { useVoteStore } from "@/stores/VoteStore";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { influencers, loading } = useVoteStore();
  
  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading influencers...</p>
        </div>
      </div>
    );
  }

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
        
        {/* Trending Influencers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {filteredInfluencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
        
        {filteredInfluencers.length === 0 && searchTerm && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-heading font-semibold mb-6">No influencers found</h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Can't find "{searchTerm}"? Help us grow the community by suggesting them!
            </p>
            <SuggestInfluencer />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
