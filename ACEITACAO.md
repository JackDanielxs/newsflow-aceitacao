# Aceitação — agendamento do NewsFlow

O app é a tela de agendamento de envios do NewsFlow, com as regras RN02 (só edição aprovada vai para envio) e RN03 (antecedência mínima e limite de reagendamentos). Todos os testes partem das 09:00 de 10/03/2026 no horário de São Paulo, com o relógio da página parado nesse instante.

## Critérios de aceite

| # | Critério | Dado que… quando… então… |
| --- | --- | --- |
| C1 | Agendar envio | Dado que "Informativo #42" está aprovada · quando a gestora agenda o envio para 10/03/2026 às 09:30 · então vê "Envio agendado", o envio aparece na lista com esse horário e o resumo mostra "1 envio agendado" |
| C2 | Recusar antecedência menor que 15 minutos | Dado que são 09:00 · quando a gestora agenda o envio para 09:14 · então vê "O envio precisa de ao menos 15 minutos" e a lista continua vazia |
| C3 | Limite de reagendamentos persiste | Dado que o envio foi reagendado 2 vezes · quando a gestora recarrega a página e tenta reagendar de novo · então o envio mantém o horário e o contador "2 de 2", e ela vê "Limite de 2 reagendamentos atingido" |

## Critério → teste → evidência

| Cenário | Critério | Teste | O que prova | Evidência |
| --- | --- | --- | --- | --- |
| Caminho principal | C1 | [tests/agendamento.spec.js:25](tests/agendamento.spec.js#L25) | Do primeiro clique ao resultado na tela: mensagem, item na lista com edição e horário, e resumo atualizado | Relatório HTML · teste 1 verde |
| Regra que barra erro | C2 | [tests/agendamento.spec.js:35](tests/agendamento.spec.js#L35) | O app recusa 14 minutos de antecedência, avisa a gestora e não cria o envio | Relatório HTML · teste 2 verde |
| Regra de estado | C3 | [tests/agendamento.spec.js:43](tests/agendamento.spec.js#L43) | O horário e o contador sobrevivem ao recarregar, e o terceiro reagendamento é recusado depois do reload | Relatório HTML · teste 3 verde |

O relatório está em `playwright-report/index.html` (abra com `npm run relatorio`) e a captura com os 3 testes verdes em [evidencias/relatorio-verde.png](evidencias/relatorio-verde.png).

## Anti-teste

`npm run anti-teste` remove cada regra do app, roda o teste que a protege e restaura o app em seguida. Cada quebra deixou o teste correspondente vermelho:

| Regra removida do app | Teste que ficou vermelho |
| --- | --- |
| O agendamento entra na lista | agenda o envio de uma edição aprovada… |
| Antecedência mínima de 15 minutos | recusa o agendamento com menos de 15 minutos… |
| O estado sobrevive ao recarregar | mantém o limite de 2 reagendamentos… |
| Limite de 2 reagendamentos | mantém o limite de 2 reagendamentos… |

Saída da execução (também em [evidencias/anti-teste.txt](evidencias/anti-teste.txt)):

```text
VERMELHO  O agendamento entra na lista  →  "agenda o envio de uma edição aprovada"
VERMELHO  Antecedência mínima de 15 minutos  →  "recusa o agendamento com menos de 15 minutos"
VERMELHO  O estado sobrevive ao recarregar  →  "mantém o limite de 2 reagendamentos"
VERMELHO  Limite de 2 reagendamentos  →  "mantém o limite de 2 reagendamentos"

As 4 quebras deixaram o teste correspondente vermelho. App restaurado.
```
