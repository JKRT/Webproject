#Generate the SQL schema for storing dummy users in the database for testing purposes. 
import string 
import random
import sys

inputList = sys.stdin.readlines()
inputList = map(lambda s: s.strip('\n'), inputList)

def addQuotes(s1):
    return '"%s"' % s1

for data in inputList:
    data_list = data.split(":")
    print "INSERT INTO users VALUES ( "
    print "NULL,"
    print addQuotes(data_list[0]) + ","
    print addQuotes(data_list[1]) + ","
    print addQuotes(data_list[2]) + ","
    print addQuotes(data_list[3]) + ","
    print addQuotes(data_list[4]) + ","
    print addQuotes(data_list[5]) + ","
    print addQuotes(data_list[6]) + "," 
    print "NULL );"
    print "\n" 

