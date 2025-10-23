'use client';
import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="min-w-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-gray-800">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center text-white py-24 px-6 sm:px-10 lg:py-32">
        <div className="max-w-6xl w-full">
          <div className="text-7xl sm:text-8xl mb-4">🦅</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Airport Wildlife Management System
          </h1>
          <p className="text-lg sm:text-2xl opacity-90 mb-6">
            Aerodrom Tivat — AI upravljanje divljim životinjama
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base">
            {['✅ Production Ready', '🤖 AI Powered', '📊 Real-time Analytics', '🎵 Audio Repelent'].map((tag, i) => (
              <span
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full font-medium hover:bg-white/20 transition"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-10 bg-white rounded-t-[3rem] -mt-10 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 text-center">
            Glavne Karakteristike
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Kompletan AI ekosistem za profesionalno upravljanje wildlife rizicima
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '📊',
                title: 'Dashboard & Analitika',
                list: [
                  'Real-time monitoring',
                  'AI analiza trendova',
                  'Rizik po zonama',
                  'Interaktivne mape opasnosti',
                ],
              },
              {
                icon: '🤖',
                title: 'AI Asistent',
                list: [
                  'DeepSeek AI integracija',
                  'Savjeti za Aerodrom Tivat',
                  'Analiza rizika po vrstama',
                  'EASA/ICAO compliance',
                ],
              },
              {
                icon: '🎵',
                title: 'Audio Repelent Sistem',
                list: [
                  '7 različitih zvukova',
                  'Gunshot (95% efikasnost)',
                  'Auto-repeat funkcionalnost',
                  'Offline dostupnost',
                ],
              },
              {
                icon: '📱',
                title: 'Administracija',
                list: [
                  'Evidencija wildlife događaja',
                  'Izvještaji i zadaci',
                  'Planiranje aktivnosti',
                  'Interna komunikacija',
                ],
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <ul className="space-y-1 text-gray-600">
                  {item.list.map((li, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-14 px-6 sm:px-10 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">Kontaktirajte nas</h3>
        <p className="opacity-90 mb-8 text-sm sm:text-base max-w-3xl mx-auto">
          Zainteresovani ste za implementaciju sistema na vašem aerodromu?
          Kontaktirajte nas za demonstraciju i licenciranje.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10 mb-8 text-sm">
          <div>📧 support@aerodrom-tivat.me</div>
          <div>🌐 www.aerodrom-tivat.me</div>
          <div>📍 Tivat, Crna Gora</div>
        </div>

        <div className="text-xs opacity-70 border-t border-gray-700 pt-6">
          <p>© 2025 Aerodrom Tivat — Airport Wildlife Management System</p>
          <p className="mt-2">Made with ❤️ for aviation safety | EASA & ICAO Compliant</p>
        </div>
      </footer>

      {/* Back Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <Link
          href="/"
          className="inline-block bg-white text-blue-600 px-5 py-2 sm:px-6 sm:py-3 rounded-full font-semibold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
        >
          ← Nazad
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
