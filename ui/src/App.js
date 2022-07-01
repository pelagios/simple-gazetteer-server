import React, { useState } from 'react';
import { BsUpload, BsDownload } from 'react-icons/bs';
import Papa from 'papaparse';

import GeoResolver from './GeoResolver';
import OverviewMap from './overview/OverviewMap';
import CorrectionModal from './correct/CorrectionModal';

import './App.css';

const getToponym = caption =>
  caption.split('-')[0].trim();

const App = () => {

  const [ filename, setFilename ] = useState();

  const [ csv, setCsv ] = useState();

  const [ columns, setColumns ] = useState([]);

  const [ toponymCol, setToponymCol ] = useState();

  const [ countryCol, setCountryCol ] = useState();

  const [ progress, setProgress ] = useState();

  const [ result, setResult ] = useState();

  const [ selected, setSelected ] = useState([]);

  const onChangeFile = evt => {
    const file = evt.target.files[0];

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const csv = Papa.parse(event.target.result, {
        header: true
      });

      setColumns(csv.meta.fields);
      setCsv(csv);
    };
  
    reader.readAsText(file);
  }

  const startGeocoding = () => {
    const resolver = new GeoResolver(toponymCol, countryCol);

    resolver.on('progress', setProgress);
    resolver.on('complete', resolved => setResult(resolved));

    resolver.resolve(csv);
  }

  const onDownloadResult = () => {
    const csv = Papa.unparse(result.resolved);

    const a = document.createElement('a');  
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
    a.target = '_blank';  
      
    a.download = 'resolved.csv';  
    a.click();
  }
  
  const unresolved = result?.resolved.filter(row => !row.geonames_uri);

  const onFixRecord = (previous, fixed) => {
    const fixedToponym = getToponym(fixed.Caption);

    // Update results
    const updatedResult = result.resolved.map(row => { 
      if (row == previous) {
        // Fix this record
        return fixed;
      } else {
        // Bulk-fix all with same toponym
        const toponym = getToponym(row.Caption);

        if (toponym === fixedToponym) {
          return {
            ...row,
            geonames_country: fixed.geonames_country,
            geonames_name_variants: fixed.geonames_name_variants,
            geonames_title: fixed.geonames_title,
            geonames_uri: fixed.geonames_uri,
            latitude: fixed.latitude,
            longitude: fixed.longitude
          }
        } else {
          return row;
        }
      }
    });

    setResult({
      ...result,
      resolved: updatedResult
    });

    // Remove from selection
    const updatedSelection = selected.filter(row => row !== previous);    
    setSelected(updatedSelection);
  }

  return (
    <>
      <div className="app">
        <div className="step upload">
          <h2>1. Upload CSV</h2>
          <button className="primary">
            <BsUpload /> { filename || 'Select File' }
            <input type="file" className="csv-upload" onChange={onChangeFile} />
          </button>
        </div>

        {columns.length > 0 &&
          <div className="step pick-columns">
            <h2>2. Select Columns</h2>
            <div className="column-choice">
              <label htmlFor="toponym-column">Placename</label>
              <select 
                id="toponym-column"
                defaultValue
                value={toponymCol}
                onChange={evt => setToponymCol(evt.target.value)}>
              
                <option disabled value> -- required -- </option>
                {columns.map(column=> 
                  <option key={column} value={column}>{column}</option>
                )}
              </select>
            </div>

            <div className="column-choice">
              <label htmlFor="country-column">Country</label>
              <select 
                id="country-column" 
                defaultValue
                value={countryCol}
                onChange={evt => setCountryCol(evt.target.value)}>

                <option value> -- optional -- </option>
                {columns.map(column =>
                  <option key={column} value={column}>{column}</option>
                )}
              </select>
            </div>

            <button
              disabled={!toponymCol}
              className="primary"
              onClick={startGeocoding}>Geocode</button>
          </div>
        }

        {progress &&
          <div className="step geocoding"> 
            <h2>3. Geocoding</h2>
            <progress max={progress.total} value={progress.count}>{progress.percent.toFixed(2)}%</progress>
            <div className="progress">
              {progress.count}/{progress.total} Rows
            </div>
          </div>
        }

        {result && 
          <div className="step results">
            <h2>4. Results</h2>
            <table>
              <tbody>
                <tr>
                  <td>Resolved:</td>
                  <td>{result.successful - unresolved.length}</td>
                  <td></td>
                </tr>

                <tr>
                  <td>Unresolved:</td>
                  <td>{unresolved.length}</td>
                  <td>
                    <button onClick={() => setSelected(unresolved)}>Fix</button>
                  </td>
                </tr>

                <tr>
                  <td>Errors:</td>
                  <td>{result.errors}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <button className="primary" onClick={onDownloadResult}>
              <BsDownload /> Download Result CSV
            </button>
          </div>
        }

        {result && 
          <OverviewMap 
            data={result.resolved} 
            onSelect={rows => setSelected(rows)} />
        }
      </div>

      {selected.length > 0 &&
        <CorrectionModal 
          records={selected} 
          onFixRecord={onFixRecord}
          onClose={() => setSelected([])}/>
      }
    </>
  );

}

export default App;