# scripts/

Utilitários avulsos de coleta de dados. **Não fazem parte do bundle** — rodam à parte, por isso
`scripts/` está no `exclude` do `tsconfig.json`.

Vieram da linhagem anterior do currículo (repo `Curriculo-fgc`, ramo pré-refatoração) no resgate
de 04/08/2026.

| Script | O que faz |
|---|---|
| `fetch_fernando_yt.ts` | resolve o canal `@fernandogcortes` via Innertube (`youtubei.js`) e lista os vídeos |
| `fetch_channel.ts` | busca dados do canal por instâncias Invidious, como alternativa quando o Innertube falha |
| `get_yt_info.ts` | busca metadados de uma lista fixa de IDs de vídeo |
| `dados/trabalhos-raw.json` | saída processada de uma coleta anterior — referência |

## Estado

⚠️ `fetch_fernando_yt.ts` foi escrito contra uma versão anterior da `youtubei.js`. Na v17 os tipos
de retorno mudaram (`Video | LockupView | GridVideo | ...`), então as propriedades `title`, `id` e
`description_snippet` precisam de narrowing antes do uso. O script **não compila como está** —
precisa de ajuste se for reativado.

## Como rodar

```bash
npx tsx scripts/fetch_fernando_yt.ts
```

## O que ficou pra trás

Na linhagem antiga havia outros ~12 scripts que não foram trazidos por serem descartáveis:
tentativas duplicadas (`fetch_ysr.ts` / `fetch_ysr2.ts`, `get_drive.cjs` / `get_drive_2.cjs`),
três variações de coleta de playlists, e scripts de migração (`fix_202x.cjs`,
`update_constants.cjs`) que editavam o antigo `constants.ts` — arquivo que não existe mais, pois
os dados foram para `src/data/`.

Também ficaram de fora dois dumps brutos de scraping de ~870 KB cada (`youtube-playlists.json` e
`youtube.txt`), que eram lixo de processo.

Tudo isso continua acessível no histórico git da cópia de trabalho antiga, caso seja preciso.
