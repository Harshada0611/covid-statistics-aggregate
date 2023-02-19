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


//total active cases
app.get('/totalActive', async (req, resp) => {
    try {
        let data = await CovidCollection.aggregate([
            {
                $group: {
                    _id: "total",
                    Total_Infected: { $sum: "$infected" },
                    Toatl_Recovered: { $sum: "$recovered" }
                }
            },
            {
                $project: {
                    _id: "total",
                    total: { $subtract: ["$Total_Infected", "$Toatl_Recovered"] }
                }
            }
        ])
        console.log(data)
        resp.send({ data })
    }
    catch {
        return resp.json({
            status: 'fail',
            message: "error"
        })
    }
})


//total death
app.get('/totalDeath', async (req, resp) => {
    try {
        let data = await CovidCollection.aggregate([
            {
                $group: {
                    _id: "total",
                    total: {
                        $sum: "$death"
                    }
                }
            }
        ])
        //console.log(data[0].total)
        resp.send(data)
    }
    catch {
        return resp.json({
            status: "fail",
            message: "error"
        })
    }
})





app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;