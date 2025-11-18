import { Team, PlayerAssignment } from '@/types/auction';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { selectBest11For433, isPlayerAdapted, getRatingColor } from '@/utils/tacticalFormation';
import { getPlayerPhotoUrl, getPlaceholderAvatar } from '@/utils/playerPhotos';

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
        <Card className="w-28 h-40 flex flex-col items-center justify-center bg-muted/50 border-dashed border-muted-foreground/30">
          <span className="text-xs text-muted-foreground">{position}</span>
          <span className="text-xs text-muted-foreground/50">Vazio</span>
        </Card>
      </div>
    );
  }

  const adapted = isPlayerAdapted(player, position);
  const ratingColor = getRatingColor(player.player.rating);
  const photoUrl = getPlayerPhotoUrl(player.player);
  const lastName = player.player.name.split(' ').slice(-1)[0];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${gridPosition} flex items-center justify-center`}>
            <Card className="w-28 h-40 flex flex-col items-center justify-center bg-gradient-to-b from-card to-card/80 hover:shadow-xl transition-all cursor-pointer hover:scale-105 relative overflow-hidden">
              {/* Gradiente de fundo baseado no rating */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${ratingColor} 0%, transparent 100%)`
                }}
              />
              
              {/* Foto do Jogador */}
              <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-border shadow-md">
                <img 
                  src={photoUrl} 
                  alt={player.player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderAvatar(player.player.name);
                  }}
                />
              </div>

              {/* Rating */}
              <div 
                className="relative z-10 text-2xl font-black mb-1 drop-shadow-md"
                style={{ color: ratingColor }}
              >
                {player.player.rating}
              </div>

              {/* Nome (Sobrenome) */}
              <div className="relative z-10 text-[11px] font-semibold text-center text-foreground px-1 truncate w-full">
                {lastName}
              </div>

              {/* Badges */}
              <div className="relative z-10 flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-[8px] px-1 py-0 bg-background/80">
                  {position}
                </Badge>
                {adapted && (
                  <Badge variant="destructive" className="text-[8px] px-1 py-0">
                    ADAPT
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-bold">{player.player.name}</p>
            <p className="text-xs text-muted-foreground">{player.player.team}</p>
            <p className="text-xs">Posição Natural: <span className="font-semibold">{player.player.position}</span></p>
            <p className="text-xs">Preço Pago: <span className="font-semibold">${player.pricePaid}</span></p>
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
