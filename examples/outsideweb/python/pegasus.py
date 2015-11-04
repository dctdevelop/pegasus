
# DCT
# Oct 2015
# Pegasus API client functions

import datetime
import pprint
import logging
import time
import csv
from geojson import Point, Feature, FeatureCollection
import shapefile

import requests


class RequestError(Exception):

	def __init__(self, request, message=None, query=None):
		self.request = request
		self.message = message
		self.query = query


def getRawData(*args, **kwargs):
	'''
		Does /rawdata requests to Pegasus API
		Required params:
			- url (do not include /api)
			- username, password

		Optionals:
			- query: A dict with key-value pairs for the rawdata get
			- jobid: If passed, a GET to /rawdata is ommited, and job status is consulted
				use this when consulting a previously-requested rawdata job.

			- authToken: If passed, a /login is not tried, this token is used instead.
			- iters: Max Job check retries
			- poll_secs: Job check poll time

			-logger: Optional logger, default is logging basicConfig.

			-fname: File name to put data in


		Examples:
		query = {
			"from":"2015-10-20",
			"to":"2015-10-21",
			"export":"tsv",
			"async":"1",
			"types":"10",
			#"fields" : "basic",
			#"fields" : "rssi:@cf_rssi,vi:'vid:'+@vid__str,mph,valid_position,comdelay,type,vid,label,code,lat,lon,hdop",
			"basic" : "1"
			}
		peg.getRawData("https://pegasus1.pegasusgateway.com", "developer@digitalcomtech.com", "dctdevelop", query=query)

		peg.getRawData("https://thesite.com", "user@digitalcomtech.com", "12333221", jobid=443)



	'''

	logger =  kwargs.get('logger')
	logging.getLogger("requests").setLevel(logging.WARNING)

	if logger is None:
		logger = logging.getLogger(__name__)
		logger.propagate = False
		logger.handlers=[]
		logger.addHandler(logging.StreamHandler())
		logger.setLevel(logging.DEBUG)
		kwargs['logger'] = logger

	try:
		fname =  _getRawData(*args, **kwargs)
		if fname is None:
			raise Exception("no file saved")
		return fname

	except RequestError as err:
		msg = "code: %r" %err.request.status_code
		try:
			msg += "\n%s" % pprint.pformat(err.request.json())
		except:
			pass
		try:
			msg += "\n%s" % pprint.pformat(err.query)
		except:
			pass

		logger.error(msg)
		raise err

	return

def _getRawData(url, username, password,
	query=None,
	authToken=None,
	jobid = None,
	iters=300,
	poll_secs=5,
	logger=None,
	export="tsv",
	fname=None,
	tz=None
	):



	url = url.rstrip("/") + "/api"
	if authToken is None:
		req = requests.post(url+"/login", dict(username=username, password=password))
		if req.status_code != 200:
			raise RequestError(req)

		authToken = req.json().get("auth")

	headers = {'Authenticate': authToken}
	if tz is not None:
		headers['X-Time-Zone'] = tz

	if jobid == None:
		if query is None:
			raise ValueError("Need query param")

		if "async" not in query:
			query['async'] = "1"

		if "export" not in query:
			query['export'] = export
		else:
			export=query['export']

		logger.debug("GET /rawdata \n%s" % pprint.pformat(query))
		req = requests.get(url+"/rawdata", params=query, headers=headers)
		if req.status_code != 200:
			raise RequestError(req, query)

		jobid = req.json().get("job_id")
		if jobid is None:
			raise Exception("no job id")


	logger.debug("Got job %r" %jobid)


	i=0
	while i < iters:
		i +=1
		time.sleep(poll_secs)
		req = requests.get(url+"/jobs/%d"%jobid, headers=headers)
		if req.status_code != 200:
			raise RequestError(req)

		job = req.json()

		state = job.get("state")
		progress = job.get("progress")

		logger.info("waiting job %r... %r/%r, state=%r, step=%r/%r message=%r "%(
				job.get('id'),
				i,
				iters,
				job.get('state'),
				progress.get("step"),
				progress.get("steps"),
				progress.get("message")
				))

		if state == "done":
			logger.debug("Job done, downloading data....")
			if fname is None:
				fname = "%f.tsv.tmp" %time.time()

			_getFile(fname, url+"/jobs/%d/data.%s"%(jobid, export), headers=headers)
			logger.debug("file saved: %r" %fname)
			return fname


		if state == "error" or state == "stopped":
			raise Exception("An error occurred with the job. state=%r" %state)

	logger.error("timeout checking job")

	return

def _getFile(fname, url, headers):
	'''
		Downloads and writes a file

	'''

	with open(fname, 'wb') as fhandler:
		response = requests.get(url, stream=True, headers=headers)

		if not response.ok:
			raise RequestError(response)

		for block in response.iter_content(1024):
			fhandler.write(block)

		fhandler.flush()

	return

def tsvToGeoJSON(infname):
	'''
		Reads a TSV file name
		returns a GeoJSON FeatureCollection
	'''
	#points = MultiPoint()
	collection = []

	with open(infname, 'rb') as infile:
		treader = csv.DictReader(infile, delimiter="\t")
		for row in treader:
			#pprint.pprint(row)
			try:
				lon = float(row.get('lon'))
				lat = float(row.get('lat'))
			except:
				continue
			#print "coords: %r %r" %(lon, lat)

			#p = Point(lon,lat)
			props = row
			del(props['lat'])
			del(props['lon'])

			collection.append(Feature(geometry=Point((lon,lat)), properties=props))

	return FeatureCollection(collection)


def tsvToShape(infname,outfname):
	'''
		Reads a TSV file name
		Creates  shapefiles using outfname as common name
	'''
	#points = MultiPoint()
	shp = shapefile.Writer(shapefile.POINT)
	set_fields_type = ['event_time', 'system_time']
	fields = {
		#'event_time' : ('D'),
		#'system_time' : ('D'),
		#'st_event_time' : ('C'),
		#'st_system_time' : ('C'),
	}
	attributes = []
	with open(infname, 'rb') as infile:
		treader = csv.DictReader(infile, delimiter="\t")
		for col in treader.fieldnames:
			if col == '':
				continue
			if col not in fields:
				fields[col] = ('C', '40')


		for row in treader:
			#pprint.pprint(row)
			try:
				lon = float(row.get('lon'))
				lat = float(row.get('lat'))
			except:
				continue

			shp.point(lon, lat)

			props = {}
			for key in fields.keys():
				if key not in row:
					continue

				val = row[key]
				_type = None
				if key == 'system_time' or key == 'event_time':
					# props['st_'+ key] = val
					# val = val.replace("T", " ")
					# val = val.split(".")[0].split(" ")[0].replace("-", "")
					pass

				else:
					if val.lower() == "false":
						val = 0
						#_type = ('L', '1')
					elif val.lower() == "true":
						val = 1
						#_type = ('L', '1')


				props[key] = val

				if key not in set_fields_type:

					_type = ('C', '40')
					try:
						float(val)
						_type = ('N')

						#try:
						#	long(val)
						#	_type = ('N')
						#except:
						#	pass

					except:
						pass

					set_fields_type.append(key)
					fields[key] = _type



			if len(props) == 0:
				raise Exception ("No params for observation")

			attributes.append(props)


		for key, val in fields.iteritems():
			shp.field(key, *val)

		for attr in attributes:
			shp.record(**attr)

	shp.save(outfname)

	# create the PRJ file
	prj = open("%s.prj" % outfname, "w")
	epsg = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'
	prj.write(epsg)
	prj.close()
	return


def resolveLocations(infname):
	'''
		Reads a TSV file
		fills locations
	'''
	#points = MultiPoint()
	outfname = infname.replace(".tsv", "locations.tsv")
	outwriter = csv.writer(outfname, delimiter="\t")

	tmp = []


	with open(infname, 'rb') as infile:

		treader = csv.DictReader(infile, delimiter="\t")
		i=0
		for row in treader:

			try:
				lon = float(row.get('lon'))
				lat = float(row.get('lat'))
				if lon==0 and lat==0:
					raise Exception()


			except:
				row['location_name'] = None
				row['location_zones'] = None



			outwriter.writerow(row)
