require("dotenv").config()

const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler")

const { task, matchIdTask } = require("./schedule")

const scheduler = new ToadScheduler()

// // 데이터 분석
const job = new SimpleIntervalJob({ hours: 1, runImmediately: true }, task)
scheduler.addSimpleIntervalJob(job)

// 매치Id 수집
// const matchIdJob = new SimpleIntervalJob({ hours: 12, runImmediately: true }, matchIdTask) // runImmediately: 즉시실행
// scheduler.addSimpleIntervalJob(matchIdJob)
