# FIFA Squad Auction

Monte elencos do EA Sports FC com seus amigos em um leilão de jogadores. Cada clube começa com um orçamento, disputa os atletas de cada posição e acompanha quanto ainda pode gastar.

## Como funciona

1. Cadastre pelo menos dois clubes e defina o nome, a cor e o orçamento inicial de cada um.
2. Registre os lances pelos jogadores da categoria **Elite**. O painel mostra o lance mínimo, o saldo dos clubes e o histórico das arrematações.
3. Encerre o leilão para distribuir jogadores da categoria **Mediano**. O sorteio tenta preencher as vagas de titulares e reservas com os atletas disponíveis.
4. Consulte as formações e os gastos de cada clube no relatório final. Use **Exportar PDF** para baixar os resultados.

A base de jogadores inclui nome, posição e nota geral. A interface permite editar o catálogo durante a sessão.

## Como rodar localmente

Você precisa de Node.js 22 ou superior e npm.

```bash
git clone https://github.com/creachec/fifa-squad-auction.git
cd fifa-squad-auction
npm ci
npm run dev
```

Abra [http://127.0.0.1:8080](http://127.0.0.1:8080). Para gerar o build web, use `npm run build`. Para abrir uma prévia do build, use `npm run preview`.

## Dados e salvamento

O catálogo inicial vem de [`src/data/players.csv`](src/data/players.csv). O salvamento e a retomada de elencos usam o Supabase.

Para usar seu próprio banco, aplique as [migrações](supabase/migrations) no seu projeto Supabase e configure a URL e a chave publicável em [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts). A migração atual permite operações anônimas no histórico de leilões.

O app web usa React, TypeScript, Vite, Tailwind CSS e shadcn/ui. O projeto também inclui a configuração do Capacitor para [Android](android).
