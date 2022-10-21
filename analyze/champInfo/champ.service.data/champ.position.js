const { getChampList, positionInfo, ServicePosition } = require("../champInfo.service");

//챔프 포지션 연산 후 서비스 DB로 저장
exports.serviceSavePosition = async () => {
  try {
    const champList = await getChampList();

    for (let c of champList) {
      const champId = c.champ_champId;

      const champPosition = await positionInfo(champId);

      // 해당 챔피언의 모든 포지션 카운트를 더해 총 카운트를 찾는다.
      const totalRate =
        champPosition[0].top +
        champPosition[0].jungle +
        champPosition[0].mid +
        champPosition[0].ad +
        champPosition[0].support;

      //챔피언 포지션 비율 연산
      let topRate = (champPosition[0].top / totalRate) * 100;
      topRate = topRate.toFixed(2);

      let jungleRate = (champPosition[0].jungle / totalRate) * 100;
      jungleRate = jungleRate.toFixed(2);

      let midRate = (champPosition[0].mid / totalRate) * 100;
      midRate = midRate.toFixed(2);

      let adRate = (champPosition[0].ad / totalRate) * 100;
      adRate = adRate.toFixed(2);

      let supportRate = (champPosition[0].support / totalRate) * 100;
      supportRate = supportRate.toFixed(2);

      await ServicePosition(champId, topRate, jungleRate, midRate, adRate, supportRate);
    }
    return "포지션 데이터 서비스DB 업데이트 완료";
  } catch (err) {
    console.log(err);

    return err;
  }
};
