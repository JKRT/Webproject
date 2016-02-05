#Observe this is just for testing purposes 


import sys
import uuid
import hashlib
inputList = sys.stdin.readlines()
inputList = map(lambda s: s.strip('\n'), inputList)

password = "vaniljsirap"
hashibashi = hashlib.sha256(password).hexdigest()

for data in inputList:
    print data + ":"  + hashibashi
