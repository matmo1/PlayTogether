import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import SelectSport from "../components/SelectSport";

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    sport_id: "",
    description: "",
    activity_date: "",
    location: "",
    participant_usernames: "",
  });

  // --- зареждаме само моите събития ---
  const fetchActivities = () =>
    api
      .get("/activities/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((r) => setActivities(r.data));

  useEffect(() => {
    fetchActivities();
  }, []);

  // ---- submit (create or update) ----
  const submitActivity = async (e) => {
    e.preventDefault();

    const payload = {
      sport_id: Number(form.sport_id),
      description: form.description,
      activity_date: form.activity_date + ":00",
      location: form.location,
      participant_usernames: form.participant_usernames
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
    };

    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };

    try {
      if (editingId) {
        await api.put(`/activities/${editingId}`, payload, config);
      } else {
        await api.post("/activities/", payload, config);
      }
      resetForm();
      fetchActivities();
    } catch (err) {
      console.error(err.response?.data);
      alert("Грешка: " + (err.response?.data?.detail || "неуспешна операция"));
    }
  };

  const resetForm = () => {
    setForm({
      sport_id: "",
      description: "",
      activity_date: "",
      location: "",
      participant_usernames: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ---- запълване на формата при "Редактирай" ----
  const handleEdit = (activity) => {
    setForm({
      sport_id: activity.sport_id,
      description: activity.description,
      activity_date: activity.activity_date?.slice(0, 16), // ISO → yyyy-MM-ddTHH:mm
      location: activity.location,
      participant_usernames: activity.matches
        ? activity.matches.map((m) => m.user.username).join(",")
        : "",
    });
    setEditingId(activity.activity_id);
    setShowForm(true);
  };

  return (
    <section className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary drop-shadow-sm">Събития</h1>
        {user && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition"
          >
            {showForm ? "Отказ" : "Ново събитие"}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={submitActivity}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-lg mb-10 border border-slate-200"
        >
          {/* Спорт */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Спорт</label>
            <SelectSport
              value={form.sport_id}
              onChange={(val) => setForm({ ...form, sport_id: val })}
            />
          </div>

          {/* Дата */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Дата и час</label>
            <input
              type="datetime-local"
              value={form.activity_date}
              onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring focus:ring-primary/50"
              required
            />
          </div>

          {/* Локация */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Локация</label>
            <input
              placeholder="Локация"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring focus:ring-primary/50"
              required
            />
          </div>

          {/* Описание */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Описание</label>
            <textarea
              placeholder="Описание"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring focus:ring-primary/50"
            />
          </div>

          {/* Участници */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Участници (user1,user2)</label>
            <input
              placeholder="Покани потребители (user1,user2)"
              value={form.participant_usernames}
              onChange={(e) => setForm({ ...form, participant_usernames: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring focus:ring-primary/50"
            />
          </div>

          <button className="col-span-full bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition">
            {editingId ? "Запази" : "Създай"}
          </button>
        </form>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => (
          <ActivityCard key={a.activity_id} activity={a} onEdit={handleEdit} canEdit={user?.user_id === a.user_id} />
        ))}
      </div>
    </section>
  );
}

function ActivityCard({ activity, onEdit, canEdit }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-slate-200 relative">
      {canEdit && (
        <button
          onClick={() => onEdit(activity)}
          className="absolute top-2 right-2 text-sm text-primary hover:underline"
        >
          Редактирай
        </button>
      )}

      <h3 className="font-semibold text-xl mb-2 text-primary">
        {activity.sport?.name || "Спорт"} — {" "}
        <span className="text-slate-500 text-sm">
          {new Date(activity.activity_date).toLocaleString("bg-BG")}
        </span>
      </h3>
      <p className="text-slate-700 font-medium mb-1">{activity.location}</p>
      <p className="text-slate-500 text-sm">{activity.description}</p>
    </div>
  );
}
