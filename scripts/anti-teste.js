// Remove cada regra do app de propósito, roda o teste que a protege e confere que ele fica vermelho.
// O app é restaurado depois de cada quebra, mesmo se a execução for interrompida por erro.
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const APP = path.join(__dirname, '..', 'app', 'app.js')

const QUEBRAS = [
  {
    regra: 'O agendamento entra na lista',
    teste: 'agenda o envio de uma edição aprovada',
    de: "  agendamentos.push({ titulo, horario, reagendamentos: 0 })\n",
    para: ''
  },
  {
    regra: 'Antecedência mínima de 15 minutos',
    teste: 'recusa o agendamento com menos de 15 minutos',
    de: "  if (horario - Date.now() < ANTECEDENCIA_MINIMA) return { erro: 'O envio precisa de ao menos 15 minutos' }\n  if (agendamentos.some",
    para: '  if (agendamentos.some'
  },
  {
    regra: 'O estado sobrevive ao recarregar',
    teste: 'mantém o limite de 2 reagendamentos',
    de: '    localStorage.setItem(CHAVE, JSON.stringify(agendamentos))\n',
    para: ''
  },
  {
    regra: 'Limite de 2 reagendamentos',
    teste: 'mantém o limite de 2 reagendamentos',
    de: 'agendamento.reagendamentos >= LIMITE_REAGENDAMENTOS',
    para: 'false'
  }
]

const original = fs.readFileSync(APP, 'utf8')
const resultados = []

try {
  for (const quebra of QUEBRAS) {
    if (!original.includes(quebra.de)) throw new Error(`Trecho não encontrado para "${quebra.regra}"`)
    fs.writeFileSync(APP, original.replace(quebra.de, quebra.para))
    // --reporter=line evita sobrescrever o relatório HTML com os testes vermelhos.
    const execucao = spawnSync('npx', ['playwright', 'test', '-g', quebra.teste, '--reporter=line'], {
      encoding: 'utf8',
      shell: process.platform === 'win32'
    })
    fs.writeFileSync(APP, original)
    const falhou = execucao.status !== 0
    resultados.push({ ...quebra, falhou })
    console.log(`${falhou ? 'VERMELHO' : 'VERDE   '}  ${quebra.regra}  →  "${quebra.teste}"`)
  }
} finally {
  fs.writeFileSync(APP, original)
}

const sobreviventes = resultados.filter((r) => !r.falhou)
console.log(
  sobreviventes.length === 0
    ? `\nAs ${resultados.length} quebras deixaram o teste correspondente vermelho. App restaurado.`
    : `\n${sobreviventes.length} quebra(s) passaram despercebidas. App restaurado.`
)
process.exit(sobreviventes.length === 0 ? 0 : 1)
