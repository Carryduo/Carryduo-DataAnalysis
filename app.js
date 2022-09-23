require("dotenv").config()

const express = require("express")

const app = express()

const Router = require("./routes")

const connect = require("./schemas")
connect()

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use("/", Router)

module.exports = app
