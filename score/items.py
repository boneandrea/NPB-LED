import scrapy

class Game(scrapy.Item):
    team0 = scrapy.Field()
    team1 = scrapy.Field()
    score0 = scrapy.Field()
    score1 = scrapy.Field()



    def to_str(self):

        return "{0} {1} - {2} {3}".format(self["team0"], self["score0"], self["score1"], self["team1"])



