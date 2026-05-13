import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';

interface LiteYouTubeProps {
  url: string;
  title?: string;
  className?: string;
}

const LiteYouTube: React.FC<LiteYouTubeProps> = ({ url, title, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scroll da página quando abrir
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const extractVideoID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = extractVideoID(url);

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold hover:underline ${className}`}
      >
        <Play className="w-4 h-4 mr-1" />
        {title || 'Assistir no YouTube'}
      </a>
    );
  }

  const thumbnailUrl = imgError 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const modalContent = isOpen ? (
    <div 
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999999 }} 
        className="flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300"
    >
      <div 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        className="bg-black/95 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      ></div>
      
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full transition-colors z-[1000000]"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg sm:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[1000000] ring-1 ring-white/10 pointer-events-auto">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        ></iframe>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-md bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 shadow-sm ${className}`}
        style={{ width: '180px', maxWidth: '100%' }}
        onClick={() => setIsOpen(true)}
      >
        <div className="w-full relative pt-[56.25%]">
          <img 
            src={thumbnailUrl} 
            alt={title || "YouTube Video Thumbnail"}
            onError={() => setImgError(true)}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300"></div>
          <div className="absolute bottom-2 right-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600/90 hover:bg-emerald-500 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-110">
              <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default LiteYouTube;
