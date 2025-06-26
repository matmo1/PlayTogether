import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-white shadow-md py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Добре дошъл в SportHub
            </h1>
            <p className="text-lg mb-6">
              Свържи се с други спортуващи, създавай събития и тренирай заедно.
            </p>
            <Link
              to="/register"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Регистрирай се сега
            </Link>
          </div>
          <img
            src="/assets/hero_sport.png"
            alt="Спорт"
            className="md:w-1/2 mt-10 md:mt-0"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">За нас</h2>
          <p className="text-lg text-gray-700">
            SportHub е мястото, където хора със сходни спортни интереси се свързват, организират активности и изграждат активен начин на живот.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <Feature icon="🏋️" title="Тренирай с други">
            Намери партньори по интереси и спортувайте заедно.
          </Feature>
          <Feature icon="📍" title="Събития по локация">
            Организирай събития в твоя град или район.
          </Feature>
          <Feature icon="🔐" title="Безопасност и сигурност">
            Защитена платформа с лични профили и контрол.
          </Feature>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}
