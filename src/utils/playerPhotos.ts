import { Player } from '@/types/auction';

export function getPlayerPhotoUrl(player: Player): string {
  if (player.avatarUrl) {
    return player.avatarUrl;
  }
  if (player.eaId) {
    return `https://ratings-images-prod.pulse.ea.com/FC26/components/items/${player.eaId}_br.webp`;
  }
  return getPlaceholderAvatar(player.name);
}

export function getPlaceholderAvatar(playerName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=1e293b&color=fff&size=200&font-size=0.4`;
}
