import React, { useEffect, useState } from 'react';
import RecordDetails from './RecordDetails';

import './CorrectionModal.css';

const CorrectionModal = props => {

  const [ currentSelected, setCurrentSelected ] = useState(0);

  useEffect(() => {
    const idx = Math.min(currentSelected, props.records.length - 1);
    setCurrentSelected(idx);
  }, [ props.records ]);

  const onPrevious = () => {
    const prevIdx = Math.max(0, currentSelected - 1);
    setCurrentSelected(prevIdx);
  }

  const onNext = () => {
    const nextIdx = Math.min(currentSelected + 1, props.records.length - 1);
    setCurrentSelected(nextIdx);
  }

  const onFixRecord = (previous, fixed) => {
    props.onFixRecord(previous, fixed);
    
    // Fixing a record will reduce the size of the array by one!
    if (currentSelected === props.records.length - 1)
      setCurrentSelected(Math.max(0, currentSelected - 1));
  }

  return (
    <div className="correction-modal">
      {props.records[currentSelected] &&
        <RecordDetails 
          record={props.records[currentSelected]} 
          totals={props.records.length}
          idx={currentSelected + 1}
          onPrevious={onPrevious} 
          onNext={onNext} 
          onFixRecord={onFixRecord}
          onClose={props.onClose} />
      }
    </div>
  )

}

export default CorrectionModal;