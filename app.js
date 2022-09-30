require("dotenv").config()

const express = require("express")
const app = express()
const Router = require("./routes")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/", Router)
const db = require('./orm')
// db.connect()
db.connectService()

module.exports = app


