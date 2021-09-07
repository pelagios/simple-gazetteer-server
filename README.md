# Simple Gazetteer & Georesolver

__Work in progress!__

A simple gazetteer server & API for use with 
[Linked Places](https://github.com/LinkedPasts/linked-places-format) 
gazetteers. 

To get you started, a Linked Places dumpfile of 1.6 million 
notable places (= places with Wikipedia or Wikidata correspondences) from 
GeoNames is [included here](/blob/main/backend/bootstrap/geonames_global_notable.lpf.jsonl.gz).

## Server & API

The gazetteer server is based on ElasticSearch, behind a simple JSON API 
built with Node.js/Express. A Docker configuration for quick setup is included.

```shell
$ docker-compose build
$ docker-compose up
```

After initial installation, you need to index the gazetteer dataset:

```shell
$ cd backend/bootstrap
$ python init_backend.py
```

## Bulk-Georesolution Utility

The project includes a browser-based utility for batch-georesolution of CSV data. 
(Setup instructions to follow!)

![Georesolution UI screencast](georesolution-ui-screencast.gif)

The utility runs requests against the gazetteer server for each distinct placename
in the CSV. The result is shown on the map, and an extended CSV (origina +
additional columns with GeoNames information) is made available for export.

Wrong matches or places that could not be resolved can be fixed manually. In this
case, the interface queries the GeoNames API directly (because it sometimes 
returns different matches than the ElasticSearch backend).









