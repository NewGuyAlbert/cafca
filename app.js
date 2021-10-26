const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/create-partition', (req, res) => {
  res.send(200)
})

app.post('/post-data', async (req, res) => {
  const dataType = req.headers['content-type']
  const host = req.hostname
  
  console.log('datatype:', dataType, ', \nhost:', host)
  
  const buffer = []
  for await (const chunk of req) {
    buffer.push(chunk)
  }
  
  const data = Buffer.concat(buffer).toString()

  console.log(data)

  res.send(200)

})
 
app.listen(3000)