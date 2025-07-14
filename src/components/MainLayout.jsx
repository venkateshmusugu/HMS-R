import React from "react";
import HospitalHeader from "./HospitalHeader"; // logo + name
import "../css/MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <HospitalHeader />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
