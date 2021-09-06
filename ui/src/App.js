import React, { useState } from 'react';
import { BsUpload, BsDownload } from 'react-icons/bs';
import Papa from 'papaparse';

import GeoResolver from './GeoResolver';
import OverviewMap from './overview/OverviewMap';
import CorrectionModal from './correct/CorrectionModal';

import './App.css';

const App = () => {

  const [ filename, setFilename ] = useState();

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

      csv.data = csv.data.filter(row => row.resource_id); // Filter empty

      const resolver = new GeoResolver();
      resolver.on('progress', setProgress);
      resolver.on('complete', resolved => setResult(resolved));

      resolver.resolve(csv);
    };
  
    reader.readAsText(file);
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

  const onFixRecord = (previous, fixed) =>
    setResult({
      ...result,
      resolved: result.resolved.map(row => row == previous ? fixed : row)
    }); 

  return (
    <div className="app">
      <div className="step upload">
        <h2>1. Upload CSV</h2>
        <button className="primary">
          <BsUpload /> { filename || 'Select File' }
          <input type="file" className="csv-upload" onChange={onChangeFile} />
        </button>
      </div>

      {progress &&
        <div className="step geocoding"> 
          <h2>2. Geocoding</h2>
          <progress max={progress.total} value={progress.count}>{progress.percent.toFixed(2)}%</progress>
          <div className="progress">
            {progress.count}/{progress.total} Rows
          </div>
        </div>
      }

      {result && 
        <div className="step results">
          <h2>3. Results</h2>
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

      {selected.length > 0 &&
        <CorrectionModal 
          records={selected} 
          onFixRecord={onFixRecord}
          onClose={() => setSelected([])}/>
      }
    </div>
  );

}

export default App;