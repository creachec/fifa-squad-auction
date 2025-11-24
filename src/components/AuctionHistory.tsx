import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { History, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedAuction {
  id: string;
  name: string;
  total_budget: number;
  created_at: string;
  completed_at: string | null;
  status: string;
  teams_count?: number;
}

interface AuctionHistoryProps {
  onLoadAuction: (auctionId: string) => void;
}

export default function AuctionHistory({ onLoadAuction }: AuctionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [auctions, setAuctions] = useState<SavedAuction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          id,
          name,
          total_budget,
          created_at,
          completed_at,
          status,
          auction_teams (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAuctions = data.map(auction => ({
        ...auction,
        teams_count: auction.auction_teams?.[0]?.count || 0
      }));

      setAuctions(formattedAuctions);
    } catch (error) {
      console.error('Error loading auctions:', error);
      toast.error('Erro ao carregar histórico de leilões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAuctions();
    }
  }, [open]);

  const handleDelete = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', auctionId);

      if (error) throw error;

      toast.success('Leilão excluído com sucesso');
      loadAuctions();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error('Erro ao excluir leilão');
    }
  };

  const handleLoad = (auctionId: string) => {
    onLoadAuction(auctionId);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border-border"
      >
        <History className="h-4 w-4 mr-2" />
        Histórico de Leilões
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Histórico de Leilões</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum leilão salvo ainda
            </div>
          ) : (
            <div className="space-y-3">
              {auctions.map(auction => (
                <Card
                  key={auction.id}
                  className="p-4 bg-muted/50 border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg truncate">{auction.name}</h3>
                        <Badge variant={auction.status === 'completed' ? 'default' : 'secondary'}>
                          {auction.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Orçamento:</span> ${auction.total_budget}
                        </div>
                        <div>
                          <span className="font-medium">Times:</span> {auction.teams_count}
                        </div>
                        <div>
                          <span className="font-medium">Criado:</span>{' '}
                          {format(new Date(auction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                        {auction.completed_at && (
                          <div>
                            <span className="font-medium">Finalizado:</span>{' '}
                            {format(new Date(auction.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleLoad(auction.id)}
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Carregar
                      </Button>
                      <Button
                        onClick={() => handleDelete(auction.id)}
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
