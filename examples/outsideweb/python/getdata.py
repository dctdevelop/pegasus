
'''
DCT - getdata.py
Command line script to get pegasus data.


python getdata.py
	-d=<domain name>		exp: '-d=pegasus1.digitalcomtech.com'
	-u=<username>			exp: '-u=developer@digitalcomtech.com'
	-p=<password>			exp: '-p=12345'

	-o=<out_file_name.type, default=data.tsv> (see also -f)
		<type>
			-tsv
			-geojson
			-shape

		examples:
			-o=myfile.tsv
			-o=myfile.geojson

	-f <include query params info on out file name>


	- Pass /rawdata query params: --<query_param>=value or --<query_param>='value'
	Examples:

		--from="2015-10-20"
		--to="2015-10-23"
		--groups="1,3"
		--vehicles="120,122"

	The following are fixed, hence ignored:
		--types=10
		--aync=1
		--export=tsv

	Usage examples:
	python getdata.py \\
		-d=pegasus1.pegasusgateway.com \\
		-u=developer@digitalcomtech.com \\
		-p=1234 \\
		--from=2015-10-29T08:00:00 \\
		--to=2015-10-29T14:00:00 \\
		--vehicles=617 \\
		--fields="\$basic" \\
		--tz="America/Bogota" \\
		-o=data.tsv

	python getdata.py \\
		-d=pegasus1.pegasusgateway.com \\
		-u=developer@digitalcomtech.com \\
		-p=1234 \\
		--from=2015-10-29T08:00:00 \\
		--to=2015-10-29T14:00:00 \\
		--vehicles=617 \\
		--fields="\$basic" \\
		-o=data.geojson

'''

import sys
import os
import time
import pprint
import getopt
import geojson
from pegasus import getRawData
from pegasus import tsvToGeoJSON





if __name__ == '__main__':

	required_base = ['d', 'u', 'p', 'o']
	required_query = ['from']

	base = {
		'o' : 'data.tsv'
	}
	query = {}
	try:
		args = sys.argv[1:]

		for arg in args:

			if arg.startswith("--"):
				toks = arg.split("=")
				query[toks[0][2:]] = toks[1]
				continue

			if arg.startswith("-"):
				if arg.find("=") == -1:
					base[arg[1:]] = True

				else:
					toks = arg.split("=")
					base[toks[0][1:]] = toks[1]

				continue

		for key in  required_base:
			if key not in base:
				raise Exception("Missing required param %r" %key)

		for key in  required_query:
			if key not in query:
				raise Exception("Missing required QUERY param %r" %key)


		ofile = base.get('o')
		ftype = ofile.split(".")[-1]
		if ftype == "tsv":
			pass

		elif ftype == "geojson":
			pass
		else:
			raise Exception("Unsupported file type")

		host = base['d']
		username = base['u']
		pas = base['p']

	except Exception as e:
		print __doc__
		print "---- error:"
		print str(e)
		sys.exit()

	#pprint.pprint(base)
	#pprint.pprint(query)




	tmpfile = getRawData("https://"+host, username, pas, query=query)


	if ftype == "geojson":
		data = tsvToGeoJSON(tmpfile)
		with open(ofile, "w") as f:
			f.write(geojson.dumps(data))

	else:
		print "Unknown ftype"
		sys.exit()

	os.rename(tmpfile, ofile.replace(".geojson", ".tsv"))

	print "File saved: " + ofile
	print "Done"

