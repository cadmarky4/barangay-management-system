import { useNavigate } from 'react-router-dom';
import { BarangayOfficialForm } from './_components/BarangayOfficialForm';

const AddBarangayOfficial = () => {  // Loading and error states for API calls

  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/officials');
  }

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/officials');
    }, 1500)
  }

  return (
    <BarangayOfficialForm
      mode="create"
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default AddBarangayOfficial;