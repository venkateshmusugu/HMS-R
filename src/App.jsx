import { Routes, Route } from 'react-router-dom';
import HomeLogin from './components/HomeLogin';

// Patient & Registration
import RegisterForm from './components/RegisterForm';
import RegisterPatient from './components/RegisterPatient';
import PatientList from './components/PatientList';

// Doctor & Appointment
import DoctorDashboard from './components/DoctorDashboard';
import BookAppointment from './components/BookAppointment';
import Medications from './components/Medications';

// Surgery
import SurgeryDashboard from './components/SurgeryDashboard';
import BookSurgery from './components/BookSurgery';
import EditSurgery from './components/EditSurgery';
import SurgeryMedication from './components/SurgeryMedication';
import ViewSurgeryHistory from './components/ViewSurgeryHistory';




// Billing
import BillingDashboard from './components/BillingDashboard';
import AddMedicineBill from './components/AddMedicalBill.jsx';
import ViewBillsByMobile from './components/ViewBillByMobile.jsx';


function App() {
  return (
    <Routes>
      {/* Auth / Landing */}
      <Route path="/" element={<HomeLogin />} />

      {/* Registration */}
      <Route path="/register/:role" element={<RegisterForm />} />
      <Route path="/register" element={<RegisterPatient />} />
      <Route path="/register-patient" element={<RegisterPatient />} />
      <Route path="/patients" element={<PatientList />} />

      {/* Doctor */}
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/book-appointment/:id" element={<BookAppointment />} />
      <Route path="/medications/:patientId/:apptId" element={<Medications />} />
     
      {/* Surgery */}
      <Route path="/surgery" element={<SurgeryDashboard />} />
      <Route path="/book-surgery" element={<BookSurgery />} />
      <Route path="/edit-surgery/:id" element={<EditSurgery />} />
      <Route path="/surgery-medication/:patientId/:surgeryId" element={<SurgeryMedication />} />
      <Route path="/surgery-history/:patientId" element={<ViewSurgeryHistory />} />

     

      {/* Medical Billing */}
      <Route path="/billing" element={<BillingDashboard />} />
      <Route path="/add-bill" element={<AddMedicineBill />} />
      <Route path="/view-bills/:mobile" element={<ViewBillsByMobile />} />

      {/* Catch-All */}
      <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
