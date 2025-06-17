import {Routes, Route } from 'react-router-dom';
import HomeLogin from './components/HomeLogin';
import PatientList from './components/PatientList';
import DoctorDashboard from './components/DoctorDashboard';
import BillingDashboard from './components/BillingDashboard';
import SurgeryDashboard from './components/SurgeryDashboard';
import RegisterForm from './components/RegisterForm';
import RegisterPatient from './components/RegisterPatient';
import BookAppointment from './components/BookAppointment';
import Surgeries from './components/Surgeries';
import Medications from './components/Medications';  // <- Add this import

function App() {  
  return (
    
      <Routes>
        <Route path="/" element={<HomeLogin />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/surgeries/:id" element={<Surgeries />} />
        <Route path="/medications/:patientId/:apptId" element={<Medications />} />
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/surgery" element={<SurgeryDashboard />} />
        <Route path="/register/:role" element={<RegisterForm />} />
        <Route path="/register-patient" element={<RegisterPatient />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/book-appointment/:id" element={<BookAppointment />} />
      </Routes>
   
  );
}

export default App;
