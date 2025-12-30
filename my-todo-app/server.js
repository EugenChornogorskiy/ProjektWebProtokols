const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3000

app.prepare().then(() => {
  const server = express()  
  server.use((req, res) => handle(req, res))

  server.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
  }) 
}) 
