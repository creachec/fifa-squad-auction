import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Team } from '@/types/auction';

export function exportToPDF(teams: Team[]) {
  const doc = new jsPDF();

  // Document styles
  const primaryColor: [number, number, number] = [0, 101, 49]; // Darkened Primary for white bg
  const secondaryColor: [number, number, number] = [200, 150, 0]; // Darkened Secondary for white bg
  const black: [number, number, number] = [0, 0, 0];
  const gray: [number, number, number] = [100, 100, 100];

  // Title
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('FIFA 26 Auction - Executive Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  let yPosition = 40;

  // Sort teams by Rating
  const sortedTeams = [...teams].sort((a, b) => {
    const aRating = a.players.length ? a.players.reduce((sum, p) => sum + p.player.rating, 0) / a.players.length : 0;
    const bRating = b.players.length ? b.players.reduce((sum, p) => sum + p.player.rating, 0) / b.players.length : 0;
    return bRating - aRating;
  });

  sortedTeams.forEach((team, index) => {
    // Add new page for each team after the first
    if (index > 0) {
      doc.addPage();
      yPosition = 20;
    }

    // Team Header section
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPosition, 182, 30, 'F');

    doc.setFontSize(18);
    doc.setTextColor(...black);
    doc.text(team.name.toUpperCase(), 20, yPosition + 12);

    // Summary Stats
    const totalSpent = team.initialBudget - team.budget;
    const avgPrice = team.players.length > 0 ? totalSpent / team.players.length : 0;
    const avgRating = team.players.length > 0 ? team.players.reduce((sum, p) => sum + p.player.rating, 0) / team.players.length : 0;

    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(`RANK: #${index + 1}`, 150, yPosition + 12);

    yPosition += 22;
    doc.setFontSize(9);
    doc.text(`BUDGET REMAINING: $${(team.budget / 1000000).toFixed(2)}M / $${(team.initialBudget / 1000000).toFixed(2)}M`, 20, yPosition);
    doc.text(`TOTAL SPENT: $${(totalSpent / 1000000).toFixed(2)}M`, 95, yPosition);
    doc.text(`OVR RATING: ${avgRating.toFixed(1)}`, 150, yPosition);

    yPosition += 15;

    // Tactical Breakdown (Counts)
    const posCounts = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
    team.players.forEach(p => {
      const pos = p.player.position;
      if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) posCounts.DEF++;
      else if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)) posCounts.MID++;
      else if (['ST', 'CF', 'LW', 'RW'].includes(pos)) posCounts.ATT++;
      else posCounts.GK++;
    });

    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Squad Positional Depth', 14, yPosition);
    yPosition += 6;
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text(`Goalkeepers: ${posCounts.GK}   Defenders: ${posCounts.DEF}   Midfielders: ${posCounts.MID}   Attackers: ${posCounts.ATT}`, 14, yPosition);
    yPosition += 12;

    // Players Tables
    const elitePlayers = team.players.filter(p => p.player.type === 'Elite');
    const midPlayers = team.players.filter(p => p.player.type === 'Mediano');

    if (elitePlayers.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Pos', 'Player Name', 'Team', 'OVR', 'Price Paid']],
        body: elitePlayers.map(p => [
          p.player.position,
          p.player.name,
          p.player.team,
          p.player.rating.toString(),
          `$${p.pricePaid.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [164, 255, 185], textColor: [0, 101, 49], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (midPlayers.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Pos', 'Player Name', 'Team', 'OVR', 'Price Paid']],
        body: midPlayers.map(p => [
          p.player.position,
          p.player.name,
          p.player.team,
          p.player.rating.toString(),
          p.pricePaid === 0 ? 'FREE' : `$${p.pricePaid.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [100, 100, 100], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
    }
  });

  // Save PDF
  doc.save(`fifa26-auction-report-${new Date().getTime()}.pdf`);
}
