const router = require('express').Router()

const {
    checkIfPartitionExists,
    checkIfSubscribed,
    checkForMessage,
    parseDataByJson
} = require('../util')

router.get('/fetch', (req, res) => {
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

module.exports = router;