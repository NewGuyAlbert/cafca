const router = require('express').Router()

const {
    createPartition,
} = require('../util')

router.post('/create', (req, res) => {

    const partition = req.headers['partition']
    if (partition === undefined) {
        res.status(400).send("Partition missing from header")
    }
    else {

        //True if partition was created successfully, false otherwise
        result = createPartition(partition)

        if (!result) {
            res.status(400).send("Partition already exists")
        }
        else {
            res.sendStatus(201)
        }
    }
})

module.exports = router;