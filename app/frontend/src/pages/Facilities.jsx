import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

/**
 * Facilities.jsx
 * -------------------------------------------------
 * • Всички логнати потребители могат да ДОБАВЯТ игрище
 * • Само админите могат да РЕДАКТИРАТ и ИЗТРИВАТ
 * • Полето sport_id е задължително — падащ списък със спортове
 */
export default function Facilities() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  /* ---------- state ---------- */
  const [facilities, setFacilities] = useState([]);
  const [sports, setSports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    facility_id: null,
    name: "",
    sport_id: "",
    address: "",
    contact_info: "",
  });

  const tokenHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  /* ---------- helpers ---------- */
  const reloadFacilities = () =>
    api
      .get("/facilities/", tokenHeader)
      .then((r) => setFacilities(r.data))
      .catch(console.error);

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    // зареждаме спортове и игрища
    api.get("/sports/").then((r) => setSports(r.data));
    reloadFacilities();
  }, []);

  /* ---------- CRUD ---------- */
  async function save(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      sport_id: Number(form.sport_id),
      address: form.address,
      contact_info: form.contact_info,
    };

    if (form.facility_id) {
      // update (само admin)
      await api.put(`/facilities/${form.facility_id}`, payload, tokenHeader);
    } else {
      // create
      await api.post("/facilities/", payload, tokenHeader);
    }
    resetForm();
    reloadFacilities();
  }

  function edit(f) {
    if (!isAdmin) return;
    setForm({ ...f });
    setShowForm(true);
  }

  async function del(id) {
    if (!isAdmin) return;
    if (!window.confirm("Сигурен ли си?")) return;
    await api.delete(`/facilities/${id}`, tokenHeader);
    reloadFacilities();
  }

  function resetForm() {
    setForm({
      facility_id: null,
      name: "",
      sport_id: "",
      address: "",
      contact_info: "",
    });
    setShowForm(false);
  }

  /* ---------- render ---------- */
  return (
    <section className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Игрища / Зали</h1>

        {user && (
          <button
            onClick={() => {
              resetForm();
              setShowForm((s) => !s);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            {showForm ? "Отказ" : "Ново игрище"}
          </button>
        )}
      </header>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={save}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 mb-8 rounded-xl shadow"
        >
          <input
            placeholder="Име"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded p-2"
            required
          />

          {/* dropdown спорт */}
          <select
            value={form.sport_id}
            onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
            className="border rounded p-2"
            required
          >
            <option value="">-- спорт --</option>
            {sports.map((s) => (
              <option key={s.sport_id} value={s.sport_id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Адрес"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border rounded p-2"
          />
          <input
            placeholder="Контакти"
            value={form.contact_info}
            onChange={(e) =>
              setForm({ ...form, contact_info: e.target.value })
            }
            className="border rounded p-2"
          />

          <button className="sm:col-span-2 bg-secondary text-white py-2 rounded-lg">
            {form.facility_id ? "Запази" : "Създай"}
          </button>
        </form>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Име</th>
              <th className="px-3 py-2">Спорт</th>
              <th className="px-3 py-2">Адрес</th>
              <th className="px-3 py-2">Контакти</th>
              <th className="px-3 py-2 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.facility_id} className="border-t last:border-b">
                <td className="px-3 py-2">{f.facility_id}</td>
                <td className="px-3 py-2">{f.name}</td>
                <td className="px-3 py-2">
                  {sports.find((s) => s.sport_id === f.sport_id)?.name ||
                    f.sport_id}
                </td>
                <td className="px-3 py-2">{f.address}</td>
                <td className="px-3 py-2">{f.contact_info}</td>
                <td className="px-3 py-2 flex gap-2 justify-center">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => edit(f)}
                        className="text-blue-600 text-sm"
                      >
                        редакция
                      </button>
                      <button
                        onClick={() => del(f.facility_id)}
                        className="text-red-600 text-sm"
                      >
                        изтрий
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 italic text-xs">
                      само добавяне
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
