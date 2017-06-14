import scrapy

class Game(scrapy.Item):
    team0 = scrapy.Field()
    team1 = scrapy.Field()
    score0 = scrapy.Field()
    score1 = scrapy.Field()
    playing = scrapy.Field()



    def to_str(self):
        if self["playing"]:
            return "{0} {1} - {2} {3}".format(self["team0"], self["score0"], self["score1"], self["team1"])
        else:
            return "{0} - {1} (開始前)".format(self["team0"], self["team1"])


