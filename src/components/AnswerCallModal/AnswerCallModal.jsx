import React from 'react';
import './AnswerCallModal.css';

const AnswerCallModal = ({ name, answerCall, declineCall }) => {
  return (
    <div className='modal'>
      <div className='modal-content'>
        <h3>Vă suna {name}</h3>
        <div>
          <button onClick={() => answerCall()}>Răspunde</button>
          <button onClick={() => declineCall()}>Închideți</button>
        </div>
      </div>
    </div>
  );
};

export default AnswerCallModal;
