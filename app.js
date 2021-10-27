const express = require('express')
const app = express()

const {verifyContentType, parseDataByType} = require('./util')

 
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/create-partition', (req, res) => {
  res.sendStatus(200)
})

app.post('/post-data', async (req, res) => {
  const contentType = req.headers['content-type']
  const partition = req.headers['partition']
  const host = req.hostname
  
  const buffer = []
  for await (const chunk of req) {
    buffer.push(chunk)
  }

  const data = Buffer.concat(buffer).toString()

  //console.log('datatype:', contentType, ', \npartition:', partition, ', \nhost:', host, ', \ndata:', data)

  /*
  When csv or tsv files are sent they are multipart form data.
  We use this function to get the proper format type
  (json, xml, tsv or csv)
  */
  type = verifyContentType(contentType, data)
  if(type === "fail"){
    res.sendStatus(422)
  }
  else{
  /*

  */
  parsedData = parseDataByType(type, data)
  console.log(parsedData)

  

  res.sendStatus(200)
  }
})
 
app.listen(3000)