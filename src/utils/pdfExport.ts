import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Team } from '@/types/auction';

export function exportToPDF(teams: Team[]) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 217, 255); // Primary color
  doc.text('FIFA 26 Auction - Relatório Final', 14, 20);
  
  let yPosition = 35;

  teams.forEach((team, index) => {
    // Add new page for each team after the first
    if (index > 0) {
      doc.addPage();
      yPosition = 20;
    }

    // Team Header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(team.name, 14, yPosition);
    
    yPosition += 10;

    // Team Stats
    const totalSpent = team.initialBudget - team.budget;
    const avgPrice = team.players.length > 0 ? totalSpent / team.players.length : 0;
    const avgRating =
      team.players.length > 0
        ? team.players.reduce((sum, p) => sum + p.player.rating, 0) / team.players.length
        : 0;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Orçamento Inicial: $${team.initialBudget}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Orçamento Restante: $${team.budget}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Total Gasto: $${totalSpent}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Preço Médio: $${avgPrice.toFixed(2)}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Rating Médio: ${avgRating.toFixed(1)}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Total de Jogadores: ${team.players.length}`, 14, yPosition);
    yPosition += 10;

    // Players Table
    const starters = team.players.filter((p) => p.isStarter);
    const subs = team.players.filter((p) => !p.isStarter);

    if (starters.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Titulares', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Posição', 'Nome', 'Time', 'Rating', 'Preço']],
        body: starters.map((p) => [
          p.player.position,
          p.player.name,
          p.player.team,
          p.player.rating.toString(),
          `$${p.pricePaid}`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 217, 255] },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    if (subs.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Reservas', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Posição', 'Nome', 'Time', 'Rating', 'Preço']],
        body: subs.map((p) => [
          p.player.position,
          p.player.name,
          p.player.team,
          p.player.rating.toString(),
          p.pricePaid === 0 ? 'GRÁTIS' : `$${p.pricePaid}`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 255, 136] },
        styles: { fontSize: 8 },
      });
    }
  });

  // Save PDF
  doc.save('fifa26-auction-report.pdf');
}
