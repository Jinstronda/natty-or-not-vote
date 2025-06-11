import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Influencer } from "@/types/vote";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface InfluencerInfoProps {
  influencer: Influencer;
}

const InfluencerInfo = ({ influencer }: InfluencerInfoProps) => {
  const photos = influencer.photos && influencer.photos.length > 0
    ? influencer.photos
    : influencer.image
      ? [{ image_url: influencer.image, description: null }]
      : [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-square mb-6 rounded-lg overflow-hidden">
          {photos.length > 1 ? (
            <Carousel>
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id || photo.image_url}>
                    <div className="relative w-full h-full">
                      <img
                        src={photo.image_url}
                        alt={influencer.name}
                        className="w-full h-72 object-cover rounded-xl"
                      />
                      {photo.description && (
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs px-3 py-2 rounded-b-xl truncate pointer-events-none">
                          {photo.description}
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : photos.length === 1 ? (
            <div className="relative w-full h-full">
              <img
                src={photos[0].image_url}
                alt={influencer.name}
                className="w-full h-72 object-cover rounded-xl"
              />
              {photos[0].description && (
                <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs px-3 py-2 rounded-b-xl truncate pointer-events-none">
                  {photos[0].description}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-72 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
              No photo available
            </div>
          )}
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
            <span className="font-medium">{influencer.years_training} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Claims:</span>
            <Badge className={influencer.claimed_status === 'Natural' ? 'bg-natty' : 'bg-juicy'}>
              {influencer.claimed_status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerInfo;
