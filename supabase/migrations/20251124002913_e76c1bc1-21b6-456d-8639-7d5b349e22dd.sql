-- Create auctions table to store auction sessions
CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_budget INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed'))
);

-- Create auction_teams table to store teams in each auction
CREATE TABLE public.auction_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  budget INTEGER NOT NULL,
  initial_budget INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auction_players table to store player assignments
CREATE TABLE public.auction_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_team_id UUID NOT NULL REFERENCES public.auction_teams(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_position TEXT NOT NULL,
  player_team TEXT NOT NULL,
  player_rating INTEGER NOT NULL,
  player_type TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  is_starter BOOLEAN NOT NULL DEFAULT true,
  ea_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view auctions" 
ON public.auctions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auctions" 
ON public.auctions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update auctions" 
ON public.auctions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete auctions" 
ON public.auctions 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view auction_teams" 
ON public.auction_teams 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auction_teams" 
ON public.auction_teams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view auction_players" 
ON public.auction_players 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create auction_players" 
ON public.auction_players 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_auction_teams_auction_id ON public.auction_teams(auction_id);
CREATE INDEX idx_auction_players_team_id ON public.auction_players(auction_team_id);
CREATE INDEX idx_auctions_created_at ON public.auctions(created_at DESC);