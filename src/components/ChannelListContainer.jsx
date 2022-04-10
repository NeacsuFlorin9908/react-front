import React, { useState } from 'react';
import { ChannelList, useChatContext } from 'stream-chat-react';
import Cookies from 'universal-cookie';

import { ChannelSearch, TeamChannelList, TeamChannelPreview } from './';
import HospitalIcon from '../assets/hospital.png';
import LogoutIcon from '../assets/logout.png';
import VideoCallIcon from '../assets/call.png';
import PrescriptionForm from './PrescriptionForm/PrescriptionForm';
import MedicalHistory from './MedicalHistory/MedicalHistory';

const cookies = new Cookies();

const SideBar = ({ logout, setIsVideo, setIsPrescription, setIsHistory }) => {
  const { client } = useChatContext();
  console.log('isMedic', client.user.isMedic);
  return (
    <div className='channel-list__sidebar'>
      <div className='channel-list__sidebar__icon2'>
        <div
          className='icon1__inner'
          onClick={() => {
            setIsVideo(false);
            setIsPrescription(false);
            setIsHistory(false);
          }}
        >
          <img src={HospitalIcon} alt='Hospital' width='30' />
        </div>
      </div>
      <div className='channel-list__sidebar__icon2'>
        <div
          className='icon1__inner'
          onClick={() => {
            setIsHistory(false);
            setIsPrescription(false);
            setIsVideo(true);
          }}
        >
          <img src={VideoCallIcon} alt='Logout' width='30' />
        </div>
      </div>
      {client.user.isMedic === 'true' && (
        <div className='channel-list__sidebar__icon2'>
          <div
            className='icon1__inner'
            onClick={() => {
              setIsHistory(false);
              setIsVideo(false);
              setIsPrescription(true);
            }}
          >
            Reteta
          </div>
        </div>
      )}
      <div className='channel-list__sidebar__icon2'>
        <div
          className='icon1__inner'
          onClick={() => {
            setIsPrescription(false);
            setIsVideo(false);
            setIsHistory(true);
          }}
        >
          Istoric
        </div>
      </div>
      <div className='channel-list__sidebar__icon2'>
        <div className='icon1__inner' onClick={logout}>
          <img src={LogoutIcon} alt='Logout' width='30' />
        </div>
      </div>
    </div>
  );
};

const CompanyHeader = () => (
  <div className='channel-list__header'>
    <p className='channel-list__header__text'>Med Cloud</p>
  </div>
);

const customChannelTeamFilter = (channels) => {
  return channels.filter((channel) => channel.type === 'team');
};

const customChannelMessagingFilter = (channels) => {
  return channels.filter((channel) => channel.type === 'messaging');
};

const ChannelListContent = ({
  isCreating,
  setIsCreating,
  setCreateType,
  setIsEditing,
  setToggleContainer,
  setIsVideo,
  isPrescription,
  setIsPrescription,
  isHistory,
  setIsHistory,
}) => {
  const { client } = useChatContext();

  const logout = () => {
    cookies.remove('token');
    cookies.remove('userId');
    cookies.remove('username');
    cookies.remove('fullName');
    cookies.remove('avatarURL');
    cookies.remove('hashedPassword');
    cookies.remove('phoneNumber');

    window.location.reload();
  };

  const filters = { members: { $in: [client.userID] } };
  console.log(isPrescription);
  return (
    <>
      <SideBar
        logout={logout}
        setIsVideo={setIsVideo}
        setIsPrescription={setIsPrescription}
        setIsHistory={setIsHistory}
      />
      {isPrescription ? (
        <PrescriptionForm setIsPrescription={setIsPrescription} />
      ) : isHistory ? (
        <MedicalHistory setIsHistory={setIsHistory} />
      ) : (
        <div className='channel-list__list__wrapper'>
          <CompanyHeader />
          <ChannelSearch setToggleContainer={setToggleContainer} />
          <ChannelList
            filters={filters}
            channelRenderFilterFn={customChannelTeamFilter}
            List={(listProps) => (
              <TeamChannelList
                {...listProps}
                type='team'
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                setCreateType={setCreateType}
                setIsEditing={setIsEditing}
                setToggleContainer={setToggleContainer}
              />
            )}
            Preview={(previewProps) => (
              <TeamChannelPreview
                {...previewProps}
                setIsCreating={setIsCreating}
                setIsEditing={setIsEditing}
                setToggleContainer={setToggleContainer}
                type='team'
              />
            )}
          />
          <ChannelList
            filters={filters}
            channelRenderFilterFn={customChannelMessagingFilter}
            List={(listProps) => (
              <TeamChannelList
                {...listProps}
                type='messaging'
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                setCreateType={setCreateType}
                setIsEditing={setIsEditing}
                setToggleContainer={setToggleContainer}
              />
            )}
            Preview={(previewProps) => (
              <TeamChannelPreview
                {...previewProps}
                setIsCreating={setIsCreating}
                setIsEditing={setIsEditing}
                setToggleContainer={setToggleContainer}
                type='messaging'
              />
            )}
          />
        </div>
      )}
    </>
  );
};

const ChannelListContainer = ({
  setCreateType,
  setIsCreating,
  setIsEditing,
  setIsVideo,
  isPrescription,
  setIsPrescription,
  isHistory,
  setIsHistory,
}) => {
  const [toggleContainer, setToggleContainer] = useState(false);

  return (
    <>
      <div className={isPrescription ? 'channel-list__list__wrapper-width' : 'channel-list__container'}>
        <ChannelListContent
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
          setIsVideo={setIsVideo}
          isPrescription={isPrescription}
          setIsPrescription={setIsPrescription}
          isHistory={isHistory}
          setIsHistory={setIsHistory}
        />
      </div>

      <div
        className='channel-list__container-responsive'
        style={{ left: toggleContainer ? '0%' : '-89%', backgroundColor: '#107CF1' }}
      >
        <div
          className='channel-list__container-toggle'
          onClick={() => setToggleContainer((prevToggleContainer) => !prevToggleContainer)}
        ></div>
        <ChannelListContent
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
          setToggleContainer={setToggleContainer}
          setIsPrescription={setIsPrescription}
        />
      </div>
    </>
  );
};

export default ChannelListContainer;
