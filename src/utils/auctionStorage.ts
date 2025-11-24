import { supabase } from '@/integrations/supabase/client';
import { Team, Player } from '@/types/auction';

export async function saveAuction(
  name: string,
  teams: Team[],
  totalBudget: number,
  status: 'in_progress' | 'completed'
) {
  try {
    // Create auction record
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .insert({
        name,
        total_budget: totalBudget,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (auctionError) throw auctionError;

    // Save teams
    for (const team of teams) {
      const { data: savedTeam, error: teamError } = await supabase
        .from('auction_teams')
        .insert({
          auction_id: auction.id,
          name: team.name,
          color: team.color,
          budget: team.budget,
          initial_budget: team.initialBudget
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Save players for this team
      if (team.players.length > 0) {
        const playersData = team.players.map(p => ({
          auction_team_id: savedTeam.id,
          player_name: p.player.name,
          player_position: p.player.position,
          player_team: p.player.team,
          player_rating: p.player.rating,
          player_type: p.player.type,
          price_paid: p.pricePaid,
          is_starter: p.isStarter,
          ea_id: p.player.eaId
        }));

        const { error: playersError } = await supabase
          .from('auction_players')
          .insert(playersData);

        if (playersError) throw playersError;
      }
    }

    return { success: true, auctionId: auction.id };
  } catch (error) {
    console.error('Error saving auction:', error);
    return { success: false, error };
  }
}

export async function loadAuction(auctionId: string) {
  try {
    // Load auction details
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError) throw auctionError;

    // Load teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('auction_teams')
      .select('*')
      .eq('auction_id', auctionId);

    if (teamsError) throw teamsError;

    // Load players for each team
    const teams: Team[] = await Promise.all(
      teamsData.map(async (teamData) => {
        const { data: playersData, error: playersError } = await supabase
          .from('auction_players')
          .select('*')
          .eq('auction_team_id', teamData.id);

        if (playersError) throw playersError;

        const players = playersData.map(p => ({
          player: {
            name: p.player_name,
            position: p.player_position,
            team: p.player_team,
            rating: p.player_rating,
            type: p.player_type as 'Elite' | 'Mediano',
            minPrice: p.price_paid,
            eaId: p.ea_id
          } as Player,
          pricePaid: p.price_paid,
          isStarter: p.is_starter
        }));

        return {
          id: teamData.id,
          name: teamData.name,
          color: teamData.color,
          budget: teamData.budget,
          initialBudget: teamData.initial_budget,
          players
        };
      })
    );

    return {
      success: true,
      auction: {
        id: auction.id,
        name: auction.name,
        totalBudget: auction.total_budget,
        status: auction.status,
        teams
      }
    };
  } catch (error) {
    console.error('Error loading auction:', error);
    return { success: false, error };
  }
}
