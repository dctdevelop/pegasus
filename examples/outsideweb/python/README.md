# Get rawdata using python
You will get a TSV file.
You may chose get also a GeoJSON and/or a Shapefile


## Usage
Download all files in a directory and run:

```shell
	python getdata.py
```

You will get a detailed help text

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
		--from=2015-10-29 \
		--to=2015-10-30 \
		--vehicles="617,605" \
		--fields="\$basic" \
		--tz="Europe/London" \
		-o=data.tsv
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
		-p=1234 \
		--from=2015-10-29T08:00:00 \
		--to=2015-10-29T14:00:00 \
		--groups="5,6" \
		--fields="\$basic" \
		--tz="America/Bogota" \
		-o=data.geojson
```