import React from 'react';
import { Bell, X } from 'lucide-react';

export default function Toast({ message, time, onClose }) {
  return (
    <div className="fixed top-24 right-8 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-gray-100 
                    animate-slide-in z-50 transition-all duration-500 ease-in-out transform hover:scale-105 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{message}</p>
          <span className="text-xs text-gray-500 mt-1 block">{time}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
