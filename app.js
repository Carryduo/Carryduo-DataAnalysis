require("dotenv").config()
const express = require("express")
const app = express()
const Router = require("./routes")
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/", Router)

const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler")

const { task, matchIdTask } = require('./schedule')

const scheduler = new ToadScheduler()

// // 데이터 분석
// const job = new SimpleIntervalJob({ hours: 2, runImmediately: true }, task)
// // scheduler.addSimpleIntervalJob(job)

// 매치Id 수집 
const matchIdJob = new SimpleIntervalJob({ hours: 12, runImmediately: true }, matchIdTask) // runImmediately: 즉시실행 
scheduler.addSimpleIntervalJob(matchIdJob)

module.exports = app
