import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Influencer } from "@/types/vote";
import InfluencerPhotoGallery from './InfluencerPhotoGallery';

interface InfluencerInfoProps {
  influencer: Influencer;
}

function displayStatus(status: string | undefined) {
  if (!status) return 'Not Known';
  const s = status.toLowerCase();
  if (s === 'natty') return 'Natty';
  if (s === 'juicy') return 'Juicy';
  return 'Not Known';
}

function getStatusBadgeClass(status: string | undefined) {
  const s = status?.toLowerCase();
  if (s === 'natty') return 'bg-natty text-white';
  if (s === 'juicy') return 'bg-juicy text-white';
  return 'bg-gray-300 text-gray-700';
}

const InfluencerInfo = ({ influencer }: InfluencerInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Gallery at the top */}
        {influencer.photos && influencer.photos.length > 0 ? (
          <InfluencerPhotoGallery photos={influencer.photos} className="mb-6" />
        ) : (
          <div className="aspect-square mb-6 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
            <img 
              src={influencer.image} 
              alt={influencer.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
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
            <span className="font-medium">{influencer.years_training} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Claims:</span>
            <Badge className={getStatusBadgeClass(influencer.claimed_status)}>
              {displayStatus(influencer.claimed_status)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerInfo;
