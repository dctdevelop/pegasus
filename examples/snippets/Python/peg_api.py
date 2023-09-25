'''
@Author DCT developer Team.
@email pegasus.developers@digitalcomtech.com
@version 0.1
@date OCT 19 2015
::::Description:::
Snipped code in python for consume the pegasus API.
'''

#uses python requests module
#pip install requests

import requests
import datetime, time
import sys
import json

source = 'https://pegasus1.pegasusgateway.com' #URL your pegasus site.

'''
 __USERNAME__ refers to your username for sign in on pegasus.
 __PASSWORD__ refers to your password for sign in on pegasus.
 Test credentials:
 username: developer@digitalcomtech.com
 password: deV3lopErs
'''
creds = {'username':'__USERNAME__', 'password':'__PASSWORD__'}


r = requests.post(source+'/api/login', data=creds, headers={'Origin':'app-id'}) #sign in request.
r.raise_for_status() #Validate status.
auth =  r.json()['auth'] #extract token

url = '{0}/api/v0/vehicles'.format(source) #URL vehicles resource.
r = requests.get(url, headers={'Authenticate':auth, 'Content-Type':'application/json'})#Get vehicles form API
try:
	r.raise_for_status() #Validate status.
except:
	print "Error creating geofence. status: {0}, {1}".format(r.status, url)
	print "Terminating"

print r.json() #Show vehicles
