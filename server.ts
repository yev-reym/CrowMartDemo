const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

const PORT = 8080
const HOST = 'localhost'
const dirBase = 'crowmart'

const server = http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`)

  const parsedUrl = url.parse(req.url)

  let pathname = parsedUrl.pathname
  const ext = path.parse(`.${parsedUrl.pathname}`).ext

  /**Map of extensions to MIME types */
  const extMap = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  }

  const fullPath = dirBase + pathname
  console.log('fullpath', fullPath)
  /**Check for existence of file path */
  fs.access(path.join(__dirname, fullPath), fs.constants.R_OK, (err) => {
    if (err) {
      console.log('File not found!', err)
      res.statusCode = 404
      res.end(`File ${pathname} not found!`)
      return
    }
  })

  //** Read from file system and send back content */
  fs.readFile(path.join(__dirname, fullPath), function (err, data) {
    console.log('err', data, err)
    if (err) {
      res.statusCode = 500
      res.end(`Error getting the file: ${err}.`)
    } else {
      res.writeHead(200, { 'Content-Type': extMap[ext] || 'text/plain' })
      res.write(data)
      res.end()
    }
  })
})

server.listen(PORT, HOST, null, () => {
  console.log(`Launching CrowMart listening at port: ${PORT}`)
})
