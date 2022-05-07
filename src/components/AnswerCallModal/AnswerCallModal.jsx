import React from 'react';


const AnswerCallModal = ({ name, answerCall, declineCall }) => {
  return (
    <div className='modal'>
      <div className='modal-content'>
        <h3>Vă suna {name}</h3>
        <div>
          <button  className='button__answer__call' onClick={() => answerCall()}>Răspunde</button>
          <button className='button__decline__call' onClick={() => declineCall()}>Închideți</button>
        </div>
      </div>
    </div>
  );
};

export default AnswerCallModal;
