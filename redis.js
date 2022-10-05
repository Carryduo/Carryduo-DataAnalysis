const express = require("express")
const dotenv = require("dotenv")
const redis = require("redis")

dotenv.config() // env환경변수 파일 가져오기

const redisClient = redis.createClient({ legacyMode: true }) // legacy 모드 반드시 설정 !!
redisClient.on("connect", () => {
    console.info("Redis connected!")
})
redisClient.on("error", (err) => {
    console.error("Redis Client Error", err)
})

module.exports = redisClient
