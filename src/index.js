const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const CovidCollection = require('./connector')

app.get('/', (req, resp) => {
    CovidCollection.find()
        .then(data => {
            console.log(data)
            resp.send(data)
        })
        .catch(err => { console.log(err) })
})



app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;