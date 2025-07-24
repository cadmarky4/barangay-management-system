import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResidentForm } from './_components/ResidentForm';

const AddResident: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // You might want to show a confirmation dialog if form has unsaved changes
    navigate('/residents');
  };

  const handleSuccess = () => {
    // Navigate with a success state that can be used to show notifications
    setTimeout(() => {
      navigate('/residents', { 
        state: { 
          message: 'Resident successfully created!',
          type: 'success' 
        }
      });
    }, 1500);
  };

  return (
    <ResidentForm
      mode="create"
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default AddResident;