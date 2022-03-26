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

  console.log('CalledUserId', calledUserId);

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

  socket.on('callDisconnected', (data) => {
    console.log('CallDisconnected', data.disconnectedId, calledUserId);
    if (data.disconnectedId === calledUserId) {
      endCall();
    }
  });

  const endCall = async () => {
    console.log('endcall');
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

  socket.on('callUser', (data) => {
    setReceivingCall(true);
    setCaller(data.from);
    setCalledUserId(data.from);
    setName(data.name);
    setCallerSignal(data.signal);
  });

  socket.on('callDisconnected', (data) => {
    console.log('CallDisconnected', data.disconnectedId, calledUserId);
    if (data.disconnectedId === calledUserId) {
      endCall();
    }
  });

  socket.on('callEnded', (data) => {
    console.log('CallEnded', data.callerId, calledUserId);
    if (connectionRef.current) {
      console.log('connection closed');
      connectionRef.current.destroy();
    }
    endCall();
  });

  const callUser = (id, name) => {
    console.log('call');
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
    console.log('answer');
    // setCalledUserId(caller);
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
    console.log('leaveCall');
    endCall();
  };

  return (
    <>
      {receivingCall && !callAccepted && <AnswerCallModal name={name} answerCall={answerCall} />}
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
          {!callAccepted && (
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
        </div>
      </div>
    </>
  );
};

export default VideoCall;
