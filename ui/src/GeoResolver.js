import memoize from 'memoizee';
import Emitter from 'tiny-emitter';

const sleep = ms => new Promise(res => setTimeout(res, ms));

const query = memoize((placename, country, retries) => {
  const r = retries === undefined ? 10 : retries;

  const url = country ?
    `/api/search?q=${placename}&countries=${country}&size=1` :
    `/api/search?q=${placename}&size=1`;
  
  return fetch(url)
    .then(response => response.json())
    .catch(async error => {
      if (r > 0) {
        const backoff = (11 - r) * 200;
        console.log(`failed - retrying in ${backoff} ms`);

        await sleep(backoff);

        return query(placename, country, r - 1);
      } else {
        throw error;
      }
    });
});

export default class GeoResolver extends Emitter {

  resolve = async csv => {
    const total = csv.data.length;

    const resolved = [];

    let ctrResolved = 0;
    let ctrErrors = 0;
    
    for (const [ idx, row ] of csv.data.entries()) {
      const placename = row.caption.split('-')[0].trim();
      const country = row.country.trim();

      try {
        const results = await query(placename, country);

        const { hits } = results;

        if (hits?.length > 0) {
          // Successfully resolved
          ctrResolved = ctrResolved + 1;

          const h = hits[0];

          resolved.push({
            ...row,
            geonames_uri: h['@id'],
            longitude: h.geometry.coordinates[0],
            latitude: h.geometry.coordinates[1],
            geonames_title: h.properties.title,
            geonames_country: h.properties.ccodes?.length > 0 && h.properties.ccodes[0],
            geonames_name_variants: h.names.map(n => n.toponym).join(';')
          });
        } else {
          resolved.push(row);
        }
      } catch (error) {
        ctrErrors = ctrErrors + 1;
        resolved.push(row);
      }

      this.emit('progress', { count: idx + 1, percent: (idx + 1) / total, total });
    }

    this.emit('complete', { resolved, successful: ctrResolved, errors: ctrErrors });
  }

} 