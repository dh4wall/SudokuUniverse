'use client';

import { useState, useEffect } from 'react';
import Loader from './Loader';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the loader after a delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return loading ? <Loader /> : <>{children}</>;
}