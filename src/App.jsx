import React, { useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import Cookies from 'universal-cookie';
import { ChannelContainer, ChannelListContainer, Auth } from './components';
import VideoCall from './components/VideoCall/VideoCall';
import 'stream-chat-react/dist/css/index.css';
import './App.css';
import { VideoCallContext } from './contexts/VideoCallContext';
import AnswerCallModal from './components/AnswerCallModal/AnswerCallModal';

const cookies = new Cookies();

const apiKey = 'gwxh5uxpp7z5';
const authToken = cookies.get('token');

const client = StreamChat.getInstance(apiKey);

if (authToken && !client.user) {
  client.connectUser(
    {
      id: cookies.get('userId'),
      name: cookies.get('username'),
      fullName: cookies.get('fullName'),
      image: cookies.get('avatarURL'),
      hashedPassword: cookies.get('hashedPassword'),
      phoneNumber: cookies.get('phoneNumber'),
    },
    authToken
  );
}

const App = () => {
  const [createType, setCreateType] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isVideo, setIsVideo, receivingCall, callAccepted, name, answerCall, declineCall, socket } =
    useContext(VideoCallContext);

  useEffect(() => {
    if (socket)
      socket.on('me', async (id) => {
        if (authToken) {
          await client.partialUpdateUser({ id: cookies.get('userId'), set: { socketId: id } });
        }
      });
  }, [socket]);

  useEffect(() => {
    (async () => {
      if (authToken) {
        await client.connectUser(
          {
            id: cookies.get('userId'),
            name: cookies.get('username'),
            fullName: cookies.get('fullName'),
            image: cookies.get('avatarURL'),
            hashedPassword: cookies.get('hashedPassword'),
            phoneNumber: cookies.get('phoneNumber'),
          },
          authToken
        );
      }
    })();
  }, []);

  if (!authToken) return <Auth />;

  return (
    <div className='app__wrapper'>
      {receivingCall && !callAccepted && (
        <AnswerCallModal
          name={name}
          answerCall={() => {
            setIsVideo(true);
            answerCall();
          }}
          declineCall={declineCall}
        />
      )}
      <Chat client={client} theme='team light'>
        {isVideo ? (
          <VideoCall socket={socket} setIsVideo={setIsVideo} />
        ) : (
          <>
            <ChannelListContainer
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              setCreateType={setCreateType}
              setIsEditing={setIsEditing}
              setIsVideo={setIsVideo}
            />
            <ChannelContainer
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              createType={createType}
            />
          </>
        )}
      </Chat>
    </div>
  );
};

export default App;
