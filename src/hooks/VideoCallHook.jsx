import { useRef, useState } from 'react';

const useVideoCall = () => {
  const [callEnded, setCallEnded] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [name, setName] = useState('');
  const [receivingCall, setReceivingCall] = useState(false);
  const [calledUserId, setCalledUserId] = useState(undefined);
  const [calledUserName, setCalledUserName] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState();
  const [myName, setMyName] = useState('');
  const [mySocketId, setMySocketId] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const connectionRef = useRef(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);

  return {
    isVideo,
    setIsVideo,
    callEnded,
    setCallEnded,
    caller,
    setCaller,
    callerSignal,
    setCallerSignal,
    name,
    setName,
    receivingCall,
    setReceivingCall,
    calledUserId,
    setCalledUserId,
    calledUserName,
    setCalledUserName,
    callAccepted,
    setCallAccepted,
    stream,
    setStream,
    myName,
    setMyName,
    mySocketId,
    setMySocketId,
    connectionRef,
    myVideo,
    userVideo,
  };
};

export default useVideoCall;
