import { useParams } from 'react-router-dom';

const Surgeries = () => {
  const { id } = useParams();
  return <h2>Surgeries for Appointment #{id}</h2>;
};

export default Surgeries;
