# Get rawdata using python
You will get a TSV file.
You may chose get also a GeoJSON and/or a Shapefile


## Usage
Download all files in a directory and run:

```shell
	python getdata.py
```

You will get the following help text:
```shell
DCT - getdata.py
Command line script to get pegasus data.


python getdata.py

Params
	-d=<domain name>					exp: -d=pegasus1.digitalcomtech.com
	-u=<username>						exp: -u=developer@digitalcomtech.com
	-p=<password>						exp: -p=12345
	-z=<Time Zone> (optional)			exp: -z="America/New_York"

	-o=<out_file_name> (see also -f)	File path+prefix
		You may specify a full path.
		Make sure directories exists.

		Examples
			-o=outfile					Creates outfile.tsv, outfile.shp, etc...
			-o=./out/data				Creates data.tsv, data.shp, within ./out directory


	-f=<out_formats> (see als -o)		File formats to output

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
		python getdata.py \
			-d=pegasus1.pegasusgateway.com \
			-u=developer@digitalcomtech.com \
			-p=1234 \
			--from=2015-10-29T08:00:00 \
			--to=2015-10-29T14:00:00 \
			--vehicles=617 \
			--fields="\$basic" \
			-o=data

		python getdata.py \
			-d=pegasus1.pegasusgateway.com \
			-u=developer@digitalcomtech.com \
			-p=1234 \
			--from=2015-10-29T08:00:00 \
			--to=2015-10-29T14:00:00 \
			--vehicles=617 \
			--fields="\$basic" \
			-o=./out/data \
			-f=tsv,geojson,shape
```

## Requirements
```shell
pip install requests
```
#### For other formats but TSV:
```shell
pip install geojson
```

```shell
pip install pyshp
```

#### SSL errors
If you get a bunch of *InsecurePlatform* errors, try
```shell
pip install pyopenssl ndg-httpsclient pyasn1
```
Or check [this](http://stackoverflow.com/questions/29134512/insecureplatformwarning-a-true-sslcontext-object-is-not-available-this-prevent)

## Examples

#### Get a TSV file
- Reading vehicles *617* and *605*.
- Using time zone *Europe/London*
- Result goes to file *data.tsv*
```shell
	python getdata.py \
		-d=pegasus1.pegasusgateway.com \
		-u=developer@digitalcomtech.com \
		-p=1234 \
		-z="Europe/London" \
		--from=2015-10-29 \
		--to=2015-10-30 \
		--vehicles="617,605" \
		--fields="\$basic" \
		-o=data
```
---

#### Get a GeoJSON file
- Reading vehicles on groups *5* and *6*.
- Using time zone *America/Bogota*
- Using a more fine-grained time range (*from* - *to*)
- Result goes to file *data.geojson*
```shell
	python getdata.py \
		-d=pegasus1.pegasusgateway.com \
		-u=developer@digitalcomtech.com \
		-z="Europe/Oslo" \
		-p=1234 \
		--from=2015-10-29T08:00:00 \
		--to=2015-10-29T14:00:00 \
		--groups="5,6" \
		--fields="\$basic" \
		-o=data \
		-f=geojson
```

#### Get a Shape file
- Reading vehicles on groups *5* and *6*.
- Using time zone *America/Bogota*
- Using a more fine-grained time range (*from* - *to*)
- Result goes to files *./outdir/data.shp* *./outdir/data.shx*  *./outdir/data.dbf*

```shell
	python getdata.py \
		-d=pegasus1.pegasusgateway.com \
		-u=developer@digitalcomtech.com \
		-z="America/Bogota" \
		-p=1234 \
		--from=2015-10-29T08:00:00 \
		--to=2015-10-29T14:00:00 \
		--groups="5,6" \
		--fields="\$basic" \
		-o=./outdir/data \
		-f=shape
```

#### Get a all formats
- Reading vehicles on groups *5* and *6*.
- Using time zone *America/Bogota*
- Using a more fine-grained time range (*from* - *to*)
- Result goes to files *./outdir/data.shp* *./outdir/data.shx*  *./outdir/data.dbf* *./outdir/data.tsv* *./outdir/data.geojson*

```shell
	python getdata.py \
		-d=pegasus1.pegasusgateway.com \
		-u=developer@digitalcomtech.com \
		-z="America/Chicago" \
		-p=1234 \
		--from=2015-10-29T08:00:00 \
		--to=2015-10-29T14:00:00 \
		--groups="5,6" \
		--fields="\$basic" \
		-o=./outdir/data \
		-f=tsv,geojson,shape
```