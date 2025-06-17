import axios from 'axios';

const API_URL = 'http://localhost:8080/api/patients'; // Adjust this to match your backend

const registerPatient = (patientData) => {
  return axios.post(API_URL, patientData);
};

export default {
  registerPatient,
};
