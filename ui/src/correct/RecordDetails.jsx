import React, { useEffect, useState } from 'react';

// Another Manar al-Athar-specific hack
const getToponym = caption =>
  caption.split('-')[0].trim();

const RecordDetails = props => {

  const [ alternatives, setAlternatives ] = useState([]);

  const { 
    caption, 
    country, 
    geonames_country,
    geonames_name_variants,
    geonames_title, 
    geonames_uri,
    lat, 
    lon,
    resource_id
  } = props.record;

  useEffect(() => {
    fetch(`http://api.geonames.org/searchJSON?q=${getToponym(caption)}&maxRows=10&username=pelagios`)
      .then(response => response.json())
      .then(data => {
        setAlternatives(data.geonames);
      });
  }, []);

  return (
    <div className="record-details">
      <header>
        <button onClick={props.onPrevious}>Prev</button>
        <button onClick={props.onNext}>Next</button>
        {props.idx} / {props.totals}
        <button onClick={props.onClose}>Close</button>
      </header>

      <main>
        <div className="place-info">
          <div className="record">
            <table>
              <tbody>
                <tr>
                  <td>ID</td><td>{resource_id}</td>
                </tr>
                <tr>
                  <td>Caption</td><td>{caption}</td>
                </tr>
                <tr>
                  <td>Country</td><td>{country}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="matched-to">
            <h3>Matched to</h3>
            <table>
              <tbody>
                <tr><td>{geonames_title} ({geonames_country})</td></tr>
                <tr>
                  <td>
                    <a href={geonames_uri} target="_blank">{geonames_uri}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    {geonames_name_variants}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="map">

          </div>
        </div>

        <div className="alternatives">
          <h3>Alternatives</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Country</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map(p => 
                <tr key={p.geonameId}>
                  <td>
                    <a href={`https://sws.geonames.org/place/${p.geonameId}`} target="_blank">
                      {p.geonameId}
                    </a>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.countryCode}</td>
                  <td>{p.fcodeName}</td>
                  <td>
                    <button>Select</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )

}

export default RecordDetails;