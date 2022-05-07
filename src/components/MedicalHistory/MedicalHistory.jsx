import React, { useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-react';

const MedicalHistory = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectValue, setSelectValue] = useState(undefined);
  const { client } = useChatContext();

  const handleChange = (e) => {
    setSelectValue(e.target.value);
  };

  const handleClick = () => {
    if (selectValue) {
      const user = users.find((user) => user.name === selectValue);
      setSelectedUser(user);
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        if (client.user.isMedic === 'false') {
          setSelectedUser(client.user);
        } else if (client.user.isMedic === 'true') {
          const response = await client.queryUsers({ id: { $ne: client.userID } }, { id: 1 });
          if (response.users.length) {
            const users = response.users.filter((user) => user.isMedic === 'false');
            console.log(users);
            setUsers(users);
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };

    if (client) {
      getUsers();
    }
  }, [client]);

  return (
    <div className='history__container'>
      {client.user.isMedic === 'true' && (
        <>
          <select className='history__select' onChange={handleChange}>
            <option value='' disabled selected>
              Selectează pacient
            </option>
            {users.map((user) => (
              <option key={user.name} value={user.name}>
                {user.fullName}
              </option>
            ))}
          </select>
          <button className='history__button' onClick={() => handleClick()}>Verifică istoric</button>
        </>
      )}
      {selectedUser && (
        <div>
          {selectedUser.medicalHistory ? (
            <h3 className='history__header'>Istoricul medical pentru {selectedUser.fullName}:</h3>
          ) : (
            <h3 className='history__header'>Nu există istoric pentru {selectedUser.fullName}</h3>
          )}
          {(selectedUser.medicalHistory || []).map((item) => (
            <div className='history__token'>
              <p>Control realizat de {item.medicFullName}</p>
              <p>Diagnostic</p>
              <p>{item.diagnosis}</p>
              <p>Observații</p>
              <p>{item.observations}</p>
              <p>Tratament</p>
              <p>{item.treatment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
