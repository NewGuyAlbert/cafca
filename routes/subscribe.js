const router = require('express').Router()

const {
    checkIfPartitionExists,
    subscribeUser,
} = require('../util')

router.post('/subscribe', (req, res) => {
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

module.exports = router;