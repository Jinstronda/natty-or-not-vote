
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-natty to-juicy bg-clip-text text-transparent">
            Natty or Not?
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The community verdict on whether your favorite influencer is natty or juicy.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        
        {/* Trending Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInfluencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
        
        {filteredInfluencers.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-semibold mb-4">No influencers found</h2>
            <p className="text-muted-foreground mb-6">
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
