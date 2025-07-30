import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import MainLayout from './components/MainLayout';

import HomeLogin from './components/HomeLogin';
import LandingPage from './components/LandingPage';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import Unauthorized from './components/Unauthorized';

import AdminPanel from './components/AdminPanel';

import RegisterPatient from './components/RegisterPatient';
import PatientList from './components/PatientList';

import DoctorDashboard from './components/DoctorDashboard';
import BookAppointment from './components/BookAppointment';
import Medications from './components/Medications';

import SurgeryDashboard from './components/SurgeryDashboard';
import BookSurgery from './components/BookSurgery';
import EditSurgery from './components/EditSurgery';
import SurgeryMedication from './components/SurgeryMedication';
import ViewSurgeryHistory from './components/ViewSurgeryHistory';

import BillingDashboard from './components/BillingDashboard';
import AddMedicineBill from './components/AddMedicalBill';
import ViewBillsByMobile from './components/ViewBillByMobile';
import PrintBill from './components/PrintBill';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled';

function App() {
  return (
    <Routes>

      {/* Public Routes */}
       <Route path="/" element={<LandingPage />} />
        <Route path="/home-login" element={<HomeLogin />} />
       
        <Route path="/forgot-password" element={<ForgotPassword />} />

         <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentCancelled />} />
         <Route path="/register/:role" element={<RegisterForm />} />

      {/* Receptionist/Doctor/Admin Shared Routes */}
      <Route
        path="/register"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <RegisterPatient />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/register-patient"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <RegisterPatient />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/patients"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <PatientList />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/reception-dashboard"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'ADMIN']}>
            <MainLayout>
              <PatientList />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Doctor */}
      <Route
        path="/doctor-dashboard"
        element={
          <RequireAuth allowedRoles={['DOCTOR', 'ADMIN']}>
            <MainLayout>
              <DoctorDashboard />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/book-appointment"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <BookAppointment />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/book-appointment/:id"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <BookAppointment />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/medications/:patientId/:apptId"
        element={
          <RequireAuth allowedRoles={['DOCTOR', 'ADMIN']}>
            <MainLayout>
              <Medications />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Surgery */}
      <Route
        path="/surgery"
        element={
          <RequireAuth allowedRoles={['SURGERY', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <SurgeryDashboard />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/book-surgery"
        element={
          <RequireAuth allowedRoles={['SURGERY', 'ADMIN']}>
            <MainLayout>
              <BookSurgery />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/edit-surgery/:id"
        element={
          <RequireAuth allowedRoles={['SURGERY', 'ADMIN']}>
            <MainLayout>
              <EditSurgery />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/surgery-medication/:patientId/:surgeryId"
        element={
          <RequireAuth allowedRoles={['SURGERY', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <SurgeryMedication />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/surgery-history/:patientId"
        element={
          <RequireAuth allowedRoles={['SURGERY', 'DOCTOR', 'ADMIN']}>
            <MainLayout>
              <ViewSurgeryHistory />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Billing */}
      <Route
        path="/billing"
        element={
          <RequireAuth allowedRoles={['BILLING', 'ADMIN']}>
            <MainLayout>
              <BillingDashboard />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/add-bill"
        element={
          <RequireAuth allowedRoles={['BILLING', 'ADMIN']}>
            <MainLayout>
              <AddMedicineBill />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/view-bills/:mobile"
        element={
          <RequireAuth allowedRoles={['BILLING', 'ADMIN']}>
            <ViewBillsByMobile />
          </RequireAuth>
        }
      />
      <Route
        path="/print/:billId"
        element={
          <RequireAuth allowedRoles={['BILLING', 'ADMIN']}>
            <PrintBill />
          </RequireAuth>
        }
      />

      {/* Admin Panel */}
      <Route
        path="/admin-dashboard"
        element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AdminPanel />
          </RequireAuth>
        }
      />

      {/* Unauthorized & Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
