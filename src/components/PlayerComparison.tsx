import { Player } from '@/types/auction';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerComparisonProps {
  player1: Player;
  player2: Player;
  onClose: () => void;
}

export function PlayerComparison({ player1, player2, onClose }: PlayerComparisonProps) {
  const getPhotoUrl = (player: Player) => {
    if (!player.eaId) return null;
    return `https://ratings-images-prod.pulse.ea.com/FC26/components/items/${player.eaId}_br.webp`;
  };

  const StatRow = ({ label, value1, value2 }: { label: string; value1: string | number; value2: string | number }) => {
    const isBetter1 = typeof value1 === 'number' && typeof value2 === 'number' && value1 > value2;
    const isBetter2 = typeof value1 === 'number' && typeof value2 === 'number' && value2 > value1;

    return (
      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center py-3 border-b border-border/50">
        <div className={`text-right font-semibold ${isBetter1 ? 'text-primary' : 'text-muted-foreground'}`}>
          {value1}
        </div>
        <div className="text-sm text-muted-foreground min-w-[120px] text-center">
          {label}
        </div>
        <div className={`text-left font-semibold ${isBetter2 ? 'text-primary' : 'text-muted-foreground'}`}>
          {value2}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Comparação de Jogadores</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Player Headers */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {[player1, player2].map((player, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-32 aspect-[440/548] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 mb-3">
                {getPhotoUrl(player) ? (
                  <img
                    src={getPhotoUrl(player)!}
                    alt={player.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-center">{player.name}</h3>
              <p className="text-sm text-muted-foreground">{player.team}</p>
            </div>
          ))}
        </div>

        {/* Stats Comparison */}
        <div className="space-y-1">
          <StatRow label="Rating" value1={player1.rating} value2={player2.rating} />
          <StatRow label="Posição" value1={player1.position} value2={player2.position} />
          <StatRow label="Preço Mínimo" value1={`€${player1.minPrice}M`} value2={`€${player2.minPrice}M`} />
          <StatRow label="Tipo" value1={player1.type} value2={player2.type} />
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Valores em <span className="text-primary font-semibold">destaque</span> indicam superioridade
          </p>
        </div>
      </Card>
    </div>
  );
}