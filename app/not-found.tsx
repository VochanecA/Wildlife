// app/not-found.tsx
import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
          <div className="w-24 h-2 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ups! Stranica nije pronađena
          </h2>
          <p className="text-gray-600 mb-2">
            Stranica koju tražite ne postoji ili je premještena.
          </p>
          <p className="text-gray-500 text-sm">
            Provjerite URL adresu ili koristite navigaciju ispod
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Home size={20} />
            Почетна страница
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Nazad
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Search className="text-gray-400" size={20} />
            <h3 className="text-lg font-medium text-gray-800">
              Pretražite sajt
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Koristite pretragu da biste pronašli ono što vam treba
          </p>
          {/* Овде можеш да додаш форму за претрагу ако је имаш */}
          <div className="bg-gray-100 rounded-lg p-3 text-gray-500 text-sm">
            Pretraga će biti implementirana...
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Potrebna vam je pomoć?{' '}
            <Link href="/kontakt" className="text-blue-600 hover:text-blue-700 underline">
              Kontaktirajte nas
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}