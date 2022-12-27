require("dotenv").config()
const db = require("./orm")
const ServiceDB = require("./service.orm")

const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler")

const { task } = require("./task")

const scheduler = new ToadScheduler()

//데이터베이스 연결
db.connect()
ServiceDB.connectService()
// // 데이터 분석
const job = new SimpleIntervalJob({ minutes: 90, runImmediately: true }, task)
scheduler.addSimpleIntervalJob(job)
