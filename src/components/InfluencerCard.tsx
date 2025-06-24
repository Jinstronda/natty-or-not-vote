import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { VoteButton } from "./VoteButton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { Lock } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion, type Variants } from "framer-motion";
import Image from 'next-export-optimize-images/image';

export interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
    photos?: { image_url: string }[];
  };
}

const InfluencerCard = ({ influencer }: InfluencerCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: voteStats, isLoading } = useVoteStats(influencer.id);

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/claim/${influencer.id}`);
  };

  // Calculate proper percentages that add up to 100%
  const totalVotes = voteStats?.total_votes || 0;
  const nattyCount = voteStats?.natty_count || 0;
  const juicyCount = totalVotes - nattyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

  const mainImage = influencer.photos && influencer.photos.length > 0
    ? influencer.photos[0].image_url
    : influencer.image;

  // Framer Motion variants for enhanced interactions
  const cardVariants: Variants = {
    idle: { 
      scale: 1, 
      y: 0,
      rotateX: 0,
      rotateY: 0,
    },
    hover: { 
      scale: 1.02, 
      y: -8,
      rotateX: -2,
      rotateY: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const imageVariants: Variants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const badgeVariants: Variants = {
    idle: { scale: 1, rotateZ: 0 },
    hover: { 
      scale: 1.05,
      rotateZ: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  const progressVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <motion.div
        variants={cardVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className={`group overflow-hidden shadow-lg transition-shadow duration-300
          ${!isLoading && voteStats && totalVotes > 0 && juicyPercentage > 50 ? 'hover:shadow-juicy/20' : ''}
          ${!isLoading && voteStats && totalVotes > 0 && nattyPercentage > 50 ? 'hover:shadow-natty/20' : ''}
        `}>
          <CardHeader className="p-0">
            <div className="aspect-square relative overflow-hidden">
              <motion.div
                variants={imageVariants}
                className="w-full h-full"
              >
                <Image
                  src={mainImage}
                  alt={influencer.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </motion.div>
              {influencer.claimed_status === 'claimed' && (
                <motion.div 
                  className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs"
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                >
                  Claimed
                </motion.div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <motion.h3
              className="font-semibold text-lg mb-2 text-center transition-colors text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {influencer.name}
            </motion.h3>
            
            {/* Vote Statistics */}
            {user && !isLoading && voteStats && totalVotes > 0 && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>💉 Juicy: {juicyPercentage}%</span>
                  <span>🏆 Natty: {nattyPercentage}%</span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden flex">
                    <motion.div
                      className="h-full bg-juicy"
                      style={{ width: `${juicyPercentage}%` }}
                      variants={progressVariants}
                      initial="hidden"
                      animate="visible"
                    />
                    <motion.div
                      className="h-full bg-natty"
                      style={{ width: `${nattyPercentage}%` }}
                      variants={progressVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <motion.div variants={badgeVariants}>
                    <Badge 
                      className={`
                        transition-all duration-300
                        ${nattyPercentage > 50 
                          ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30' 
                          : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30'
                        }
                      `}
                    >
                      {nattyPercentage > 50 ? "Natty" : "Juicy"} 
                      ({nattyPercentage > 50 ? nattyPercentage : juicyPercentage}%)
                    </Badge>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {!user && !isLoading && voteStats && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="space-y-2 select-none cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60">
                      <span>💉 Juicy</span>
                      <span>🏆 Natty</span>
                    </div>
                    <div className="relative">
                      <div className="w-full rounded-full h-2 overflow-hidden flex blur-sm opacity-80">
                        <div className="h-full bg-juicy transition-all duration-500" style={{ width: '50%' }} />
                        <div className="h-full bg-natty transition-all duration-500" style={{ width: '50%' }} />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs text-muted-foreground font-semibold drop-shadow-md select-none" style={{zIndex:0}}>Sign in to see verdicts</span>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Sign in to see verdicts and vote!</TooltipContent>
              </Tooltip>
            )}

            {!isLoading && voteStats && totalVotes === 0 && (
              <motion.div 
                className="text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                No votes yet
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex justify-center gap-2">
            {/* Removed VoteButton and Claim button as per new requirements. Only show the bar/statistics above. */}
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default InfluencerCard;
