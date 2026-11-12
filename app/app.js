// NewsFlow · agendamento de envios (RN02 e RN03), com o estado guardado no localStorage.
const FUSO = 'America/Sao_Paulo'
const CHAVE = 'newsflow.agendamentos'
const MINUTO = 60 * 1000
const ANTECEDENCIA_MINIMA = 15 * MINUTO
const LIMITE_REAGENDAMENTOS = 2

const EDICOES = [
  { titulo: 'Informativo #42', situacao: 'aprovada' },
  { titulo: 'Aviso de manutenção', situacao: 'em revisão' }
]

const elementos = {
  agora: document.getElementById('agora'),
  edicoes: document.getElementById('edicoes'),
  edicao: document.getElementById('edicao'),
  horario: document.getElementById('horario'),
  form: document.getElementById('form-agendar'),
  status: document.getElementById('status'),
  erro: document.getElementById('erro'),
  resumo: document.getElementById('resumo'),
  agendados: document.getElementById('agendados')
}

// Horário de São Paulo

const leitor = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
})

function partesEmSaoPaulo(ms) {
  const partes = {}
  for (const { type, value } of leitor.formatToParts(ms)) partes[type] = Number(value)
  return partes
}

// "2026-03-10T09:30" digitado no campo vale como horário de São Paulo, seja qual for o fuso do navegador.
function instanteEmSaoPaulo(valor) {
  const [ano, mes, dia, hora, minuto] = valor.match(/\d+/g).map(Number)
  const comoUtc = Date.UTC(ano, mes - 1, dia, hora, minuto)
  const p = partesEmSaoPaulo(comoUtc)
  return comoUtc - (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - comoUtc)
}

function formatar(ms) {
  const p = partesEmSaoPaulo(ms)
  const dois = (n) => String(n).padStart(2, '0')
  return `${dois(p.day)}/${dois(p.month)}/${p.year} às ${dois(p.hour)}:${dois(p.minute)}`
}

// Estado

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || []
  } catch {
    return []
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(agendamentos))
  } catch {
    // Sem armazenamento disponível, o agendamento vale só até recarregar a página.
  }
}

let agendamentos = carregar()

// Regras

function agendar(titulo, valorHorario) {
  const edicao = EDICOES.find((e) => e.titulo === titulo)
  if (!valorHorario) return { erro: 'Informe a data e a hora do envio' }
  if (edicao.situacao !== 'aprovada') return { erro: 'A edição precisa de aprovação' }
  const horario = instanteEmSaoPaulo(valorHorario)
  if (horario - Date.now() < ANTECEDENCIA_MINIMA) return { erro: 'O envio precisa de ao menos 15 minutos' }
  if (agendamentos.some((a) => a.titulo === titulo)) return { erro: 'Esta edição já tem envio agendado' }
  agendamentos.push({ titulo, horario, reagendamentos: 0 })
  salvar()
  return { mensagem: 'Envio agendado' }
}

function reagendar(titulo, valorHorario) {
  const agendamento = agendamentos.find((a) => a.titulo === titulo)
  if (agendamento.reagendamentos >= LIMITE_REAGENDAMENTOS) {
    return { erro: 'Limite de 2 reagendamentos atingido' }
  }
  if (!valorHorario) return { erro: 'Informe o novo horário' }
  const horario = instanteEmSaoPaulo(valorHorario)
  if (horario - Date.now() < ANTECEDENCIA_MINIMA) return { erro: 'O envio precisa de ao menos 15 minutos' }
  agendamento.horario = horario
  agendamento.reagendamentos += 1
  salvar()
  return { mensagem: 'Envio reagendado' }
}

// Tela

function avisar(resultado) {
  elementos.status.textContent = resultado.mensagem || ''
  elementos.erro.textContent = resultado.erro || ''
}

function renderizar() {
  elementos.agora.textContent = `agora em São Paulo: ${formatar(Date.now())}`

  elementos.edicoes.replaceChildren(
    ...EDICOES.map((e) => {
      const item = document.createElement('li')
      item.innerHTML = '<strong></strong> <span class="situacao"></span>'
      item.querySelector('strong').textContent = e.titulo
      item.querySelector('.situacao').textContent = `— ${e.situacao}`
      return item
    })
  )

  const total = agendamentos.length
  elementos.resumo.textContent =
    total === 0 ? 'Nenhum envio agendado.' : `${total} ${total === 1 ? 'envio agendado' : 'envios agendados'}`

  elementos.agendados.replaceChildren(
    ...agendamentos.map((a) => {
      const item = document.createElement('li')
      item.innerHTML = `
        <strong></strong>
        <span class="detalhes"></span>
        <form novalidate>
          <label>Novo horário <input type="datetime-local"></label>
          <button type="submit">Reagendar</button>
        </form>`
      item.querySelector('strong').textContent = a.titulo
      item.querySelector('.detalhes').textContent =
        `${formatar(a.horario)} · ${a.reagendamentos} de ${LIMITE_REAGENDAMENTOS} reagendamentos`
      item.querySelector('form').addEventListener('submit', (evento) => {
        evento.preventDefault()
        avisar(reagendar(a.titulo, item.querySelector('input').value))
        renderizar()
      })
      return item
    })
  )
}

function iniciar() {
  elementos.edicao.replaceChildren(
    ...EDICOES.map((e) => new Option(e.titulo, e.titulo))
  )
  elementos.form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    avisar(agendar(elementos.edicao.value, elementos.horario.value))
    renderizar()
  })
  renderizar()
}

iniciar()
