import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Play } from 'lucide-react';
import { Team } from '@/types/auction';

interface TeamSetupProps {
  onStart: (teams: Team[]) => void;
}

const PRESET_COLORS = [
  '#00D9FF', // Cyan
  '#00FF88', // Green
  '#FF3366', // Red
  '#FFAA00', // Orange
  '#AA00FF', // Purple
  '#FF00AA', // Pink
  '#00FFFF', // Aqua
  '#FFFF00', // Yellow
];

export default function TeamSetup({ onStart }: TeamSetupProps) {
  const [teams, setTeams] = useState<Array<{ name: string; color: string; budget: number }>>([
    { name: 'Time 1', color: PRESET_COLORS[0], budget: 1000 },
    { name: 'Time 2', color: PRESET_COLORS[1], budget: 1000 },
    { name: 'Time 3', color: PRESET_COLORS[2], budget: 1000 },
    { name: 'Time 4', color: PRESET_COLORS[3], budget: 1000 },
  ]);

  const addTeam = () => {
    const colorIndex = teams.length % PRESET_COLORS.length;
    setTeams([...teams, { 
      name: `Time ${teams.length + 1}`, 
      color: PRESET_COLORS[colorIndex], 
      budget: 1000 
    }]);
  };

  const removeTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const updateTeam = (index: number, field: string, value: string | number) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    setTeams(newTeams);
  };

  const handleStart = () => {
    const formattedTeams: Team[] = teams.map((t, i) => ({
      id: `team-${i}`,
      name: t.name,
      color: t.color,
      budget: t.budget,
      initialBudget: t.budget,
      players: [],
    }));
    onStart(formattedTeams);
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FIFA 26 Auction
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure os times e comece o leilão
          </p>
        </div>

        <div className="space-y-4">
          {teams.map((team, index) => (
            <Card key={index} className="p-6 bg-card border-border shadow-card">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Nome do Time</Label>
                  <Input
                    value={team.name}
                    onChange={(e) => updateTeam(index, 'name', e.target.value)}
                    placeholder="Nome do time"
                    className="bg-muted border-border"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={team.color}
                      onChange={(e) => updateTeam(index, 'color', e.target.value)}
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
                <div className="w-40 space-y-2">
                  <Label>Orçamento</Label>
                  <Input
                    type="number"
                    value={team.budget}
                    onChange={(e) => updateTeam(index, 'budget', parseInt(e.target.value) || 0)}
                    placeholder="1000"
                    className="bg-muted border-border"
                  />
                </div>
                {teams.length > 2 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTeam(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={addTeam}
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Time
          </Button>
          <Button
            onClick={handleStart}
            disabled={teams.length < 2}
            className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            <Play className="h-4 w-4 mr-2" />
            Começar Leilão
          </Button>
        </div>
      </div>
    </div>
  );
}
