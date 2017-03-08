import selenium.webdriver.support.ui as ui
import time 
from selenium import webdriver
import sys
from PIL import Image

# Checking if we didn't get the parameters in the command line
if len(sys.argv) != 3:
    # Getting all the parameters from the user
    iframe = input("Please enter iframe address => ")
    imagename = input("Please enter image name => ")
elif len(sys.argv) == 3:
    iframe = sys.argv[1]
    imagename = sys.argv[2]

# Initilizing the arguments for the GhostDriver
service_args = [
            '--ignore-ssl-errors=true',
            '--ssl-protocol=any',
            #'--load-images=false',
            '--proxy-type=none',
            '--web-security=false'
               ]

# Creating a PhantomJS connection
driver = webdriver.PhantomJS(service_args=service_args)
driver.set_window_size(1024,768)

driver.get(iframe)
# Some cinemas require you to choose the number of tickets you're going to buy
try:
    # Getting the tickets select and selecting the number of tickets the user asked
    ticketDD = ui.Select(driver.find_elements_by_class_name('ddlTicketQuantity')[0])
    ticketDD.select_by_value("1")

    # Submiting the first step
    driver.find_element_by_id('ctl00_CPH1_imgNext1').click()

# Catching the error incase we are not in a tickets number page
except Exception as e:
    print(e)
    pass

element = driver.find_element_by_class_name("SeatPlanContainer")
location = element.location
size = element.size

driver.execute_script('document.body.style.background = "white"')
driver.save_screenshot("/root/itchy-broccoli/seatmaps/" + imagename + ".png")
driver.quit()

left = location['x']
top = location['y']
right = location['x'] + size['width']
bottom = location['y'] + size['height']

img = Image.open("/root/itchy-broccoli/seatmaps/" + imagename + ".png")
img.crop((left, top, right, bottom)).save('/root/itchy-broccoli/seatmaps/' + imagename + ".png")
img.close()

