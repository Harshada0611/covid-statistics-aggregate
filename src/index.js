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


//hotspot states
app.get('/hotspotStates', async (req, resp) => {
    try {
        let data = await CovidCollection.aggregate([
            {
                $addFields: {
                    rate: {
                        $round: [{ $subtract: [1, { $divide: ["$recovered", "$infected"] }] }, 5]
                    }
                }
            },
            {
                $match: { rate: { $gt: 0.1 } }
            },
            {
                $project: {
                    _id: 0,
                    state: "$state",
                    rate: "$rate"
                }
            }
        ])
        if (data.length === 0) {
            resp.send("No state found having rate greater than 0.1")
        }
        else {
            resp.send(data)
        }
    }
    
    catch {
        return resp.json({
            status: "fail",
            message: "error"
        })
    }
})


//healthy states
app.get('/healthyStates', async (req, resp) => {
    try {
        let data = await CovidCollection.aggregate([
            {
                $addFields: {
                    mortality: { $round: [{ $divide: ["$death", "$infected"] }, 5] }
                }
            },
            {
                $match: { mortality: { $lt:0.005 } }
            },
            {
                $project: {
                    _id: 0,
                    state: "$state",
                    mortality: "$mortality"
                }
            }
        ])

        if (data.length === 0) {
            resp.send("No state found having mortality rate less than 0.005")
        }
        else {
            resp.send(data)
        }
    }

    catch {
        resp.json({
            status: "fail",
            message: "error"
        })
    }
})




app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;