const axios = require("axios")
const { saveChampId } = require("./champIdService")

exports.getChampId = async (req, res, next) => {
    try {
        let champName = []

        const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion.json`)
        const champData = response.data.data

        champName.push(...Object.keys(champData))

        for (let i of champName) {
            await saveChampId(response.data.data[i].key)
        }

        res.status(200).json({ result: "SUCCESS" })
    } catch (err) {
        console.log(err)
        res.status(400).json({ result: "fail" })
    }
}
