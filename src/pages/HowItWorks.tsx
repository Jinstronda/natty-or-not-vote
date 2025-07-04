
import Layout from "@/components/Layout";

const HowItWorks = () => {
  return (
    <Layout>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-natty to-juicy bg-clip-text text-transparent">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Welcome to the ultimate fitness community platform where transparency meets accountability. 
            Vote on your favorite fitness influencers and help determine who's keeping it natural and who might be enhanced.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-natty/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-heading font-semibold">Vote Natty</h3>
              <p className="text-muted-foreground">
                Think they achieved their physique naturally? Cast your natty vote and share your reasoning. 
                Help the community understand what makes a transformation achievable through natural means.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-juicy/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💉</span>
              </div>
              <h3 className="text-xl font-heading font-semibold">Vote Juicy</h3>
              <p className="text-muted-foreground">
                Suspect enhancement use? Vote juicy and explain what makes you think so. 
                Share your observations about timeframes, muscle growth patterns, or other indicators.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-heading font-semibold">Community Discussion</h3>
              <p className="text-muted-foreground">
                Read expert reviews, engage with community thoughts, and form your own educated opinion. 
                Like or dislike reviews to help surface the most valuable insights.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-center">Our Mission</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              We believe in transparency and education within the fitness community. Our platform helps people 
              set realistic expectations and understand what's achievable naturally versus what might require 
              pharmaceutical assistance. This isn't about judgment - it's about informed decision making.
            </p>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              This platform is for educational and entertainment purposes. All votes and opinions are subjective 
              and should not be taken as medical or factual advice.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
