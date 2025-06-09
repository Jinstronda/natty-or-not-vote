
import { Link } from "react-router-dom";

interface InfluencerCardProps {
  id: string;
  name: string;
  image: string;
  nattyPercentage: number;
  juicyPercentage: number;
  totalVotes: number;
  platform: string;
}

const InfluencerCard = ({ 
  id, 
  name, 
  image, 
  nattyPercentage, 
  juicyPercentage, 
  totalVotes
}: InfluencerCardProps) => {
  return (
    <Link to={`/influencer/${id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200 hover:scale-105 group">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-heading font-semibold text-lg mb-3 truncate">
            {name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-natty font-medium">Natty</span>
              <span className="text-natty font-bold">{nattyPercentage}%</span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-natty transition-all duration-300"
                style={{ width: `${nattyPercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-juicy font-medium">Juicy</span>
              <span className="text-juicy font-bold">{juicyPercentage}%</span>
            </div>
            
            <div className="text-xs text-muted-foreground text-center mt-3">
              {totalVotes.toLocaleString()} votes
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InfluencerCard;
