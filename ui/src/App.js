import React, { useState } from 'react';
import Papa from 'papaparse';

import GeoResolver from './GeoResolver';
import OverviewMap from './overview/OverviewMap';
import CorrectionModal from './correct/CorrectionModal';

import './App.css';

const App = () => {

  const [ progress, setProgress ] = useState();

  const [ result, setResult ] = useState();

  const [ selected, setSelected ] = useState([]);

  const onChangeFile = evt => {
    const file = evt.target.files[0];

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

  const onFixRecord = (previous, fixed) => {
    console.log(previous, fixed);
    
    setResult({
      ...result,
      resolved: result.resolved.map(row => row == previous ? fixed : row)
    }); 
  }

  return (
    <div className="app">
      <input type="file" onChange={onChangeFile} />

      {progress && <div className="progress">{progress.count}</div>}

      {result && 
        <OverviewMap 
          data={result.resolved} 
          onSelect={rows => setSelected(rows)} />
      }

      {result && <button onClick={onDownloadResult}>Download</button>}

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