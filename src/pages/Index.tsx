
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
            Welcome to the ultimate fitness community platform where transparency meets accountability. 
            Vote on your favorite fitness influencers and help determine who's keeping it natural and who might be enhanced.
          </p>
          <div className="bg-card border border-border rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-heading font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-natty/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold">Vote Natty</h3>
                <p className="text-sm text-muted-foreground">
                  Think they achieved their physique naturally? Cast your natty vote and share your reasoning.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-juicy/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">💉</span>
                </div>
                <h3 className="font-semibold">Vote Juicy</h3>
                <p className="text-sm text-muted-foreground">
                  Suspect enhancement use? Vote juicy and explain what makes you think so.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold">Community Discussion</h3>
                <p className="text-sm text-muted-foreground">
                  Read expert reviews, engage with community thoughts, and form your own educated opinion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Suggest */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          <SuggestInfluencer />
        </div>
        
        {/* Influencers Grid */}
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

        {/* Footer Info */}
        <div className="mt-16 text-center text-muted-foreground">
          <p className="text-sm">
            This platform is for educational and entertainment purposes. All votes and opinions are subjective and should not be taken as medical or factual advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
