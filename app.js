require("dotenv").config();
const db = require("./orm");

const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler");

const { task } = require("./task/task");

const scheduler = new ToadScheduler();

//데이터베이스 연결
db.connect();
db.connectService();
// 데이터 분석
const job = new SimpleIntervalJob({ hours: 1, runImmediately: true }, task);
scheduler.addSimpleIntervalJob(job);
