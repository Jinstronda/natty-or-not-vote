
import { useState } from "react";
import Header from "@/components/Header";
import InfluencerCard from "@/components/InfluencerCard";
import SearchBar from "@/components/SearchBar";
import { useVoteStore } from "@/stores/VoteStore";

const Index = () => {
  const { influencers, getVotePercentages } = useVoteStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            <span className="text-natty">Natty</span> or{" "}
            <span className="text-juicy">Juicy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The community-driven platform to determine if fitness influencers are natural or enhanced
          </p>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </section>

      {/* Trending Discussions */}
      <section className="py-12 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Trending Discussions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInfluencers.map((influencer) => {
              const percentages = getVotePercentages(influencer.id);
              return (
                <InfluencerCard
                  key={influencer.id}
                  id={influencer.id}
                  name={influencer.name}
                  image={influencer.image}
                  nattyPercentage={percentages.natty}
                  juicyPercentage={percentages.juicy}
                  totalVotes={percentages.total}
                  platform=""
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
