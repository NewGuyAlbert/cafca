const router = require('express').Router()

const {
    verifyContentType,
    parseJSONByType,
    checkIfPartitionExists,
    createMessage,
} = require('../util')

router.post('/push', async (req, res) => {
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

module.exports = router;