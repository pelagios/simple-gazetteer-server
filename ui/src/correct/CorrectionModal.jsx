import React, { useState } from 'react';
import RecordDetails from './RecordDetails';

import './CorrectionModal.css';

const CorrectionModal = props => {

  const [ currentRecord, setCurrentRecord ] = useState(props.records[0]);

  const onPrevious = () => {
    const currentIdx = props.records.indexOf(currentRecord);
    const prevIdx = Math.max(0, currentIdx - 1);

    if (currentIdx !== prevIdx)
      setCurrentRecord(props.records[prevIdx]);
  }

  const onNext = () => {
    const currentIdx = props.records.indexOf(currentRecord);
    const nextIdx = Math.min(currentIdx + 1, props.records.length - 1);

    if (currentIdx !== nextIdx)
      setCurrentRecord(props.records[nextIdx]);
  }

  return (
    <div className="correction-modal">
      <RecordDetails 
        record={currentRecord} 
        totals={props.records.length}
        idx={props.records.indexOf(currentRecord) + 1}
        onPrevious={onPrevious} 
        onNext={onNext} 
        onClose={props.onClose} />
    </div>
  )

}

export default CorrectionModal;