import fetch from 'node-fetch';
import { getCode } from 'country-list';

const toResultList = esResults => ({
  took: esResults.took,
  total: esResults.hits.total.relation === 'eq' ? esResults.hits.total.value : `${esResults.hits.total.value}+`,
  hits: esResults.hits.hits.map(hit => hit._source)
})

export const keywordSearch = (keyword, queryOpts) => {

  // Query defaults
  const size = queryOpts?.size || 100;

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
          { term: { "properties.feature_class": { value: "PPLA2", boost: 10000 } } },
          { term: { "properties.feature_class": { value: "PPLA",  boost: 100000 } } },
          { term: { "properties.feature_class": { value: "PPLC",  boost: 1000000 } } },
          { function_score: { "field_value_factor": { field: "properties.population", factor: 0.0000001 } } }
        ]
      }
    },
    size: size
  };

  // Add ccodes filter, if any
  if (queryOpts?.countries?.length > 0) {

    const iso = queryOpts.countries
      .map(country => country.length === 2 ?
        country.toUpperCase() :
        getCode(country))
      .filter(iso => iso); // Remove unresolved country names

    if (queryOpts.countries.length === 1) {
      query.query.bool.must.push(

        { term: { "properties.ccodes": { value: iso[0] } } }
      
      )
    } else {
      query.query.bool.must.push(
        
        { terms: { "properties.ccodes": iso } }
      
      )
    }
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' }
  }

  return fetch('http://localhost:9200/gazetteer/_search', options)
    .then(res => res.json())
    .then(data => toResultList(data));
}
