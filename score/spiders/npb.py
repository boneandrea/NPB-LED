# -*- coding: utf-8 -*-

import scrapy
from score.items import Game
import urllib.request, urllib.parse
import re

class NpbSpider(scrapy.Spider):
    name = "npb"
    allowed_domains = ["https://baseball.yahoo.co.jp/npb/"]
    start_urls = ['https://baseball.yahoo.co.jp/npb/']
    start_urls = ['https://baseball.yahoo.co.jp/npb/schedule/?date=20170613']

    def parse(self, response):

        mygames=[]

        for game in response.css(".NpbScoreBg table.teams"):
            mygame=Game({"team0": "", "team1":"", "score0":0, "score1":0})

#            for team in game.css("tr td.yjMS span a::text"):
#                print(team.extract())

            mygame["team0"]=game.css("tr td.yjMS span a::text")[0].extract()
            mygame["team1"]=game.css("tr td.yjMS span a::text")[1].extract()

            g=0

            if re.search("試合前", game.extract()) != None :
                mygame["playing"]=False
            else:
                mygame["playing"]=True
                for score in game.css("table tr td.score_r"):
                    s=0
                    if score.css("strong"):
                        s=score.css("strong::text")[0]
                    else:
                        s=score.css("::text")[0]

                    mygame["score{0}".format(g)]=s.extract()
                    g=g+1

#                    print(mygame.to_str())
                    pass
                
            mygames.append(mygame)
            print ("---")

        print("   ".join([ g.to_str() for g in mygames]))
        self.mypost("   ".join([ g.to_str() for g in mygames]))
    


    def mypost(self, result):
        data = {
                "str": result,
        }
    # ここでエンコードして文字→バイトにする！
        url="http://192.168.207.42:5000/news"

        data = urllib.parse.urlencode(data).encode("utf-8")
        with urllib.request.urlopen(url, data=data) as res:
           html = res.read().decode("utf-8")
           print(html)
