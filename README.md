# NewsFlow — teste de aceitação com Playwright

Três testes de aceitação, em navegador real, para a tela de agendamento de envios do NewsFlow.

## Como rodar

```bash
npm i                 # instala as dependências e o Chromium do Playwright
npx playwright test   # sobe o app sozinho e roda os 3 testes
npm run relatorio     # abre o relatório HTML
```

No Linux ou no WSL, se faltar alguma biblioteca do sistema, rode `npx playwright install --with-deps chromium`.

Para abrir o app no navegador sem os testes: `node server.js` e acesse http://127.0.0.1:5173.

## Arquivos

- `app/`: o app (HTML, CSS e JavaScript puro, com o estado no `localStorage`).
- `server.js`: servidor estático, sem dependências, que o Playwright sobe pelo `webServer`.
- `tests/agendamento.spec.js`: os 3 testes.
- `ACEITACAO.md`: critérios, rastreabilidade e anti-teste.
- `playwright-report/` e `evidencias/`: relatório HTML e saídas usadas como evidência.
- `scripts/anti-teste.js`: quebra cada regra do app e confere que o teste correspondente fica vermelho.
