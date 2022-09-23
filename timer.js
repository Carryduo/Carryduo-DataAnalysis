exports.sleep = async (sec) => {
    console.log("타이머 실행")
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000)
    })
}
