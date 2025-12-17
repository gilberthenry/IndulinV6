'use client';

import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="p-4 bg-amber-100 rounded-full mb-4">
        <Construction className="h-12 w-12 text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">
        {description || 'This page is under development. The component has been migrated from React to Next.js and will be fully functional soon.'}
      </p>
    </div>
  );
}
