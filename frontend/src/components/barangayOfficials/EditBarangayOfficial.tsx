import { useNavigate, useParams } from "react-router-dom";
import { BarangayOfficialForm } from "./_components/BarangayOfficialForm";

const EditBarangayOfficial = () => {  // Loading and error states for API calls
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/officials');
  }

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/officials');
    }, 1500)
  }

  if (!id) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Barangay Official ID</h1>
        <button
          onClick={handleClose}
          className="mt-4 px-6 py-2 bg-smblue-400 text-white rounded-lg"
        >
          Back to Officials
        </button>
      </div>
    );
  }

  return (
    <BarangayOfficialForm
      mode="edit"
      barangayOfficialId={id}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default EditBarangayOfficial;