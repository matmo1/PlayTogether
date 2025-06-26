import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ facility_id: "", booking_date: "", duration: 1 });

  /* --------------- helpers --------------- */
  const tokenHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const fetchReservations = () =>
    api
      .get("/bookings/", tokenHeader)
      .then((r) =>
        // филтрираме само моите
        setReservations(r.data.filter((b) => b.user_id === user?.user_id))
      );

  const fetchFacilities = () => api.get("/facilities/").then((r) => setFacilities(r.data));

  /* --------------- lifecycle --------------- */
  useEffect(() => {
    if (user) {
      fetchReservations();
      fetchFacilities();
    }
  }, [user]);

  /* --------------- create reservation --------------- */
  const create = async (e) => {
    e.preventDefault();
    const payload = {
      facility_id: Number(form.facility_id),
      booking_date: form.booking_date + ":00",
      duration: Number(form.duration),
    };
    try {
      await api.post(
      `/users/${user.user_id}/bookings/`,
      payload,
      tokenHeader
    );
      resetForm();
      fetchReservations();
    } catch (err) {
      alert("Неуспешна резервация");
      console.error(err.response?.data);
    }
  };

  const resetForm = () => {
    setForm({ facility_id: "", booking_date: "", duration: 1 });
    setShowForm(false);
  };

  /* --------------- render --------------- */
  return (
    <section className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary drop-shadow-sm">Резервации</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition"
        >
          {showForm ? "Отказ" : "Нова резервация"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={create}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-lg mb-10 border border-slate-200"
        >
          {/* Facility */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Игрище / Зала</label>
            <select
              value={form.facility_id}
              onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2"
              required
            >
              <option value="">Избери игрище</option>
              {facilities.map((f) => (
                <option key={f.facility_id} value={f.facility_id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Дата и час</label>
            <input
              type="datetime-local"
              value={form.booking_date}
              onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2"
              required
            />
          </div>

          {/* Duration */}
          <div className="col-span-full sm:col-span-1">
            <label className="block text-sm font-semibold mb-1">Продължителност (ч.)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2"
              required
            />
          </div>

          <button className="col-span-full bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition">
            Запази
          </button>
        </form>
      )}

      {/* list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reservations.map((r) => (
          <ReservationCard key={r.booking_id} res={r} />
        ))}
      </div>
    </section>
  );
}

function ReservationCard({ res }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-slate-200">
      <h3 className="font-semibold text-xl mb-2 text-primary">
        {res.facility?.name || "Игрище"}
      </h3>
      <p className="text-slate-700 font-medium mb-1">
        {new Date(res.booking_date).toLocaleString("bg-BG")} / {res.duration} ч.
      </p>
      <p className="text-slate-500 text-sm">{res.status}</p>
    </div>
  );
}
