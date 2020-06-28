const request = require('request')
const {
  JSDOM
} = require('jsdom')

request('https://baseball.yahoo.co.jp/npb/', (e, response, body) => {
    if (e) {
      console.error(e)
    }

    try {
      const dom = new JSDOM(body)
        const q = (s)=>dom.window.document.querySelector(s)
        const qa= (s)=>dom.window.document.querySelectorAll(s)

        const games=qa('.bb-score__item')
        Array.from(games,  g => {
        const q = (s)=>g.querySelector(s)
          const team_l = q('div.bb-score__team > p.bb-score__homeLogo').textContent.trim()
          const team_r = q('div.bb-score__team > p.bb-score__awayLogo').textContent.trim()

            const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
            const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()

            const inning = q('.bb-score__link').textContent.trim()
            //        .textContent.trim()
            console.log(`${team_l} ${score_l}-${score_r} ${team_r} (${inning})`)
        })

    } catch (e) {
      console.error(e)
    }
})
