const { sleep } = require("./timer");
const { performance } = require("perf_hooks");
const summonerController = require("./analyze/summonerId/summonerId.controller");
const puuidController = require("./analyze/puuId/puuId.controller");
const matchDataController = require("./analyze/match_data/match.data.controller");
const matchIdController = require("./analyze/matchId/matchId.controller");
const {
  startChampInfo,
  serviceSaveRate,
  serviceSavePosition,
  serviceSaveChampSpell,
} = require("./analyze/rate/rate.controller");
const { AsyncTask } = require("toad-scheduler");
const fs = require("fs");
const db = require("./orm");

const task = new AsyncTask(
  "task",
  async () => {
    const response = await summonerController.testRiotRequest();
    //데이터 분석 로직 수행
    if (response) {
      return await startAnalyze();
    } else {
      const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
      const time = new Date().toTimeString().split(" ")[0];
      const data = "\nerror: " + "API 키 만료" + " ||" + " Date: " + date + " Time: " + time;
      return fs.writeFile(
        process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
        data,
        { flag: "a+" },
        (error) => {
          console.log(error);
        }
      );
    }
  },
  (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
    const time = new Date().toTimeString().split(" ")[0];
    const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

    fs.writeFile(
      process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
      data,
      { flag: "a+" },
      (error) => {
        console.log(err);
      }
    );
  }
);

async function test() {
  console.log("connect test");
}

async function startAnalyze() {
  try {
    const start = performance.now();

    //데이터베이스 연결
    await db.connect();
    await db.connectService();

    //데이터 분석 및 분석용 데이터베이스에 저장
    await startChampInfo();
    await sleep(10);

    // 데이터 분석 후 서비스DB에 업데이트
    await serviceSaveRate();
    await sleep(10);

    await serviceSavePosition();
    await sleep(10);

    await serviceSaveChampSpell();
    await sleep(10);

    console.log("======챔피언조합승률 분석 시작========");

    await matchDataController.saveCombination();
    await sleep(10);
    await matchDataController.uploadCombinationWinRate();
    await sleep(10);
    await matchDataController.updateCombinationTierAndRank();
    await sleep(10);
    await matchDataController.transferCombinationStatToServiceDB();

    //함수 실행 시간 체크
    const end = performance.now();
    const runningTime = end - start;
    const ConversionRunningTime = (runningTime / (1000 * 60)) % 60;
    console.log(`===${ConversionRunningTime} 분소요===`);
  } catch (err) {
    //에러 로그 파일
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
    const time = new Date().toTimeString().split(" ")[0];
    const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

    fs.writeFile(
      process.env.LOG || `./logs/champ.analyze.error.txt`,
      data,
      { flag: "a+" },
      (error) => {
        console.log(err);
      }
    );
  } finally {
    //데이터베이스 연결 해제
    await db.close();
    await db.closeService();
  }
}

// const matchIdTask = new AsyncTask(
//     "task",
//     async () => {
//       //데이터베이스 연결
//       await db.connect();
//       await db.connectService();

//       //데이터 분석 로직 수행
//       // TODO: api키가 정상이면 실행, 아니면 실행 취소
//       // return console.log('API 키 만료')
//       const response = await summonerController.testRiotRequest();
//       console.log(response);
//       if (response) {
//         return await startGetMatchIds();
//       } else {
//         const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
//         const time = new Date().toTimeString().split(" ")[0];
//         const data = "\nerror: " + "API 키 만료" + " ||" + " Date: " + date + " Time: " + time;
//         return fs.writeFile(
//           process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
//           data,
//           { flag: "a+" },
//           (err) => {
//             console.log(err);
//           }
//         );
//       }
//     },
//     (err) => {
//       const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
//       const time = new Date().toTimeString().split(" ")[0];
//       const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

//       fs.writeFile(
//         process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
//         data,
//         { flag: "a+" },
//         (error) => {
//           console.log(err);
//         }
//       );
//     }
//   );

// async function startGetMatchIds() {
//   try {
//     const start = performance.now();
//     // 로우데이터 수집
//     await sleep(10);
//     await summonerController.summonerId();
//     await sleep(10); // setTimmer를 이용해서 db가 온전히 연결된 이후에 데이터 분석 시작
//     await puuidController.puuId();
//     await sleep(10);
//     await matchIdController.matchId();
//     await sleep(10);

//     const end = performance.now();
//     const runningTime = end - start;
//     const ConversionRunningTime = (runningTime / (1000 * 60)) % 60;
//     console.log(`===${ConversionRunningTime} 분소요===`);
//   } catch (err) {
//     const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
//     const time = new Date().toTimeString().split(" ")[0];
//     const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

//     fs.writeFile(
//       process.env.LOG || `./logs/champ.analyze.error.txt`,
//       data,
//       { flag: "a+" },
//       (error) => {
//         console.log(err);
//       }
//     );
//   } finally {
//     //데이터베이스 연결 해제
//     await db.close();
//     await db.closeService();
//   }
// }

module.exports = { task, matchIdTask };
