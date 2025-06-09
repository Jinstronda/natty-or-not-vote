
import { Link } from "react-router-dom";
import { useOptimizedVotes } from "@/hooks/useOptimizedVotes";

interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
  };
}

const InfluencerCard = ({ influencer }: InfluencerCardProps) => {
  const { getVotePercentages } = useOptimizedVotes(influencer.id);
  const { natty, juicy, total } = getVotePercentages();

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={influencer.image || "/placeholder.svg"} 
            alt={influencer.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Percentage Overlay */}
          {total > 0 && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-1">
                  <span className="text-natty">{natty}%</span>
                  <span className="text-muted-foreground mx-2">vs</span>
                  <span className="text-juicy">{juicy}%</span>
                </div>
                <div className="text-xs opacity-90">{total} votes</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-heading font-semibold text-sm mb-3 truncate text-center">
            {influencer.name}
          </h3>
          
          {total > 0 ? (
            <div className="space-y-2">
              {/* Visual percentage bar */}
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-natty to-natty/80 transition-all duration-500"
                  style={{ width: `${natty}%` }}
                />
              </div>
              
              {/* Percentage text */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-natty font-bold">{natty}%</span>
                <span className="text-juicy font-bold">{juicy}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded-full py-2 px-3">
                No votes yet
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default InfluencerCard;
