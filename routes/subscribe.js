const router = require('express').Router()

const {
    checkIfPartitionExists,
    subscribeUser,
} = require('../util')

router.post('/subscribe', (req, res) => {
    const partition = req.headers['partition']
    const host = req.hostname
    const phone = req.headers['phone-number']

    if(phone.length != 8 || phone === undefined){
        res.status(400).send("Phone number missing from header or Phone number is not a 8 digit danish number")
    }
    else if(partition === undefined) {
        res.status(400).send("Partition missing from header")
    }
    else if (!checkIfPartitionExists(partition)) {
        res.status(400).send("Partition does not exist")
    }
    else {

        /*
        subscribeUser() returns 0, 1 or 2
        0 = Error writing to file
        1 = User already subscribed
        2 = User subscribed succesfully
        */
        const result = subscribeUser(host, partition, phone)
        if (result === 2) {
            res.sendStatus(200)
        }
        else if (result === 1) {
            res.status(400).send("User already subscribed")
        }
        else {
            res.sendStatus(500)
        }
    }
})

module.exports = router;