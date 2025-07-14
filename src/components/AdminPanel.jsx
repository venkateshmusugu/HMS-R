import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/AdminPanel.css"

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("accessToken");
  const storedRole = localStorage.getItem("role");
  const actingAs = localStorage.getItem("actingAs");
  const effectiveRole = actingAs || storedRole;

  // Redirect non-admins
  useEffect(() => {
    if (storedRole !== "ADMIN") {
      navigate("/unauthorized");
    }
  }, [storedRole, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/admin/users", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        setUsers(res.data);
        const roleMap = {};
        res.data.forEach((user) => (roleMap[user.id] = user.role));
        setSelectedRole(roleMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setSelectedRole({ ...selectedRole, [userId]: newRole });
  };

  const updateRole = async (userId) => {
    try {
      await axios.put(
        `http://localhost:8081/api/admin/users/${userId}/role`,
        { role: selectedRole[userId] },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      alert("Role updated successfully!");
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Error updating role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:8081/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUsers(users.filter((user) => user.id !== userId));
        alert("User deleted successfully");
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Error deleting user");
      }
    }
  };

  const handleEditUser = (user) => {
    navigate(`/admin/edit-user/${user.id}`);
  };

  const handleImpersonate = (role) => {
    localStorage.setItem("actingAs", role);
    switch (role) {
      case "RECEPTIONIST":
        navigate("/reception-dashboard");
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
    // Clear auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('actingAs');

    // Redirect to login/home
    navigate('/');
  };

  const clearImpersonation = () => {
    localStorage.removeItem("actingAs");
    alert("Stopped impersonating. Refresh or re-navigate.");
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="admin-panel-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <div className="admin-panel-box">
        <h1 className="admin-heading">Welcome to Admin Dashboard</h1>
        <p className="admin-description">Use the side menu or top buttons to manage users and data.</p>
        <strong>Impersonate Role:</strong>
        {["RECEPTIONIST", "DOCTOR", "BILLING", "SURGERY"].map((r) => (
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

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Current Role</th>
            <th>Change Role</th>
            <th>Update</th>
           
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={selectedRole[user.id]}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING", "SURGERY"].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  onClick={() => updateRole(user.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
