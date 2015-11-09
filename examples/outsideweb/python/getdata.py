
'''
DCT - getdata.py
Command line script to get pegasus data.


python getdata.py

Params
	-d=<domain name>					exp: -d=pegasus1.digitalcomtech.com
	-u=<username>						exp: -u=developer@digitalcomtech.com
	-p=<password>						exp: -p=12345
	-z=<Time Zone> (optional)				exp: -z="America/New_York"

	-o=<out_file_name> (see also -f)			File path+prefix
		You may specify a full path.
		Make sure directories exists.

		Examples
			-o=outfile				Creates outfile.tsv, outfile.shp, etc...
			-o=./out/data				Creates data.tsv, data.shp, within ./out directory


	-f=<out_formats> (see als -o)				File formats to output

		Use comma sparated values to
		generate multiple files.

		Allowed: tsv, geojson, shape
		tsv is the default.

		Examples:
			-f=tsv
			-f=tsv,geojson
			-f=shape
			-f=tsv,geojson,shape


	Double-dashes params go directly to /rawdata query:
	--<query_param>=value

		Examples:

			--from="2015-10-20"
			--to="2015-10-23"
			--groups="1,3"
			--vehicles="120,122"

		The following --params are fixed:
			--types=10
			--async=1
			--export=tsv

	Tips:
		- Use quotes when passing parameters that include spaces or special characters
		- Special (shell) characters must be escaped with backslash, see the examples.


	Examples:
		python getdata.py \\
			-d=pegasus1.pegasusgateway.com \\
			-u=developer@digitalcomtech.com \\
			-p=1234 \\
			--from=2015-10-29T08:00:00 \\
			--to=2015-10-29T14:00:00 \\
			--vehicles=617 \\
			--fields="\$basic" \\
			-o=data

		python getdata.py \\
			-d=pegasus1.pegasusgateway.com \\
			-u=developer@digitalcomtech.com \\
			-p=1234 \\
			--from=2015-10-29T08:00:00 \\
			--to=2015-10-29T14:00:00 \\
			--vehicles=617 \\
			--fields="\$basic" \\
			-o=./out/data \\
			-f=tsv,geojson,shape

'''

import sys
import os
import time
import pprint
import getopt
import geojson
from pegasus import getRawData
from pegasus import tsvToGeoJSON
from pegasus import tsvToShape




if __name__ == '__main__':

	required_base = ['d', 'u', 'p', 'o']
	required_query = ['from']

	base = {
		'o' : 'data',
		'f' : 'tsv'
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
		formats = base.get('f', 'tsv').split(',')
		formats = map(lambda x : x.strip(), formats )


		host = base['d']
		username = base['u']
		pas = base['p']
		tz = base.get('z')

	except Exception as e:
		print __doc__
		print "---- error:"
		print str(e)
		sys.exit()

	#pprint.pprint(base)
	#pprint.pprint(query)




	tmpfile = getRawData("https://"+host, username, pas, query=query, tz=tz)

	saved = []
	if 'geojson' in formats:
		data = tsvToGeoJSON(tmpfile)
		fname = ofile+".geojson"
		with open(fname, "w") as f:
			f.write(geojson.dumps(data))
			saved.append(fname)

	if 'shape' in formats:
		tsvToShape(tmpfile,ofile)
		saved.append(ofile)

	if "tsv" in formats:
		fname = ofile+".tsv"
		os.rename(tmpfile, fname)
		saved.append(fname)

	else:
		os.remove(tmpfile)



	print "Files saved: %s" %pprint.pformat(saved)
	print "Done"

