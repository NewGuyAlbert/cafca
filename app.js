const express = require('express')
const app = express()
const path = require('path')

/* Add routes */
const subscribeRoute = require('./routes/subscribe.js')
const createRoute = require('./routes/create.js')
const pushRouter = require('./routes/push.js')
const fetchRouter = require('./routes/fetch.js')

app.use(subscribeRoute)
app.use(createRoute)
app.use(pushRouter)
app.use(fetchRouter)


app.get('/', function (req, res) {

    const options = {
        root: path.join(__dirname)
    };
     
    const fileName = 'README.md';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
})


app.listen(3000)