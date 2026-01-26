import React from 'react';
import { User } from 'lucide-react';

const Profil = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Mahasiswa</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
             <User size={48} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kelvin</h2>
            <p className="text-gray-500">Mahasiswa Aktif</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">Teknik Informatika</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">NIM</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">123456789</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Semester</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">5</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">kelvin@univ.ac.id</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">No. HP</label>
            <p className="mt-1 text-lg text-gray-900 font-semibold">0812-3456-7890</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;