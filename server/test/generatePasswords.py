#Observe this is just for testing purposes 


import sys
import uuid
inputList = sys.stdin.readlines()
inputList = map(lambda s: s.strip('\n'), inputList)

for name in inputList:
    passwd = str(uuid.uuid4())
    print name + ":" + passwd[:6]
