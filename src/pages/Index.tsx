
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import InfluencerCard from "@/components/InfluencerCard";

// Mock data for trending influencers
const trendingInfluencers = [
  {
    id: "1",
    name: "David Laid",
    image: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=400&h=400&fit=crop",
    nattyPercentage: 73,
    juicyPercentage: 27,
    totalVotes: 15420,
    platform: "Instagram"
  },
  {
    id: "2", 
    name: "Jeff Nippard",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    nattyPercentage: 89,
    juicyPercentage: 11,
    totalVotes: 23750,
    platform: "YouTube"
  },
  {
    id: "3",
    name: "Mike Mentzer",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51cd?w=400&h=400&fit=crop",
    nattyPercentage: 12,
    juicyPercentage: 88,
    totalVotes: 8940,
    platform: "Legend"
  },
  {
    id: "4",
    name: "Chris Bumstead",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop",
    nattyPercentage: 5,
    juicyPercentage: 95,
    totalVotes: 45230,
    platform: "Instagram"
  },
  {
    id: "5",
    name: "AthleanX Jeff",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    nattyPercentage: 67,
    juicyPercentage: 33,
    totalVotes: 18750,
    platform: "YouTube"
  },
  {
    id: "6",
    name: "Zyzz",
    image: "https://images.unsplash.com/photo-1583468982237-a2cbf74e1e36?w=400&h=400&fit=crop",
    nattyPercentage: 23,
    juicyPercentage: 77,
    totalVotes: 67890,
    platform: "Legend"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 animate-fade-in">
            <span className="text-natty">Natty</span>
            <span className="text-muted-foreground"> or </span>
            <span className="text-juicy">Juicy</span>
            <span className="text-foreground">?</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
            Vote on whether your favorite fitness influencers are natural or enhanced. 
            Join the community debate that's reshaping fitness transparency.
          </p>
          
          <div className="animate-fade-in">
            <SearchBar />
          </div>
        </div>
      </section>
      
      {/* Trending Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-12">
            🔥 Trending Discussions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.id}
                {...influencer}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
            Join the Movement
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your account to vote, submit reviews, and contribute to the fitness community's 
            quest for transparency and truth.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors">
              Sign Up Free
            </button>
            <button className="border border-border hover:bg-card text-foreground px-8 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
