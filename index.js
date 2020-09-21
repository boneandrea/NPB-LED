// 2020シーズン版　ヤフーニュースをうちの電光掲示板にPOST
//  node_modules/.bin/prettier --write index.js --print-width=120
'use strict'

const request = require('request')
const { JSDOM } = require('jsdom')
const parseGame = require('./parseGame')
require('dotenv').config()

const YAHOO_URL = process.env.yahoo_url
const GAMES_FILE = './games.json'

request(YAHOO_URL, (e, response, body) => {
    if (e) {
        console.error(e)
    }

    try {
        const dom = new JSDOM(body)
        const q = (s) => dom.window.document.querySelector(s)
        const qa = (s) => dom.window.document.querySelectorAll(s)

        const date = q('.bb-head02__title').textContent
        const gamesInfo = []
        const games = qa('.bb-score__item')

        const params = {
            notOnPlayGames: 0,
        }

        Array.from(games, async (g) => {
            const game = await parseGame.parse(g, params)
            gamesInfo.push(game)
        })

        const data = {
            date,
            games: gamesInfo,
        }

        const lastData = getLastData()
        const fs = require('fs')
        fs.writeFileSync(GAMES_FILE, JSON.stringify(data))

        const json = JSON.stringify(data)

        if (json !== lastData) {
            if (games.length !== params.notOnPlayGames) {
                ledPost(data.games.join('　'))
            }
        }
    } catch (e) {
        console.error(e)
        postErrorToSlack(`[NPB] send failed;${e.message}`)
    }
})

const getLastData = () => {
    const fs = require('fs')
    try {
        return fs.readFileSync(GAMES_FILE, 'utf-8')
    } catch (e) {
        console.error(e)
        return ''
    }
}

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
        body = JSON.parse(body)
        if (!body.result) {
            console.log(error)
            console.log(response)
        }
    })
}

const postErrorToSlack = (s) => {
    const request = require('request')
    const options = {
        uri: process.env.slack_hook,
        headers: {
            'Content-type': 'application/json',
        },
        json: {
            text: s,
        },
    }
    request.post(options, function (error, response, body) {})
}
