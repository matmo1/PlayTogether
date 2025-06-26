// src/pages/Events.jsx
import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start_time: "",
    participant_usernames: "",
  });

  // --- зареждаме списъка ---
  useEffect(() => {
    api.get("/activities").then((res) => setEvents(res.data));
  }, []);

  // --- създаване на събитие ---
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/activities",
        {
          title: newEvent.title,
          start_time: newEvent.start_time,
          participant_usernames: newEvent.participant_usernames
            .split(",")
            .map((u) => u.trim()),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setShowForm(false);
      setNewEvent({ title: "", start_time: "", participant_usernames: "" });
      const { data } = await api.get("/activities");
      setEvents(data); // рефреш
    } catch (err) {
      alert("Грешка при създаване на събитие");
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Събития</h1>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            {showForm ? "Отказ" : "Ново събитие"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 mb-6 bg-white p-4 rounded-xl shadow">
          <input
            className="w-full border p-2 rounded"
            placeholder="Заглавие"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={newEvent.start_time}
            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Потребители, разделени със запетая"
            value={newEvent.participant_usernames}
            onChange={(e) =>
              setNewEvent({ ...newEvent, participant_usernames: e.target.value })
            }
          />
          <button className="bg-secondary text-white px-4 py-2 rounded-lg">
            Създай
          </button>
        </form>
      )}

      {/* списък със събития */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <div key={ev.activity_id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold">{ev.title || "Събитие"}</h3>
            <p className="text-slate-600">
              {new Date(ev.activity_date).toLocaleString("bg-BG")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
