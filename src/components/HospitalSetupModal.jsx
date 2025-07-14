import React, { useState } from "react";
import axios from "axios";

const HospitalSetupModal = () => {
  const [hospitalName, setHospitalName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("file", logoFile);

      const logoUpload = await axios.post("http://localhost:8081/api/hospital-config/upload", formData);
      const logoUrl = logoUpload.data;

      await axios.post("http://localhost:8081/api/hospital-config", {
        hospitalName,
        logoUrl
      });

      setSubmitted(true);
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed to submit config", err);
    }
  };

  if (submitted) return null;

  return (
    <div className="modal">
      <h2>Set Up Your Hospital</h2>
      <input
        type="text"
        placeholder="Enter Hospital Name"
        value={hospitalName}
        onChange={(e) => setHospitalName(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setLogoFile(e.target.files[0])}
      />
      <button onClick={handleSubmit}>Save & Continue</button>
    </div>
  );
};

export default HospitalSetupModal;
