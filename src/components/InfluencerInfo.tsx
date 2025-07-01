import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Influencer } from "@/types/vote";
import InfluencerPhotoGallery from './InfluencerPhotoGallery';
import SuggestInfluencerInfo from './SuggestInfluencerInfo';
import { Instagram, Youtube, Music, Link } from "lucide-react";

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
        {/* Social Links */}
        {influencer.social_links && Object.values(influencer.social_links).some(link => link) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {influencer.social_links.instagram && (
              <a
                href={influencer.social_links.instagram.startsWith('http') ? influencer.social_links.instagram : `https://instagram.com/${influencer.social_links.instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-pink-500 hover:underline text-sm"
              >
                <Instagram className="h-4 w-4" />Instagram
              </a>
            )}
            {influencer.social_links.youtube && (
              <a
                href={influencer.social_links.youtube.startsWith('http') ? influencer.social_links.youtube : `https://youtube.com/${influencer.social_links.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-500 hover:underline text-sm"
              >
                <Youtube className="h-4 w-4" />YouTube
              </a>
            )}
            {influencer.social_links.tiktok && (
              <a
                href={influencer.social_links.tiktok.startsWith('http') ? influencer.social_links.tiktok : `https://tiktok.com/@${influencer.social_links.tiktok.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-black hover:underline text-sm"
              >
                <Music className="h-4 w-4" />TikTok
              </a>
            )}
            {influencer.social_links.twitter && (
              <a
                href={influencer.social_links.twitter.startsWith('http') ? influencer.social_links.twitter : `https://twitter.com/${influencer.social_links.twitter.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
              >
                <Link className="h-4 w-4" />Twitter
              </a>
            )}
            {influencer.social_links.website && (
              <a
                href={influencer.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 hover:underline text-sm"
              >
                <Link className="h-4 w-4" />Website
              </a>
            )}
          </div>
        )}
        
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
        
        {/* Suggest Info Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <SuggestInfluencerInfo influencer={influencer} />
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerInfo;
