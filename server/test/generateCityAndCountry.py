#Small program reading from stdin and appending cities and countries.
import string 
import random
import sys
countries = ["Fooland","Barland", "byeriania"]
cities = ["Smallville", "Oxtown" , "Hamham" , "Smurftown" , "Mercedes"]
inputList = sys.stdin.readlines()
inputList = map(lambda s: s.strip('\n'), inputList)

for data in inputList:
    print data + ":" + random.choice(cities) + ":" + random.choice(countries)


