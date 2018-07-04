'use strict'
const express = require('express')
const fs = require('fs')
const calculator = require('./calculator')
const app = express()
const atob = require('atob')

function calculus(req, res) {
  console.log(req.query.query)
  if (req.query.query) {
    const decodedQuery = atob(req.query.query)
    calculator.calculate(decodedQuery).then(result => {
      const responseToSend = {"result": result }
      res.send(JSON.stringify(responseToSend))
    }).catch(err => {
      console.log('something went wrong', err)
      const errorToSend = {"error": err}
      res.status(500).send(JSON.stringify(errorToSend))
    })
  }
  else {
    const errorToSend = {"error": "no base64 encoded query specified"}
    res.status(500).send(JSON.stringify(errorToSend))
  }

}
if (process.env.NODE_ENV == "debug") {
  app.get('/', function (req, res) {
    var html = fs.readFileSync('web/index.html')
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(html)
  })

  app.get('/calculus', function (req, res) {
    return calculus(req, res)
  })

  const port = 3000
  app.listen(port)
  console.log('Listening at port ' + port)
}
exports.calculus = calculus