const express = require('express')
const mongoose = require('mongoose')
const app = express()
const router = require('./routes/end.js')
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/", router)
app.use("/login", router)
app.use("/usersecrets", router)
app.use("/start", router)

mongoose
    .connect(
        "mongodb+srv://likhith2003:harekrsna@aiyogi.fd0ejdt.mongodb.net/?retryWrites=true&w=majority"
)
    .then(()=>
    app.listen(5000, () => console.log("db connected on 5000"))
)
    .catch((err) => console.log(err))



