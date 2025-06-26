import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    birth_date: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/", form);
      navigate("/login");
    } catch (err) {
      setError("Проблем при регистрация");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Регистрация</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Потребителско име */}
        <div>
          <label className="block text-sm mb-1">Потребителско име</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Имейл */}
        <div>
          <label className="block text-sm mb-1">Имейл</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Парола */}
        <div>
          <label className="block text-sm mb-1">Парола</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Пол */}
        <div>
          <label className="block text-sm mb-1">Пол</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
            required
          >
            <option value="">Избери пол</option>
            <option value="male">Мъж</option>
            <option value="female">Жена</option>
            <option value="other">Друг</option>
          </select>
        </div>

        {/* Дата на раждане */}
        <div>
          <label className="block text-sm mb-1">Дата на раждане</label>
          <input
            name="birth_date"
            type="date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Регистрация
        </button>
      </form>
    </div>
  );
}
