import string 
import sys
inputList = sys.stdin.readlines()
inputList = map(lambda s: s.strip('\n'), inputList)

for data in inputList:
    print data + ":" + "hen"
