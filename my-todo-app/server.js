const express = require('express')
const next = require('next')
const https = require('https');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = 3000
const options = {
 key: fs.readFileSync('kluczBez.key'),
 cert: fs.readFileSync('certyfikat.crt'),
};

app.prepare().then(() => {
  const server = express()  
  server.use((req, res) => handle(req, res))

  https.createServer(options, server).listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
  });
}) 
