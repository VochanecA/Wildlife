// app/not-found.tsx
import Link from 'next/link'
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ikona i Error Code */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={40} />
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Stranica nije pronadjena
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Nazalost, stranica koju trazite ne postoji na nasem sajtu.
            Mozda je uklonjena ili ste uneli pogresnu adresu.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home size={20} />
            Vratite se na pocetnu
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-medium transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Idite nazad
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Search size={20} />
            Brze veze
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/o-nama" className="text-blue-600 hover:text-blue-700 hover:underline p-2 rounded-lg hover:bg-blue-50">
              O nama
            </Link>
            <Link href="/usluge" className="text-blue-600 hover:text-blue-700 hover:underline p-2 rounded-lg hover:bg-blue-50">
              Usluge
            </Link>
            <Link href="/blog" className="text-blue-600 hover:text-blue-700 hover:underline p-2 rounded-lg hover:bg-blue-50">
              Blog
            </Link>
            <Link href="/kontakt" className="text-blue-600 hover:text-blue-700 hover:underline p-2 rounded-lg hover:bg-blue-50">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}