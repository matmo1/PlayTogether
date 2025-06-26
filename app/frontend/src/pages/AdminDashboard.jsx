import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

/**
 * AdminDashboard.jsx – само CRUD потребители + списък резервации
 * -------------------------------------------------------------
 * • Създава / редактира / изтрива потребители (всички са role="user")
 * • Показва резервации (read‑only)
 */
export default function AdminDashboard() {
  const { user } = useAuth();

  /* ---------- state ---------- */
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const tokenHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  /* ---------- helpers ---------- */
  const loadAll = () => {
    api.get("/users/", tokenHeader).then((r) => setUsers(r.data));
    api.get("/bookings/", tokenHeader).then((r) => setBookings(r.data));
  };

  /* ---------- update booking status ---------- */
  const updateBooking = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status }, tokenHeader);
      setBookings((prev) => prev.map((b) => (b.booking_id === id ? { ...b, status } : b)));
    } catch (err) {
      console.error(err);
      alert("Неуспешна промяна на статус");
    }
  };

  /* ---------- lifecycle ---------- */
  useEffect(loadAll, []);

  /* ---------- CRUD users ---------- */
  const saveUser = async (e) => {
    e.preventDefault();
    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
    };
    if (form.user_id) {
      await api.put(`/users/${form.user_id}`, payload, tokenHeader);
    } else {
      await api.post("/users/", payload, tokenHeader);
    }
    resetForm();
    loadAll();
  };

  const editUser = (u) => {
    setForm({ user_id: u.user_id, username: u.username, email: u.email, password: "" });
    setShowForm(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Сигурен ли си?")) return;
    await api.delete(`/users/${id}`, tokenHeader);
    loadAll();
  };

  const resetForm = () => {
    setForm({ username: "", email: "", password: "" });
    setShowForm(false);
  };

  /* ---------- render ---------- */
  return (
    <section className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Panel</h1>

      {/* --- USERS HEADER --- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Потребители</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Отказ" : "Нов потребител"}
        </button>
      </div>

      {/* --- USER FORM --- */}
      {showForm && (
        <form
          onSubmit={saveUser}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 mb-8 rounded-xl shadow"
        >
          <input
            placeholder="Потребителско име"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            placeholder="Имейл"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded p-2"
            required
          />
          <input
            placeholder="Парола"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded p-2"
            required={!form.user_id}
          />

          <button className="sm:col-span-2 bg-secondary text-white py-2 rounded-lg mt-2">
            {form.user_id ? "Запази" : "Създай"}
          </button>
        </form>
      )}

      {/* --- USER TABLE --- */}
      <div className="overflow-x-auto mb-12 bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Потребител</th>
              <th className="px-3 py-2">Имейл</th>
              <th className="px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-t last:border-b">
                <td className="px-3 py-2">{u.user_id}</td>
                <td className="px-3 py-2">{u.username}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => editUser(u)} className="text-blue-600 text-sm">
                    редакция
                  </button>
                  {u.user_id !== user.user_id && (
                    <button onClick={() => deleteUser(u.user_id)} className="text-red-600 text-sm">
                      изтрий
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- BOOKINGS SECTION --- */}
      <h2 className="text-xl font-semibold mb-4">Резервации</h2>
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Потребител</th>
              <th className="px-3 py-2">Игрище</th>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id} className="border-t last:border-b">
                <td className="px-3 py-2">{b.booking_id}</td>
                <td className="px-3 py-2">{b.user?.username || b.user_id}</td>
                <td className="px-3 py-2">{b.facility?.name || b.facility_id}</td>
                <td className="px-3 py-2">
                  {new Date(b.booking_date).toLocaleString("bg-BG")}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={b.status}
                    onChange={(e) => updateBooking(b.booking_id, e.target.value)}
                    className="border rounded p-1 text-xs capitalize"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
