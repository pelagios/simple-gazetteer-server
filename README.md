# Simple Gazetteer Server

__!!! Work in progress !!!__

A simple gazetteer server & API for use with [Linked Places](https://github.com/LinkedPasts/linked-places-format) 
and other authority file formats. This repository includes a global GeoNames dataset to get you started (1.6 million 
notable places).

Simple Gazetteer Server (SGS) is built with ElasticSearch, and includes utilities for data import and management, a 
JSON API, and an administration UI. You can deploy SGS to an existing ElasticSearch cluster, or
use the included Docker configuration for quick installation.

## Installing with Docker

Run `docker-compose build` and `docker-compose up`.

## Example data

This repositry includes a sample gazetteer dataset consisting of all "notable" places in GeoNames, i.e.
those places in GeoNames that have a corresponding entry in Wikipedia or Wikidata.
