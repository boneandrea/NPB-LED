import scrapy

class Game(scrapy.Item):
    team0 = scrapy.Field()
    team1 = scrapy.Field()
    score0 = scrapy.Field()
    score1 = scrapy.Field()
    playing = scrapy.Field()
    end = scrapy.Field()
    inning = scrapy.Field()



    def to_str(self):

        end_str="(終了)" if self["end"] else ""

        if self["playing"]:
            if self["inning"] == "" :
                return "{0} {1} - {2} {3} {4}".format(self["team0"], self["score0"], self["score1"], self["team1"], end_str)
            else:
                return "{0} {1} - {2} {3} ({4})".format(self["team0"], self["score0"], self["score1"], self["team1"], self["inning"])
                
        else:
            return "{0} - {1} (開始前)".format(self["team0"], self["team1"])


