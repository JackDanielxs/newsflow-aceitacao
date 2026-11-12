// Servidor estático do NewsFlow: entrega os arquivos da pasta app/ em http://127.0.0.1:5173.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const PASTA = path.join(__dirname, 'app')
const HOST = '127.0.0.1'
const PORTA = Number(process.env.PORT) || 5173
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
}

http
  .createServer((req, res) => {
    let rota = decodeURIComponent(new URL(req.url, `http://${HOST}`).pathname)
    if (rota === '/') rota = '/index.html'
    const arquivo = path.join(PASTA, path.normalize(rota))
    if (!arquivo.startsWith(PASTA + path.sep)) {
      res.writeHead(404).end('Não encontrado')
      return
    }
    fs.readFile(arquivo, (erro, conteudo) => {
      if (erro) {
        res.writeHead(404).end('Não encontrado')
        return
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' })
      res.end(conteudo)
    })
  })
  .listen(PORTA, HOST, () => console.log(`NewsFlow em http://${HOST}:${PORTA}`))
