import gzip
import json
import requests

from itertools import islice

GEOCODER_BASE = "http://localhost:9200/"
GEOCODER_INDEX = "gazetteer"

GEOCODER_URL = GEOCODER_BASE + GEOCODER_INDEX
BULK_URL = GEOCODER_URL + '/_bulk'

BATCH_SIZE = 1000
  
"""
Delete index, if exists
"""
response = requests.delete(GEOCODER_URL)

"""
Init index from JSON config
"""
with open('./elastic.config.json') as f:
  data = json.load(f)
  response = requests.put(GEOCODER_URL, json=data)

  if (response.status_code == 200):
    print('Geocoding index initialized successfully: ' + GEOCODER_URL)
  else:
    print(response.text)

"""
Stream gazetteer to index
"""
print("Indexing gazetteer data...")

ctr = 0
with gzip.open('./geonames_global_notable.lpf.jsonl.gz', 'rt') as f:
  while True:
    next_batch = list(islice(f, BATCH_SIZE))

    if not next_batch:
      break

    payload = ''

    for place in next_batch:
      meta = json.dumps({
        'index': { '_index': GEOCODER_INDEX }
      })
    
      payload = f'{payload}{meta}\n{place}\n'
      
    headers = { 'Content-Type': 'application/x-ndjson' }
    response = requests.post(BULK_URL, data=payload, headers=headers)

    ctr += len(next_batch)

print(f'Successfully indexed {ctr} gazetteer records')