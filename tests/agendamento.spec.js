// tests/agendamento.spec.js
const { test, expect } = require('@playwright/test')

// Todo teste começa às 09:00 de 10/03/2026 em São Paulo, com o relógio da página parado nesse instante.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-03-10T09:00:00-03:00'))
  await page.goto('/')
})

async function agendarEnvio(page, edicao, horario) {
  await page.getByLabel('Edição').selectOption(edicao)
  await page.getByLabel('Data e hora do envio').fill(horario)
  await page.getByRole('button', { name: 'Agendar envio' }).click()
}

function enviosAgendados(page) {
  return page.getByRole('list', { name: 'Envios agendados' }).getByRole('listitem')
}

async function reagendar(envio, horario) {
  await envio.getByLabel('Novo horário').fill(horario)
  await envio.getByRole('button', { name: 'Reagendar' }).click()
}

test('agenda o envio de uma edição aprovada e mostra o horário na lista', async ({ page }) => {
  await agendarEnvio(page, 'Informativo #42', '2026-03-10T09:30')

  await expect(page.getByRole('status')).toHaveText('Envio agendado')
  await expect(enviosAgendados(page)).toHaveCount(1)
  await expect(enviosAgendados(page)).toContainText('Informativo #42')
  await expect(enviosAgendados(page)).toContainText('10/03/2026 às 09:30')
  await expect(page.getByText('1 envio agendado')).toBeVisible()
})

test('recusa o agendamento com menos de 15 minutos de antecedência', async ({ page }) => {
  await agendarEnvio(page, 'Informativo #42', '2026-03-10T09:14')

  await expect(page.getByRole('alert')).toHaveText('O envio precisa de ao menos 15 minutos')
  await expect(enviosAgendados(page)).toHaveCount(0)
  await expect(page.getByText('Nenhum envio agendado.')).toBeVisible()
})

test('mantém o limite de 2 reagendamentos depois de recarregar a página', async ({ page }) => {
  await agendarEnvio(page, 'Informativo #42', '2026-03-10T09:30')
  const envio = enviosAgendados(page).filter({ hasText: 'Informativo #42' })
  await reagendar(envio, '2026-03-10T10:00')
  await expect(envio).toContainText('1 de 2 reagendamentos')
  await reagendar(envio, '2026-03-10T10:30')

  await page.reload()
  await expect(envio).toContainText('10/03/2026 às 10:30')
  await expect(envio).toContainText('2 de 2 reagendamentos')

  await reagendar(envio, '2026-03-10T11:00')
  await expect(page.getByRole('alert')).toHaveText('Limite de 2 reagendamentos atingido')
  await expect(envio).toContainText('10/03/2026 às 10:30')
})
