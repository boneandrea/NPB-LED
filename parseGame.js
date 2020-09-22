const request = require('request')
const { JSDOM } = require('jsdom')

module.exports = {
    parse: async function (g, params) {
        const q = (s) => g.querySelector(s)
        const team_l = q('div.bb-score__team > p.bb-score__homeLogo').textContent.trim()
        const team_r = q('div.bb-score__team > p.bb-score__awayLogo').textContent.trim()

        if (q('.bb-score__score.bb-score__score--left')) {
            if (q('.bb-score__link').textContent.trim() === '試合終了') {
                const win_pitcher = q('.bb-score__player.bb-score__player--win').textContent
                const lose_pitcher = q('.bb-score__player.bb-score__player--lose').textContent

                const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
                const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()
                const inning = q('.bb-score__link').textContent.trim()
                return `${team_l} 対 ${team_r} : ${score_l}-${score_r} (${inning}) [勝:${win_pitcher} 負:${lose_pitcher}]`
            } else {
                // 試合中
                const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
                const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()
                const inning = q('.bb-score__link').textContent.trim()

                const gameLiveUrl = q('.bb-score__content').getAttribute('href')
                const self = this
                const p_info = await self.getLiveInfo(gameLiveUrl).catch((e)=>{
                    throw new Error(e.message)
                })

                return `${team_l} 対 ${team_r} : [${p_info.home}]${score_l}-${score_r}[${p_info.away}] (${inning})`
            }
        } else if (q('.bb-score__link')) {
            // 中止とか
            const result = q('.bb-score__link').textContent.trim().replace(/見どころ/, '開始前')
            params.notOnPlayGames++
            return `${team_l}-${team_r} (${result})`
        } else {
            throw new Error("想定外")
        }
    },

    getLiveInfo: async function (url) {
        return new Promise((resolve, reject) => {
            console.log(url)
            let p_h = ''
            let p_a = ''
            request(url, (e, response, body) => {
                if (e) {
                    console.error(e)
                }

                try {
                    const dom = new JSDOM(body)
                    const q = (s) => dom.window.document.querySelector(s)
                    const qa = (s) => dom.window.document.querySelectorAll(s)

                    const battery_home = q(
                        '#gm_memh > table:nth-child(4) > tbody:nth-child(1) > tr.bb-splitsTable__row > td'
                    )
                        .textContent.replace(/\r?\n/g, '')
                        .replace(/ /g, '')
                        .replace(/、/g, ',')
                    const battery_away = q(
                        '#gm_mema > table:nth-child(4) > tbody:nth-child(1) > tr.bb-splitsTable__row > td'
                    )
                        .textContent.replace(/\r?\n/g, '')
                        .replace(/ /g, '')
                        .replace(/、/g, ',')

                    if (battery_home.match(/,([^,]*)\-/)) {
                        p_h = RegExp.$1
                    }
                    if (battery_away.match(/,([^,]*)\-/)) {
                        p_a = RegExp.$1
                    }
                } catch (e) {
                    reject(e)
                }
                resolve({ home: p_h, away: p_a })
            })
        })
    },
}
