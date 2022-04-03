import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import VideoCallProvider from './contexts/VideoCallContext';

ReactDOM.render(
  <VideoCallProvider>
    <App />
  </VideoCallProvider>,
  document.getElementById('root')
);
