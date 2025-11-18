import { Team, PlayerAssignment } from '@/types/auction';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { selectBest11For433, isPlayerAdapted, getRatingColor } from '@/utils/tacticalFormation';

interface TacticalViewProps {
  team: Team;
}

interface PlayerCardProps {
  player: PlayerAssignment | null;
  position: string;
  gridPosition: string;
}

function PlayerCard({ player, position, gridPosition }: PlayerCardProps) {
  if (!player) {
    return (
      <div className={`${gridPosition} flex items-center justify-center`}>
        <Card className="w-24 h-28 flex flex-col items-center justify-center bg-muted/50 border-dashed border-muted-foreground/30">
          <span className="text-xs text-muted-foreground">{position}</span>
          <span className="text-xs text-muted-foreground/50">Vazio</span>
        </Card>
      </div>
    );
  }

  const adapted = isPlayerAdapted(player, position);
  const ratingColor = getRatingColor(player.player.rating);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${gridPosition} flex items-center justify-center`}>
            <Card className="w-24 h-28 flex flex-col items-center justify-center bg-card border-border hover:border-primary transition-all cursor-pointer">
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {position}
                </Badge>
                {adapted && (
                  <Badge variant="destructive" className="text-[8px] px-1 py-0">
                    ADAPT
                  </Badge>
                )}
              </div>
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: ratingColor }}
              >
                {player.player.rating}
              </div>
              <div className="text-[10px] text-center text-foreground px-1 truncate w-full">
                {player.player.name.split(' ').slice(-1)[0]}
              </div>
            </Card>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{player.player.name}</p>
            <p className="text-xs text-muted-foreground">
              Posição Natural: {player.player.position}
            </p>
            <p className="text-xs text-muted-foreground">
              Clube: {player.player.team}
            </p>
            <p className="text-xs text-muted-foreground">
              Preço: ${player.pricePaid}
            </p>
            {adapted && (
              <p className="text-xs text-destructive">
                Jogador adaptado de {player.player.position} para {position}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function TacticalView({ team }: TacticalViewProps) {
  const formation = selectBest11For433(team);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-8 bg-gradient-to-b from-[hsl(120,40%,25%)] to-[hsl(120,35%,20%)] border-border relative overflow-hidden">
        {/* Field lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 w-px h-full bg-white transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Formation Grid */}
        <div className="relative grid grid-rows-4 gap-8">
          {/* Attack - 3 players */}
          <div className="grid grid-cols-3 gap-4">
            <PlayerCard player={formation.lw} position="LW" gridPosition="col-start-1" />
            <PlayerCard player={formation.st} position="ST" gridPosition="col-start-2" />
            <PlayerCard player={formation.rw} position="RW" gridPosition="col-start-3" />
          </div>

          {/* Midfield - 3 players */}
          <div className="grid grid-cols-3 gap-4">
            <PlayerCard player={formation.cm1} position="CM" gridPosition="col-start-1" />
            <PlayerCard player={formation.cm2} position="CM" gridPosition="col-start-2" />
            <PlayerCard player={formation.cm3} position="CM" gridPosition="col-start-3" />
          </div>

          {/* Defense - 4 players */}
          <div className="grid grid-cols-4 gap-4">
            <PlayerCard player={formation.lb} position="LB" gridPosition="col-start-1" />
            <PlayerCard player={formation.cb1} position="CB" gridPosition="col-start-2" />
            <PlayerCard player={formation.cb2} position="CB" gridPosition="col-start-3" />
            <PlayerCard player={formation.rb} position="RB" gridPosition="col-start-4" />
          </div>

          {/* Goalkeeper - 1 player */}
          <div className="grid grid-cols-1">
            <PlayerCard player={formation.gk} position="GK" gridPosition="col-start-1 mx-auto" />
          </div>
        </div>

        {/* Formation label */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-background/80 text-foreground border-border">
            4-3-3
          </Badge>
        </div>
      </Card>
    </div>
  );
}
