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




//total recovered 
app.get('/totalRecovered', async (req, resp) => {
    try {
        const total = await CovidCollection.aggregate([
            {
                $group: {
                    _id: "total",
                    recovered: {
                        $sum: "$recovered"
                    }

                }
            }])
        // console.log(total)
        // resp.json(total)
        resp.json({ total })
    }
    catch {
        return resp.status(200).json({
            status: 'fail',
            message: "error"
        })
    }
})





app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;