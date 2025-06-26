import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function Dashboard() {
const { user } = useAuth();  
return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Здравей, {user ? user.username : "гост"}!
      </h1>
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <FeatureCard title="Събития" to="/activities" />
      <FeatureCard title="Резервации" to="/reservations" />
      <FeatureCard title="Форум" to="/forum" />
    </section>
    </div>
  );
}

function FeatureCard({ title, to }) {
  return (
    <Link
      to={to}
      className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition flex items-center justify-center text-xl font-semibold"
    >
      {title}
    </Link>
  );
}
