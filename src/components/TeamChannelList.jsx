import React from 'react';

import { AddChannel } from '../assets';

const TeamChannelList = ({ setToggleContainer, children, error = false, loading, type, isCreating, setIsCreating, setCreateType, setIsEditing }) => {
    if(error) {
        return type === 'team' ? (
            <div className="team-channel-list">
                <p className="team-channel-list__message">
                    Eroare de conexiune, va rugam asteptati un moment si reincercati!
                </p>
            </div>
        ) : null
    }

    if(loading) {
        return (
            <div className="team-channel-list">
                <p className="team-channel-list__message loading">
                    {type === 'team' ? 'Channels' : 'Messages'} loading...
                </p>
            </div>
        )
    }

    return (
        <div className="team-channel-list">
            <div className="team-channel-list__header">
                <p className="team-channel-list__header__title">
                    {type === 'team' ? 'Canale de comunicare' : 'Mesaje directe'}
                </p>
                <AddChannel 
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType} 
                    setIsEditing={setIsEditing}
                    type={type === 'team' ? 'team' : 'messaging'}
                    setToggleContainer={setToggleContainer}
                />
            </div>
            {children}
        </div>
    )
}

export default TeamChannelList



