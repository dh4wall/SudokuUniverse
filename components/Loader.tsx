'use client';
import React from 'react';
import Lottie from 'lottie-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-80 h-80">
        <DotLottieReact
      src="https://lottie.host/bc5d9eba-f3da-4326-8005-c2b8f6d47d78/ndvjsXRvOi.lottie"
      loop
      autoplay
    />
      </div>
    </div>
  );
}