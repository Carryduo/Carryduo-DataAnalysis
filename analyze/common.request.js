const axios = require("axios")

//라이엇 상태값 확인 매소드
exports.testRiotRequest = async () => {
    const targetTierUsersApiUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/DIAMOND/I?page=1&api_key=${process.env.KEY}`
    const response = await axios
        .get(targetTierUsersApiUrl)
        .then(() => {
            return true
        })
        .catch(async (err) => {
            if (err.response.status === 429) {
                console.log("getSummonerId 라이엇 요청 제한 경고!")
                console.log(err.response.statusText)
                console.log(`${num} 번째 페이지 요청 중에 오류`)
                await sleep(125)
                return false
            } else if (err.response.status === 403) {
                console.log("api키 갱신 필요!")
                return false
            } else {
                console.log(err.response.status, err.response.statusText)
                return false
            }
        })
    return response
}
