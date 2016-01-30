#!bin/bash
#Glue the pipes together. 
python calculateUserAndMail.py |  python generateCityAndCountry.py | python generatePasswords.py | python appendGender.py
