import React, { useEffect, useRef, useState } from 'react';
import { Avatar, useChatContext } from 'stream-chat-react';
import Peer from 'simple-peer';
import AnswerCallModal from '../AnswerCallModal/AnswerCallModal';

const VideoCall = ({ socket, callAccepted, setCallAccepted, setIsVideo }) => {
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState();
  const [callEnded, setCallEnded] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [name, setName] = useState('');
  const [receivingCall, setReceivingCall] = useState(false);
  const [calledUserId, setCalledUserId] = useState(undefined);
  const [calledUserName, setCalledUserName] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const { client } = useChatContext();
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.queryUsers({ id: { $ne: client.userID } }, { id: 1 });
        if (response.users.length) {
          const users = response.users.filter((user) => user.online).filter((user) => user.socketId);
          setUsers(users);
        }
      } catch (err) {
        console.warn(err);
      }
    };

    if (client) getUsers();
  }, [client]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });
  }, []);

  socket.on('callUser', (data) => {
    setReceivingCall(true);
    setCaller(data.from);
    setCalledUserId(data.from);
    setName(data.name);
    setCallerSignal(data.signal);
  });

  socket.on('callDisconnected', (data) => {
    if (data.disconnectedId === calledUserId) {
      endCall();
    }
  });

  socket.on('callEnded', (data) => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    endCall();
  });

  socket.on('declineCall', (data) => {
    setCalledUserId(undefined);
    setCalledUserName('');
    connectionRef.current.destroy();
  });

  const endCall = async () => {
    try {
      myVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      setCalledUserId(undefined);
      setCallEnded(true);
      setReceivingCall(false);
      setCallAccepted(false);
      setIsVideo(false);
    } catch (err) {
      console.warn(err);
    }
  };

  const callUser = (id, name) => {
    setCalledUserId(id);
    setCalledUserName(name);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: client.user.socketId,
        name: client.user.fullName,
      });
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', (signal) => {
      if (peer) {
        setCallAccepted(true);
        try {
          peer.signal(signal);
        } catch (err) {
          console.warn(err);
        }
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });
    try {
      peer.signal(callerSignal);
    } catch (err) {
      console.warn(err);
    }
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    socket.emit('endCall', { to: calledUserId });
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    endCall();
  };

  const declineCall = () => {
    socket.emit('declineCall', { to: calledUserId });
    setCalledUserId(undefined);
    setReceivingCall(false);
    setCallAccepted(false);
    setReceivingCall(false);
    setCaller(undefined);
    setName('');
    setCallerSignal(undefined);
  };

  const goBack = () => {
    try {
      myVideo.current.srcObject.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.warn(err);
    } finally {
      setIsVideo(false);
    }
  };

  return (
    <>
      {receivingCall && !callAccepted && (
        <AnswerCallModal name={name} answerCall={answerCall} declineCall={declineCall} />
      )}
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
        <div style={{ display: 'flex', width: '100%', height: '80vh' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '50%', padding: '2rem' }}>
            {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: '30rem' }} />}
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '50%', padding: '2rem', alignItems: 'center' }}
          >
            {calledUserId && !callAccepted && !receivingCall && <p>Sunați pe {calledUserName}</p>}
            {callAccepted && !callEnded && <video playsInline ref={userVideo} autoPlay style={{ width: '30rem' }} />}
          </div>
        </div>
        <div style={{ padding: '1rem' }}>
          {!callAccepted && !calledUserId && (
            <>
              <h3>Pe cine ați vrea să sunați?</h3>
              <div style={{ display: 'flex' }}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className='user-item__wrapper'
                    style={{ padding: '0 0.5rem' }}
                    onClick={() => callUser(user.socketId, user.fullName)}
                  >
                    <div className='user-item__name-wrapper'>
                      <Avatar image={user.image} name={user.fullName || user.id} size={32} />
                      <p className='user-item__name'>{user.fullName || user.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {callAccepted && !callEnded && <button onClick={() => leaveCall()}>Închideți apel</button>}
          {(!callAccepted || !calledUserId) && <button onClick={() => goBack()}>Înapoi</button>}
        </div>
      </div>
    </>
  );
};

export default VideoCall;
