import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';
import { IoMdClose, IoMdSearch } from 'react-icons/io';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const getToponym = caption =>
  caption.split('-')[0].trim();

const RecordDetails = props => {

  const [ map, setMap ] = useState();

  const caption = props.record.Caption;
  const resource_id = props.record['Resource ID(s)'];
  const country = props.record.Country;

  const { 
    geonames_country,
    geonames_name_variants,
    geonames_title, 
    geonames_uri,
    latitude, 
    longitude,
  } = props.record;

  const position = (latitude && longitude) ? [ latitude, longitude ] : [0 , 0];

  const [ alternatives, setAlternatives ] = useState([]);

  const [ query, setQuery ] = useState(getToponym(caption));

  useEffect(() => {
    let q = query;

    fetch(`http://api.geonames.org/searchJSON?name=${query}&maxRows=20&fuzzy=0.7&username=pelagios`)
      .then(response => response.json())
      .then(data => {
        if (q === query)
          setAlternatives(data.geonames);
      });
  }, [ query ]);

  useEffect(() => {
    setQuery(getToponym(caption));
    setAlternatives([]);

    if (map)
      map.panTo(position);
  }, [ props.record ]);

  const onSelectAlternative = alternative => () => {
    props.onFixRecord(props.record, {
      ...props.record,
      geonames_country: alternative.countryCode,
      geonames_name_variants: [], // TODO!
      geonames_title: alternative.name,
      geonames_uri: `http://sws.geonames.org/${alternative.geonameId}`,
      latitude: alternative.lat && parseFloat(alternative.lat),
      longitude: alternative.lng && parseFloat(alternative.lng)
    })
  }


  return (
    <div className="record-details-wrapper">
      <div className="mini-map">
        <MapContainer
          whenCreated={setMap}
          center={position} 
          zoom={8}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />

          <Marker position={position} />
        </MapContainer>
      </div>
      <div className="record-details">
        <header className="noselect">
          <div className="nav">
            <BsArrowLeftShort onClick={props.onPrevious} />
            <BsArrowRightShort onClick={props.onNext}/>
          </div>

          {props.idx} / {props.totals}
          
          <div className="nav">
            <IoMdClose onClick={props.onClose} />
          </div>
        </header>

        <div className="section place-info">
          <div className="record">
            <h3>Record</h3>
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
                <tr>
                  <td>GeoNames</td>
                  <td>{geonames_title} { geonames_country && <span>({geonames_country})</span> }</td>
                </tr>
                <tr>
                  <td>
                    Name
                  </td>
                  <td>
                    <a href={geonames_uri} target="_blank">{geonames_uri}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    Variants
                  </td>
                  <td>
                    {geonames_name_variants}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section alternatives">
          <div className="search">
            <h3>Alternatives</h3>
            <div>
              <input 
                type="text" 
                value={query}
                onChange={evt => setQuery(evt.target.value)} />
              <IoMdSearch />
            </div>
          </div>
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
                    <a href={`https://sws.geonames.org/${p.geonameId}`} target="_blank">
                      {p.geonameId}
                    </a>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.countryName}</td>
                  <td>{p.fcodeName}</td>
                  <td>
                    <button onClick={onSelectAlternative(p)}>Select</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}

export default RecordDetails;