import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResidentForm } from './_components/ResidentForm';

const EditResident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const residentId = id as string;

  const handleClose = () => {
    // You might want to show a confirmation dialog if form has unsaved changes
    navigate('/residents');
  };

  const handleSuccess = () => {
    // Navigate with a success state that can be used to show notifications
    setTimeout(() => {
      navigate('/residents', { 
        state: { 
          message: 'Resident successfully updated!',
          type: 'success' 
        }
      });
    }, 1500);
  };

  if (!residentId) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Resident ID</h1>
        <p className="text-gray-600 mt-2">
          The resident ID provided in the URL is not valid.
        </p>
        <button
          onClick={handleClose}
          className="mt-4 px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
        >
          Back to Residents
        </button>
      </div>
    );
  }

  return (
    <ResidentForm
      mode="edit"
      residentId={residentId}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default EditResident;