import { useEffect, useState } from "react";
import API from "./api";

export default function UserList({ setSelectedUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        setUsers(res.data);
      } catch (err) {
        console.log("User fetch error:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ width: "30%", borderRight: "1px solid gray" }}>
      <h3>Users</h3>

      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => setSelectedUser(u)}
          style={{
            padding: "10px",
            cursor: "pointer",
            borderBottom: "1px solid #ddd",
          }}
        >
          {u.email}
        </div>
      ))}
    </div>
  );
}