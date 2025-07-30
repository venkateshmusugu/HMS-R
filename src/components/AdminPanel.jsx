import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem("hospitalId");

  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("accessToken");
  const storedRole = localStorage.getItem("role");

  const ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING", "SURGERY"];

  useEffect(() => {
    if (storedRole !== "ADMIN") {
      navigate("/unauthorized");
    }
  }, [storedRole, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken || !hospitalId) return;

      try {
        const res = await axios.get("http://localhost:8081/api/admin/users", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        const filtered = res.data.filter(
          (u) => String(u.hospitalId) === String(hospitalId)
        );

        setUsers(filtered);

        const roleMap = {};
        filtered.forEach((user) => {
          roleMap[user.id] = user.role;
        });

        setSelectedRole(roleMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err.response?.status === 403) {
          navigate("/unauthorized");
        }
      }
    };

    fetchUsers();
  }, [accessToken, hospitalId, navigate]);

  const handleRoleChange = (userId, newRole) => {
    setSelectedRole({ ...selectedRole, [userId]: newRole });
  };

  const roleLimitExceeded = (newRole, userId) => {
    const sameHospitalUsers = users.filter(
      (u) => String(u.hospitalId) === String(hospitalId)
    );
    const roleCount = sameHospitalUsers.filter(
      (u) => u.role === newRole && u.id !== userId
    ).length;

    if (newRole === "DOCTOR") {
      return roleCount >= 5;
    } else {
      return roleCount >= 1;
    }
  };

  const updateRole = async (userId) => {
    const newRole = selectedRole[userId];

    if (roleLimitExceeded(newRole, userId)) {
      alert(
        `❌ Limit reached: Only ${
          newRole === "DOCTOR" ? 5 : 1
        } ${newRole.toLowerCase()}(s) allowed per hospital.`
      );
      return;
    }

    try {
      await axios.put(
        `http://localhost:8081/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      alert("✅ Role updated successfully!");
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("❌ Error updating role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:8081/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUsers(users.filter((user) => user.id !== userId));
        alert("✅ User deleted successfully");
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("❌ Error deleting user");
      }
    }
  };

  const handleImpersonate = (role) => {
    localStorage.setItem("actingAs", role);
    switch (role) {
      case "RECEPTIONIST":
        navigate("/patients");
        break;
      case "DOCTOR":
        navigate("/doctor-dashboard");
        break;
      case "BILLING":
        navigate("/billing");
        break;
      case "SURGERY":
        navigate("/surgery");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("actingAs");
    localStorage.removeItem("hospitalId");
    navigate("/");
  };

  const clearImpersonation = () => {
    localStorage.removeItem("actingAs");
    alert("Stopped impersonating. Refresh or re-navigate.");
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="admin-panel-container">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <div className="admin-panel-box">
        <h1 className="admin-heading">Welcome to Admin Dashboard</h1>
        <p className="admin-description">
          Use the top buttons to manage roles, limits and hospital users.
        </p>

        <strong>Impersonate Role:</strong>
        {ROLES.filter((r) => r !== "ADMIN").map((r) => (
          <button
            key={r}
            onClick={() => handleImpersonate(r)}
            style={{
              margin: "5px",
              padding: "6px 12px",
              backgroundColor: "#6c63ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {r}
          </button>
        ))}
        <button
          onClick={clearImpersonation}
          style={{
            margin: "5px",
            padding: "6px 12px",
            backgroundColor: "red",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Stop Impersonating
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Current Role</th>
            <th>Hospital ID</th>
            <th>Change Role</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const newRole = selectedRole[user.id];
            const isLimitHit = roleLimitExceeded(newRole, user.id);

            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.hospitalId || "N/A"}</td>
                <td>
                  <select
                    value={selectedRole[user.id]}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => updateRole(user.id)}
                    disabled={isLimitHit}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: isLimitHit ? "#ccc" : "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: isLimitHit ? "not-allowed" : "pointer",
                    }}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "red",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
