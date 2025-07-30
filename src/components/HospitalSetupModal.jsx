import React, { useEffect, useState } from "react";
import axios from "axios";

const HospitalSetupModal = () => {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if hospital is already configured (ID = 1)
    axios.get("http://localhost:8081/api/hospitals/1")
      .then(res => {
        if (res.data?.name) {
          setSubmitted(true); // Skip modal if already configured
        }
      })
      .catch(() => {}); // Ignore error if not configured yet
  }, []);

  const handleSubmit = async () => {
    if (!hospitalName || !hospitalAddress || !logoFile) {
      alert("Please fill all fields.");
      return;
    }

    try {
      // Upload logo
      const formData = new FormData();
      formData.append("file", logoFile);

      const logoRes = await axios.post("http://localhost:8081/api/hospital-config/upload", formData);
      const logoUrl = logoRes.data;

      // Save hospital config
      await axios.post("http://localhost:8081/api/hospitals", {
        name: hospitalName,
        address: hospitalAddress,
        logoUrl: logoUrl
      });

      alert("✅ Hospital setup completed.");
      setSubmitted(true);
      window.location.reload();
    } catch (err) {
      console.error("❌ Failed to submit config:", err);
      alert("❌ Setup failed. Please try again.");
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
        className="form-control mb-3"
      />

      <input
        type="text"
        placeholder="Enter Hospital Address"
        value={hospitalAddress}
        onChange={(e) => setHospitalAddress(e.target.value)}
        className="form-control mb-3"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogoFile(e.target.files[0])}
        className="form-control mb-3"
      />

      <button className="btn btn-primary" onClick={handleSubmit}>
        Save & Continue
      </button>
    </div>
  );
};

export default HospitalSetupModal;
