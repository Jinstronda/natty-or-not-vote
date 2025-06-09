
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VotingSectionProps {
  nattyVotes: number;
  juicyVotes: number;
  userVote?: 'natty' | 'juicy' | null;
  onVote: (vote: 'natty' | 'juicy') => void;
}

const VotingSection = ({ nattyVotes, juicyVotes, userVote, onVote }: VotingSectionProps) => {
  const totalVotes = nattyVotes + juicyVotes;
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyVotes / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? Math.round((juicyVotes / totalVotes) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-bold text-2xl mb-6 text-center">
        What do you think?
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          size="lg"
          onClick={() => onVote('natty')}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote === 'natty' 
              ? 'bg-natty hover:bg-natty/90 text-white' 
              : 'bg-natty/10 border border-natty text-natty hover:bg-natty hover:text-white'
          }`}
        >
          🏆 Natty
        </Button>
        
        <Button
          size="lg"
          onClick={() => onVote('juicy')}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote === 'juicy' 
              ? 'bg-juicy hover:bg-juicy/90 text-white' 
              : 'bg-juicy/10 border border-juicy text-juicy hover:bg-juicy hover:text-white'
          }`}
        >
          💉 Juicy
        </Button>
      </div>
      
      {totalVotes > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-natty font-semibold">Natty: {nattyPercentage}%</span>
            <span className="text-juicy font-semibold">Juicy: {juicyPercentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-natty transition-all duration-500"
                style={{ width: `${nattyPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {totalVotes.toLocaleString()} total votes
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingSection;
