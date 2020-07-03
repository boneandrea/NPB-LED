// 2020シーズン版　ヤフーニュースをうちの電光掲示板にPOST
//  node_modules/.bin/prettier --write index.js --print-width=120
'use strict'

const request = require('request')
const { JSDOM } = require('jsdom')
require('dotenv').config()

const YAHOO_URL = process.env.yahoo_url

request(YAHOO_URL, (e, response, body) => {
    if (e) {
        console.error(e)
    }

    try {
        const dom = new JSDOM(body)
        const q = (s) => dom.window.document.querySelector(s)
        const qa = (s) => dom.window.document.querySelectorAll(s)

        const gamesInfo = []
        const games = qa('.bb-score__item')

        Array.from(games, (g) => {
            const q = (s) => g.querySelector(s)
            const team_l = q('div.bb-score__team > p.bb-score__homeLogo').textContent.trim()
            const team_r = q('div.bb-score__team > p.bb-score__awayLogo').textContent.trim()

            if (q('.bb-score__score.bb-score__score--left')) {
                // 試合中
                const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
                const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()
                const inning = q('.bb-score__link').textContent.trim()
                gamesInfo.push(`${team_l} ${score_l}-${score_r} ${team_r} (${inning})`)
            } else if (q('.bb-score__link')) {
                // 中止とか
                const result = q('.bb-score__link').textContent.trim().replace(/見どころ/,"開始前")
                gamesInfo.push(`${team_l}-${team_r} (${result})`)
            }
        })
        console.log(gamesInfo)
        ledPost(gamesInfo.join('　'))
    } catch (e) {
        console.error(e)
        postErrorToSlack(`[NPB] send failed;${e.message}`);
    }
})

const ledPost = (s) => {
    const spacer = '　　　　　　　　'
    const data = {
        str: spacer + '【むくむくニュース】' + s,
    }

    const URL = process.env.led_url

    const request = require('request')
    const options = {
        uri: URL,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
        },
        form: data,
    }
    request.post(options, function (error, response, body) {
        body=JSON.parse(body)
        if(!body.result){
            console.log(error);
            console.log(response);
        }
    })
}

const postErrorToSlack=(s)=>{
    const request = require('request')
    const options = {
        uri: process.env.slack_hook,
        headers: {
            'Content-type': 'application/json',
        },
        json:{
            text: s
        }
    }
    request.post(options, function (error, response, body) {})
};
