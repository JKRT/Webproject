#Function to access and control the database , used by server to access the database

import sqlite3

connection = sqlite3.connect("database.db")
cursor = connection.cursor()

def sign_in(email, password):
    cursor.execute("SELECT * from users WHERE email=? AND password=?", (email, password))
    if cursor.fetchone() == None:
        return False
    else: 
        return True


def close():
    connection.close()
