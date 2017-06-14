import scrapy

class Game(scrapy.Item):
    team0 = scrapy.Field()
    team1 = scrapy.Field()
    score0 = scrapy.Field()
    score1 = scrapy.Field()
