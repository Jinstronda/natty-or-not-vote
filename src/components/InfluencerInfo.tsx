
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Influencer } from "@/types/vote";

interface InfluencerInfoProps {
  influencer: Influencer;
}

const InfluencerInfo = ({ influencer }: InfluencerInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-square mb-6 rounded-lg overflow-hidden">
          <img 
            src={influencer.image} 
            alt={influencer.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="font-heading font-bold text-2xl mb-2">
          {influencer.name}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {influencer.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Height:</span>
            <span className="font-medium">{influencer.height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium">{influencer.weight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Training:</span>
            <span className="font-medium">{influencer.yearsTraining} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Claims:</span>
            <Badge className={influencer.claimedStatus === 'Natural' ? 'bg-natty' : 'bg-juicy'}>
              {influencer.claimedStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerInfo;
