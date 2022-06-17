import { createContext, useState } from 'react';
import { io } from 'socket.io-client';
import useVideoCall from '../hooks/VideoCallHook';
import Peer from 'simple-peer';

export const VideoCallContext = createContext();

const VideoCallProvider = ({ children }) => {
  const video = useVideoCall();
  const [socket] = useState(io.connect('https://licenta-med-cloud.herokuapp.com/'));
  socket.on('connect', () => {
    console.log(socket.id);
  });

  socket.on('callUser', (data) => {
    video.setIsVideo(true);
    video.setReceivingCall(true);
    video.setCaller(data.from);
    video.setCalledUserId(data.from);
    video.setName(data.name);
    video.setCallerSignal(data.signal);
  });

  const callUser = (id, name) => {
    video.setCalledUserId(id);
    video.setCalledUserName(name);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: video.stream,
    });
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: video.mySocketId,
        name: video.myName,
      });
    });
    peer.on('stream', (stream) => {
      video.userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', (signal) => {
      if (peer) {
        video.setCallAccepted(true);
        try {
          peer.signal(signal);
        } catch (err) {
          console.warn(err);
        }
      }
    });

    video.connectionRef.current = peer;
  };

  const answerCall = () => {
    video.setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: video.stream,
    });
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: video.caller });
    });
    peer.on('stream', (stream) => {
      video.userVideo.current.srcObject = stream;
    });
    try {
      peer.signal(video.callerSignal);
    } catch (err) {
      console.warn(err);
    }
    video.connectionRef.current = peer;
  };

  const declineCall = () => {
    socket.emit('declineCall', { to: video.calledUserId });
    video.setCalledUserId(undefined);
    video.setReceivingCall(false);
    video.setCallAccepted(false);
    video.setReceivingCall(false);
    video.setCaller(undefined);
    video.setName('');
    video.setCallerSignal(undefined);
  };

  return (
    <VideoCallContext.Provider value={{ ...video, socket, answerCall, declineCall, callUser }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
