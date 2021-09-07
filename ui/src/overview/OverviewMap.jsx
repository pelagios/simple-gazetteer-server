import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

/** Helper: groups the array of rows by the given field **/
const groupBy = (rows, property) => {
  const grouped = {};

  rows.forEach(row => {
    const key = row[property];

    if (key) { // Discard undefined
      const existing = grouped[key];

      if (existing) {
        existing.push(row);
      } else {
        grouped[key] = [ row ];
      }
    }
  });

  return grouped;
}

const getBounds = markers => {
  let minLat = Infinity;
  let minLon = Infinity;
  
  let maxLat = -Infinity;
  let maxLon = -Infinity;

  markers.forEach(marker => {
    const [lat, lon] = marker.props.position;
    
    if (lat < minLat)
      minLat = lat;

    if (lat > maxLat)
      maxLat = lat;

    if (lon < minLon)
      minLon = lon;

    if (lon > maxLon)
      maxLon = lon;
  });

  return [
    [minLat, minLon],
    [maxLat, maxLon]
  ]
}

const OverviewMap = props => {

  // Get all distinct places from props.data
  const grouped = groupBy(props.data, 'geonames_uri');
  const distinctURIs = Object.keys(grouped);

  // Create markers
  const markers = distinctURIs.map(uri => {
    const rows = grouped[uri];
    const { caption, country, geonames_title, geonames_country, geonames_uri, latitude, longitude } = rows[0];
    const recordLabel = [caption, country].filter(str => str).join(', ');
    const mappedLabel = [geonames_title, geonames_country].filter(str => str).join(', ');

    return (
      <Marker key={uri} position={[latitude, longitude]}>
        <Popup>
          <h1>{recordLabel}</h1>
          <h2>
            Resolved to: <a href={geonames_uri} target="_blank">{mappedLabel}</a>
          </h2>
          {rows.length > 1 &&
            <p>
              {rows.length - 1} more record(s)
            </p>
          }
          <button className="primary" onClick={() => props.onSelect(rows)}>
            Fix georesolution
          </button>
        </Popup>
      </Marker>
    )
  });

  const bounds = getBounds(markers);

  return (
    <div className="overview-map">
      <MapContainer bounds={bounds}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />
        
        {markers}
      </MapContainer>
    </div>
  )

}

export default OverviewMap;