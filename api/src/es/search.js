import fetch from 'node-fetch';

const toResultList = esResults => ({
  took: esResults.took,
  total: esResults.hits.total.relation === 'eq' ? esResults.hits.total.value : `${esResults.hits.total.value}+`,
  hits: esResults.hits.hits.map(hit => hit._source)
})

export const keywordSearch = (keyword, size) => {

  const query = {
    query: {
      bool: {
        must: [
          { 
            multi_match: { 
              query: keyword, 
              fields: [ "properties.title^2", "names.toponym" ]
            }
          }
        ],
        should: [
          { match: { "properties.feature_class": { query: "PPLA2", boost: 10000 } } },
          { match: { "properties.feature_class": { query: "PPLA",  boost: 100000 } } },
          { match: { "properties.feature_class": { query: "PPLC",  boost: 1000000 } } },
          { function_score: { "field_value_factor": { field: "properties.population", factor: 0.0000001 } } }
        ]
      }
    },
    size: size || 100
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' }
  }

  return fetch('http://localhost:9200/gazetteer/_search', options)
    .then(res => res.json())
    .then(data => toResultList(data));
}
