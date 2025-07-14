import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AdminPanel from './components/AdminPanel';
import Unauthorized from './components/Unauthorized';

import HomeLogin from './components/HomeLogin';
import RegisterForm from './components/RegisterForm';
import RegisterPatient from './components/RegisterPatient';
import PatientList from './components/PatientList';
import ForgotPassword from './components/ForgotPassword';

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
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomeLogin />} />
      <Route path="/register/:role" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes with Role Restriction */}
      <Route
        path="/register"
        element={
          <RequireAuth allowedRoles={['RECEPTIONIST',  'DOCTOR', 'ADMIN']}>
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
          <RequireAuth allowedRoles={['RECEPTIONIST',  'DOCTOR', 'ADMIN']}>
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


      <Route
        path="/doctor-dashboard"
        element={
          <RequireAuth allowedRoles={['DOCTOR','ADMIN']}>
            <MainLayout>
        <DoctorDashboard />
      </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/book-appointment"
        element={
          <RequireAuth allowedRoles={['DOCTOR', 'RECEPTIONIST', 'ADMIN']}>
            <MainLayout>
            <BookAppointment />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/book-appointment/:id"
        element={
          <RequireAuth allowedRoles={['DOCTOR', 'RECEPTIONIST', 'ADMIN']}>
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
            <MainLayout>
            <ViewBillsByMobile />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
  path="/print/:billId"
  element={
    <RequireAuth allowedRoles={['BILLING', 'ADMIN']}>
      <MainLayout>
        <PrintBill />
      </MainLayout>
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

      {/* Unauthorized + Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
