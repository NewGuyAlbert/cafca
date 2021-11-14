const router = require('express').Router()

const {
    createPartition,
} = require('../util')

router.post('/create', (req, res) => {

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

module.exports = router;