import React, { useState } from 'react';
import Papa from 'papaparse';

import GeoResolver from './GeoResolver';

import './App.css';

const App = () => {

  const [ progress, setProgress ] = useState();

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
      resolver.on('complete', resolved => console.log(resolved));

      resolver.resolve(csv);
    };
  
    reader.readAsText(file);
  }

  return (
    <div className="App">
      <input type="file" onChange={onChangeFile} />

      {progress && <div className="progress">{progress.count}</div> }
    </div>
  );

}

export default App;
