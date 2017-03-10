import datetime
import selenium.webdriver.support.ui as ui
import time 
from selenium import webdriver
import sys
import sqlite3
import os
import signal

# Checking if we didn't get the parameters in the command line
if len(sys.argv) != 5:
    # Getting all the parameters from the user
    iframe = input("Please enter iframe address => ")
    ticketsNum = input("Please enter the number of tickets to buy => ")
    row = input("Please enter the wanted row => ")
    leftmostSeatnum = input("Please enter the leftmost seat => ")
elif len(sys.argv) == 5:
    iframe = sys.argv[1]
    ticketsNum = sys.argv[2]
    row = sys.argv[3]
    leftmostSeatnum = sys.argv[4]

# Intilizing the firstTime and the pid variables
firstTime = True
pid = os.getpid()

# Initilizing the arguments for the GhostDriver
service_args = [
            '--ignore-ssl-errors=true',
            '--ssl-protocol=any',
            #'--load-images=false',
            '--proxy-type=none',
               ]


# Statrting a loop that will run over until the process is killed
while True:
    # Creating a PhantomJS connection
    driver = webdriver.PhantomJS(service_args=service_args)
    driver.set_window_size(1024,768)
    print("Create webdriver")
    # Putting the code inside a try clause to catch any error
    try:
        # Navigating to the iframe
        driver.get(iframe)
        print("Got iframe")
        # Some cinemas require you to choose the number of tickets you're going to buy
        try:
            # Getting the tickets select and selecting the number of tickets the user asked
            ticketDD = ui.Select(driver.find_elements_by_class_name('ddlTicketQuantity')[0])
            ticketDD.select_by_value(ticketsNum)

            # Submiting the first step
            driver.find_element_by_id('ctl00_CPH1_imgNext1').click()
        # Catching the error incase we are not in a tickets number page
        except Exception as e:
            print(str(e))
            pass

        # Running more code relevent for the first time
        if firstTime:
            # Getting the hall number from the page
            hall = driver.find_element_by_class_name('ViewAreaName').text.split(' - ')[1]

            # Inserting the data we collected from the page into the db
            db = sqlite3.connect('/root/itchy-broccoli/db/moviedb.db')
            cursor = db.cursor()
            cursor.execute('UPDATE movies SET hall=(?) WHERE isactive=1 and pid=' + str(pid), (hall.replace(' ', ''), ))
            db.commit()
            db.close()
            firstTime = False

            # Turning the firstTime variable to false so it won't run next time

        #driver.execute_script('$(\'.seat[style*="SeatStatus=3"\').click()')
        # Getting the first (leftmost) seat
        currSeat = driver.execute_script('return $(\'span:contains("' + str(row) + '"):not([id!=""], :has(.seat)):eq(0) ~ span .seat:eq(' + str(leftmostSeatnum) + ')\')[0];')

        if int(row) < 3:
            driver.execute_script("window.confirm = function(){return true;}")
        # Going over the number of the seats the user wanted
        for seatnum in range(int(ticketsNum)):
            # Selecting the current seat
            currSeat.click()

            # Getting the next seat in line
            try:
                currSeat = currSeat.find_element_by_xpath("../following-sibling::span/div[@class='seat']")
            except:
                pass

        # Clicking the last submit
        driver.find_element_by_id('ctl00_CPH1_SPC_lnkSubmit').click()

    # Incase the program crashed
    except Exception as e:
        # Print to the console / log that we failed and the error
        print('Failed...')
        print(str(e))
        sys.stdout.flush()

        # Continuing to the next iteration
        continue
    # Stuff to do no matter what happend
    finally:
        # Opening a try clause to see if there's an alert on the page
        try:
            # Get the alert from the page
            alert = driver.switch_to_alert()

            # If the alert is about not selecting the seats
            if 'חובה לבחור' in alert.text:
                # Accept the alert
                print("Not all seats were selected")
                alert.accept()
            # If the alert is an error not about selecting the seats
            else:
                # Printing the error from the alert to the console / log
                print(alert.text)

                # Removing the row from the db
                db = sqlite3.connect('/root/itchy-broccoli/db/moviedb.db')
                cursor = db.cursor()
                cursor.execute('UPDATE movies SET isactive=0 WHERE isactive=1 and pid=' + str(pid))
                db.commit()
                db.close()

                # Killing the process
                os.kill(int(pid), signal.SIGKILL);
        except Exception as e:
            pass
        finally:
            # Printing success message to screen
            print('Succeeded!')

            # Updating the last update time in the db
            db = sqlite3.connect('/root/itchy-broccoli/db/moviedb.db')
            cursor = db.cursor()
            cursor.execute('UPDATE movies SET lastupdate=(?) WHERE pid=' + str(pid), (str(datetime.datetime.now()).split('.')[0],))
            db.commit()
            db.close()

            # Checking the current site
            if "yesplanet" in iframe or "rav-hen" in iframe:
                # Printing message to terminal, so we know it didn't crash
                print('YesPlanet or RavHen detected, Sleeping for 15 minutes at ', datetime.datetime.now())
                sys.stdout.flush()
                try:
                    # Sleeping for 930 seconds (15.5 minutes, just incase)
                    time.sleep(900);
                    driver.quit()
                except KeyboardInterrupt:
                    print('Got KeyboardInterrupt, deselecting places at ', datetime.datetime.now())
                    sys.stdout.flush()
                    driver.back()

                    time.sleep(1)

                    killResult = driver.execute_script('return document.getElementById("tbSelectedSeats").value = 0;')
                    driver.find_element_by_id('ctl00_CPH1_SPC_lnkSubmit').click()
                    print('Deselected places.')
                    sys.stdout.flush()
                    if (int(killResult) == 0):
                        # Closing the driver
                        driver.quit()
                        # Killing the process
                        os.kill(int(pid), signal.SIGKILL);
            elif "cinema-city" in iframe:
                # Printing message to terminal, so we know it didn't crash
                print('CinemaCity detected, Sleeping for 7 minutes at ', datetime.datetime.now())
                sys.stdout.flush()
                try:
                    # Sleeping for 450 seconds (7.5 minutes, just incase)
                    time.sleep(420);
                    driver.quit()
                except KeyboardInterrupt:
                    print('Got KeyboardInterrupt, deselecting places at ', datetime.datetime.now())
                    sys.stdout.flush()
                    driver.back()

                    time.sleep(1)

                    killResult = driver.execute_script('return document.getElementById("tbSelectedSeats").value = 0;')
                    driver.find_element_by_id('ctl00_CPH1_SPC_lnkSubmit').click()
                    if (int(killResult) == 0):
                        # Closing the driver
                        driver.quit()
                        # Killing the process
                        os.kill(int(pid), signal.SIGKILL);
            elif "globusmax" in iframe:
                # Printing message to terminal, so we know it didn't crash
                print('GlobusMax detected, Sleeping for 6 minutes at ', datetime.datetime.now())
                sys.stdout.flush()
                try:
                    # Sleeping for 390 seconds (6.5 minutes, just incase)
                    time.sleep(385);
                except KeyboardInterrupt:
                    print('Got KeyboardInterrupt, deselecting places at ', datetime.datetime.now())
                    sys.stdout.flush()
                    driver.back()

                    time.sleep(1)

                    killResult = driver.execute_script('return document.getElementById("tbSelectedSeats").value = 0;')
                    driver.find_element_by_id('ctl00_CPH1_SPC_lnkSubmit').click()
                    if (int(killResult) == 0):
                        # Closing the driver
                        driver.close()
                        # Killing the process
                        os.kill(int(pid), signal.SIGKILL);
        #    elif "lev" in iframe:
        #        # Printing message to terminal, so we know it didn't crash
        #        print('Lev detected, Sleeping for 12 minutes at ', datetime.datetime.now())
        #        sys.stdout.flush()
        #        # Sleeping for 390 seconds (12.5 minutes, just incase)
        #        time.sleep(750);
        
            # Closing the PhantomJS connection
            #driver.get(iframe)
        
            # Saying when we returned to work (Checking time)
            print('Returning to work at ', datetime.datetime.now())
            sys.stdout.flush()
