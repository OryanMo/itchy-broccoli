#!/usr/bin/python3
import selenium.webdriver.support.ui as ui
from time import sleep
from selenium import webdriver
import sqlite3
from datetime import datetime
from pyvirtualdisplay import Display
from pathlib import Path


db = sqlite3.connect('db/moviedb.db')
cinemas = db.cursor()
#cursor.execute('UPDATE movies SET lastupdate=(?) WHERE pid=' + str(pid), (str(datetime.datetime.now()).split('.')[0],))
cinemas.execute('SELECT * FROM cinema')
cinemasIterator = list(set(cinemas))


cleandb = db.cursor();

cleandb.execute('DELETE FROM venue')
cleandb.execute('DELETE FROM feature')
cleandb.execute('DELETE FROM presentation')

db.commit()

service_args = [
            '--ignore-ssl-errors=true',
            '--ssl-protocol=any',
            '--load-images=false',
            '--proxy-type=none',
               ]

display = Display(visible=0, size=(1024,768))
display.start()
jquery = "" 

with open('/root/jquery.min.js', 'r') as jquery_js:
    jquery = jquery_js.read()

for cinema in cinemasIterator:
    #driver = webdriver.PhantomJS(service_args=service_args)
    driver = webdriver.Chrome()
    #driver.set_window_size(1920,1080)
    print(cinema)
    driver.get(cinema[2] + "presentationsJSON")
    sleep(3)

    driver.execute_script(jquery)

    getAllData = 'return JSON.parse($.ajax({async:false, url:"presentationsJSON", data: {subSiteId : "", venueTypeId:"", showExpired:false}, method:"GET"}).responseText);'

    insert = db.cursor()

    alldata = driver.execute_script(getAllData)

    sites = []
    features = []
    presentations = []

    for site in alldata['sites']:
        if 'tu' in site:
            tu = site['tu']
        else:
            if site['si'] == 1010004:
                tu = "https://tickets.yesplanet.co.il/ypj/?key=1073&ec=$PrsntCode$"
            elif site['si'] == 1010005:
                tu = "https://tickets.yesplanet.co.il/ypbs/?key=1074&ec=$PrsntCode$"
            else:
                tu = ""

        sites.append((site['si'], site['sn'], site['vt'], cinema[0], tu))

        for feature in site['fe']:
            features.append((feature['dc'], feature['fn'], site['si']))

            for pres in feature['pr']:
                presentations.append((pres['pc'], datetime.strptime(pres['dt'].split(' ')[0]+" " + pres['tm'], "%d/%m/%Y %H:%M"), feature['dc'], site['si']))


    print(sites)
    print(features)

    insert.executemany('INSERT OR REPLACE INTO venue VALUES(?,?,?,?,?)', sites)
    insert.executemany('INSERT OR REPLACE INTO feature VALUES(?,?,?)', features)
    insert.executemany('INSERT OR REPLACE INTO presentation VALUES(?,?,?,?)', presentations)

    db.commit()


    driver.quit()
display.stop()
db.close()

Path('lastpopulated.data').touch()
