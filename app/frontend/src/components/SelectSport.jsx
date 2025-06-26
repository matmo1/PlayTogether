import { useEffect, useState } from "react";
import api from "../api";

export default function SelectSport({ value, onChange }) {
  const sports = [
    { id: 1, name: "Футбол" },
    { id: 2, name: "Баскетбол" },
    { id: 3, name: "Волейбол" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full border rounded p-2"
    >
      <option value="">Избери спорт</option>
      {sports.map((sport) => (
        <option key={sport.id} value={sport.id}>
          {sport.name}
        </option>
      ))}
    </select>
  );
}
