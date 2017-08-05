# -*- coding: utf-8 -*-

import scrapy
from score.items import Game
import urllib.request, urllib.parse
import re
import pickle

import sys
import syslog



class NpbSpider(scrapy.Spider):
    name = "npb"
    allowed_domains = ["https://baseball.yahoo.co.jp/npb/"]
    start_urls = ['https://baseball.yahoo.co.jp/npb/']
#    start_urls = ['https://baseball.yahoo.co.jp/npb/schedule/?date=20170613']

    def parse(self, response):

        syslog.openlog(sys.argv[0], syslog.LOG_PID|syslog.LOG_PERROR, syslog.LOG_LOCAL6)
        syslog.syslog(syslog.LOG_INFO, 'start')
        
        mygames=[]


        if re.search("本日の試合はあり", response.css(".NpbScoreBg")[0].extract()):
            syslog.syslog(syslog.LOG_INFO, '試合なし')
            syslog.closelog()
            return 

        for game in response.css(".NpbScoreBg table.teams"):
            mygame=Game({"team0": "", "team1":"", "score0":0, "score1":0, "end" : False})

#            for team in game.css("tr td.yjMS span a::text"):
#                print(team.extract())

            mygame["team0"]=game.css("tr td.yjMS span a::text")[0].extract()
            mygame["team1"]=game.css("tr td.yjMS span a::text")[1].extract()

            if len(game.css("tr td.active a::text")) > 0:
                mygame["inning"]=(game.css("tr td.active a::text").extract())[0]
            else:
                mygame["inning"]=""

            g=0

            if re.search("試合前", game.extract()) != None :
                mygame["playing"]=False
            else:
                mygame["playing"]=True
                
                if re.search("結果", game.extract()) != None :
                    mygame["end"]=True
                
                for score in game.css("table tr td.score_r"):
                    s=0
                    if score.css("strong"):
                        s=score.css("strong::text")[0]
                    else:
                        s=score.css("::text")[0]

                    mygame["score{0}".format(g)]=s.extract()
                    g=g+1

                    print(mygame.to_str())
                    pass
                
            mygames.append(mygame)
            print ("---")

        print("   ".join([ g.to_str() for g in mygames]))

        if self.is_changed(mygames):
            syslog.syslog(syslog.LOG_INFO, 'changed')
            self.mypost("   ".join([ g.to_str() for g in mygames]))
    
        syslog.closelog()



    def is_changed(self, games):

        syslog.syslog(syslog.LOG_INFO, 'is_changed??')
        try:
            with open('entry.pickle', 'rb') as f:
                before=pickle.load(f)
                print(before)
                f.close()
                syslog.syslog(syslog.LOG_INFO, 'read.')
            
                if games != before :
                    with open('entry.pickle', 'wb') as f:
                        pickle.dump(games, f)
                        syslog.syslog(syslog.LOG_INFO, 'changed. wrote.')
                        return True
        except:
            print(sys.exc_info())
            with open('entry.pickle', 'wb') as f:
                pickle.dump(games, f)

            return True
            
        return False
        pass

        
    def mypost(self, result):
        spacer="　　　　　　　　"
        data = {
            "str": spacer+"【むくむくニュース】"+result,
        }
    # ここでエンコードして文字→バイトにする！
        url="http://192.168.207.42:5000/news"

        data = urllib.parse.urlencode(data).encode("utf-8")
        with urllib.request.urlopen(url, data=data) as res:
           html = res.read().decode("utf-8")
           print(html)
