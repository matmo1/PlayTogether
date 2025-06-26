import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-bold text-lg text-primary">
          SportHub
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-primary">
                Табло
              </Link>

              <Link to="/facilities" className="hover:text-primary">
                Игрища
              </Link>

              {user?.role === "admin" && (
                <Link to="/admin" className="hover:text-primary">
                  Админ панел
                </Link>
              )}


              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Изход
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary">
                Логин
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
