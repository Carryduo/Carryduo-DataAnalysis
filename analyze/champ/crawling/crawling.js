const axios = require("axios")
const cheerio = require("cheerio")

exports.dataParsing = async () => {
    const html = await axios.get("https://developer.riotgames.com/docs/lol#data-dragon_champions")

    const $ = cheerio.load(html.data)

    let champDataUrl = $(
        "body > div.container > div.layout > div.content-container > div.content > p:nth-child(93) > a:nth-child(1)"
    ).attr("href")

    let champDetailDataUrl = $(
        "body > div.container > div.layout > div.content-container > div.content > p:nth-child(93) > a:nth-child(3)"
    ).attr("href")

    const champImg = $(
        "body > div.container > div.layout > div.content-container > div.content > p:nth-child(114) > a"
    ).attr("href")

    const skillImg = $(
        "body > div.container > div.layout > div.content-container > div.content > p:nth-child(120) > a"
    ).attr("href")

    const passiveImg = $(
        "body > div.container > div.layout > div.content-container > div.content > p:nth-child(108) > a"
    ).attr("href")

    champDataUrl = champDataUrl.replace("en_US", "ko_KR")
    champDetailDataUrl = champDetailDataUrl.replace("en_US", "ko_KR")

    return { champDataUrl, champDetailDataUrl, champImg, skillImg, passiveImg }
}
