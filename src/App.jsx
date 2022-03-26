import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import Cookies from 'universal-cookie';
import io from 'socket.io-client';
import { ChannelContainer, ChannelListContainer, Auth } from './components';
import VideoCall from './components/VideoCall/VideoCall';
import 'stream-chat-react/dist/css/index.css';
import './App.css';

const cookies = new Cookies();

const apiKey = 'gwxh5uxpp7z5';
const authToken = cookies.get('token');

const client = StreamChat.getInstance(apiKey);

let socket = io.connect('http://localhost:8080');

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
  const [callAccepted, setCallAccepted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    socket.on('me', async (id) => {
      if (authToken) {
        await client.partialUpdateUser({ id: cookies.get('userId'), set: { socketId: id } });
      }
    });
  }, []);

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
      <Chat client={client} theme='team light'>
        {isVideo ? (
          <VideoCall
            callAccepted={callAccepted}
            socket={socket}
            setCallAccepted={setCallAccepted}
            setIsVideo={setIsVideo}
          />
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
