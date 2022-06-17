import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useChatContext } from 'stream-chat-react';
import Cookies from 'universal-cookie';
import { jsPDF } from 'jspdf';
import './PrescriptionForm.css';

const cookies = new Cookies();

const PrescriptionForm = () => {
  const [users, setUsers] = useState([]);
  const { client } = useChatContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const [name, fullName] = data.pacientName.split(',');

    const doc = new jsPDF();
    const docWidth = doc.internal.pageSize.getWidth();

    doc.text(`Reteta ${fullName}`, docWidth / 2, 20, { align: 'center' });
    doc.text(`Medic ${client.user.fullName}`, docWidth / 2, 30, { align: 'center' });
    doc.text('Diagnostic', 20, 40);
    doc.text(data.diagnosis, 20, 50);

    doc.text('Observatii', 20, 60);
    const splitObservations = doc.splitTextToSize(data.observations, 170);
    doc.text(splitObservations, 20, 70);

    doc.text('Tratament', 20, 120);
    const splitTreatment = doc.splitTextToSize(data.treatment, 170);
    doc.text(splitTreatment, 20, 130);

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    doc.text(`Data: ${day}/${month}/${year}`, 20, 180);

    doc.save(`Reteta ${fullName}, ${day}/${month}/${year}.pdf`);

    if (cookies.get('token')) {
      const patient = users.find((user) => user.name === name);
      console.log('Patient', patient);
      const medicalHistory = patient.medicalHistory || [];
      try {
        await client.partialUpdateUser({
          id: patient.id,
          set: {
            medicalHistory: [
              ...medicalHistory,
              {
                date: `${day}/${month}/${year}`,
                medicFullName: client.user.fullName,
                medicName: client.user.name,
                diagnosis: data.diagnosis,
                observations: data.observations,
                treatment: data.treatment,
              },
            ],
          },
        });
        reset();
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await client.queryUsers({ id: { $ne: client.userID } }, { id: 1 });
        if (response.users.length) {
          const users = response.users.filter((user) => user.isMedic === 'false');
          setUsers(users);
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
    <div className='prescription__container'>
      <h3 className='prescription__header'>Scrieți un raport medical</h3>
      <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className='prescription__form-label'>Nume Pacient</label>
          <select className='prescription__form-input' placeholder='George Popescu' {...register('pacientName', { required: true })}>
            <option value='' disabled selected>
              Selectează pacient
            </option>
            {users.map((user) => (
              <option key={user.name} value={[user.name, user.fullName]}>
                {user.fullName}
              </option>
            ))}
          </select>
          {errors.pacientName && <p className='prescription__form-error'>Selectați un pacient</p>}

          <label className='prescription__form-label'>Diagnostic</label>
          <input className='prescription__form-input' {...register('diagnosis', { required: true })}></input>
          {errors.diagnosis && <p className='prescription__form-error'>Introduceți diagnosticul</p>}

          <label className='prescription__form-label'>Observații</label>
          <textarea className='prescription__form-input' rows='5' {...register('observations', { required: true })}></textarea>
          {errors.observations && <p className='prescription__form-error'>Introduceți observațiile</p>}

          <label className='prescription__form-label'>Tratament</label>
          <textarea className='prescription__form-input' rows='5' {...register('treatment', { required: true })}></textarea>
          {errors.treatment && <p className='prescription__form-error'>Introduceți tratamentul</p>}

          <button className='prescription__button' type='submit'>Creează raport medical și tipărește rețetă</button>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
