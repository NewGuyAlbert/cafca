const express = require('express')
const app = express()

const {
    verifyContentType,
    parseJSONByType,
    createPartition,
    checkIfPartitionExists,
    createMessage,
    subscribeUser,
    checkIfSubscribed,
    checkForMessage,
    parseDataByJson
} = require('./util')


app.get('/', function (req, res) {
    //TODO info with all the other routes
    res.send('Hello World')
})

app.post('/subscribe', (req, res) => {
    const partition = req.headers['partition']
    const host = req.hostname

    if (partition === undefined) {
        res.send("400 Partition missing from header")
    }
    else if (!checkIfPartitionExists(partition)) {
        res.send("400 Partition does not exist")
    }
    else {

        /*
        subscribeUser() returns 0, 1 or 2
        0 = Error writing to file
        1 = User already subscribed
        2 = User subscribed succesfully
        */
        const result = subscribeUser(host, partition)
        if (result === 2) {
            res.sendStatus(200)
        }
        else if (result === 1) {
            res.send("User already subscribed")
        }
        else {
            res.sendStatus(500)
        }
    }
})

app.get('/fetch', (req, res) => {
    const partition = req.headers['partition']
    const messageNo = req.headers['index']
    const desiredDataType = req.headers['return-data']
    const host = req.hostname

    const possibleDataType = ["xml", "json", "csv", "tsv"]
    const exists = possibleDataType.find(a => a.includes(desiredDataType))

    if(exists === undefined){
        res.send("Return-Data type must be exactly the following in the header: 'json', 'xml', 'csv', 'tsv'")
    }
    else if (partition === undefined) {
        res.send("400 Partition missing from header")
    }
    else if (!checkIfPartitionExists(partition)) {
        res.send("400 Partition does not exist")
    }
    else {
        let result = checkIfSubscribed(host, partition)
        if (result === false) {
            res.send("User is not subscribed to this topic")
        }
        else {
            /*
            
            */
            result = checkForMessage(partition, messageNo)

            if(result === false){
                res.send("Message out of bounds for that topic")
            }
            else{
                processedData = parseDataByJson(desiredDataType, result)
                res.send(processedData)

                //res.sendStatus(200)
            }

        }
    }
})

app.post('/create-partition', (req, res) => {

    const partition = req.headers['partition']
    if (partition === undefined) {
        res.send("400 Partition missing from header")
    }
    else {

        //True if partition was created successfully, false otherwise
        result = createPartition(partition)

        if (!result) {
            res.send("400 Partition already exists")
        }
        else {
            res.sendStatus(200)
        }
    }
})

app.post('/post-data', async (req, res) => {
    const contentType = req.headers['content-type']
    const partition = req.headers['partition']
    const host = req.hostname

    if (!checkIfPartitionExists(partition)) {
        res.send("400 Partition does not exist")
    }
    else {
        /*
        Grab de data from the request
        */
        const buffer = []
        for await (const chunk of req) {
            buffer.push(chunk)
        }
        const data = Buffer.concat(buffer).toString()
        /*
        When csv or tsv files are sent they are multipart form data.
        We use this function to get the proper format type
        (json, xml, tsv or csv)
        */
        const type = verifyContentType(contentType, data)
        if (type === "fail") {
            res.sendStatus(422)
        }
        else {
            /*
              We parse data into a Json object.
            */
            parseJSONByType(type, data).then(async (resultData) => {
                const parsedData = { "data": resultData }
                /*
                  We create json file in the repository
                  result = true / if successful
      
                */
                await createMessage(partition, parsedData)

                //TODO Alert subscribers 
                res.sendStatus(200)

            }).catch(e => {
                console.log('error while parsing data', e)
                res.sendStatus(500)
            })


        }
    }
})

app.listen(3000)