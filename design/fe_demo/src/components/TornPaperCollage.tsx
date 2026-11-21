import React, { useState } from 'react';
import { Destination } from '../types';

interface TornPaperCollageProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

export const TornPaperCollage: React.FC<TornPaperCollageProps> = ({ destinations, onSelectDestination }) => {
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);

  return (
    <div className="relative my-8 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ochre"></span>
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink font-mono">
            Scrapbook Viễn Du — Danh Thắng Di Sản Việt Nam
          </h2>
        </div>
        <span className="text-xs text-muted font-medium hidden sm:block">
          Góc nhìn nhiếp ảnh nghệ thuật qua 6 vùng đất
        </span>
      </div>

      {/* Grid of 6 Torn Paper Landscape Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
        {destinations.map((dest, idx) => (
          <div
            key={dest.id}
            onMouseEnter={() => setHoveredDest(dest.id)}
            onMouseLeave={() => setHoveredDest(null)}
            onClick={() => onSelectDestination(dest)}
            style={{ transform: `rotate(${dest.tilt})` }}
            className={`torn-paper-box p-3 cursor-pointer group hover:z-30 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border border-ash/80 rounded-xl ${
              hoveredDest === dest.id ? 'ring-2 ring-ochre/60' : ''
            }`}
          >
            {/* Washi Tape Accent at Top Center */}
            <div 
              className="washi-tape top-[-8px] left-1/2 -translate-x-1/2"
              style={{ transform: idx % 2 === 0 ? 'translateX(-50%) rotate(-4deg)' : 'translateX(-50%) rotate(5deg)' }}
            ></div>

            {/* Image Container with Torn Mask */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-surface torn-edge-mask">
              <img 
                src={dest.image} 
                alt={dest.name} 
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent"></div>
              
              {/* Category Badge */}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pureWhite/90 text-navy rounded backdrop-blur-sm border border-ash">
                {dest.tag}
              </span>

              {/* Vintage Rubber Postmark Stamp */}
              <div className="vintage-stamp absolute bottom-2.5 right-2.5 text-[9px] bg-pureWhite/70">
                {dest.postmark}
              </div>
            </div>

            {/* Card Content & Editorial Typography */}
            <div className="pt-3 pb-1 px-1">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-terracotta transition-colors">
                  {dest.name}
                </h3>
                <span className="text-[11px] font-mono text-muted">{dest.province}</span>
              </div>
              <p className="mt-1 text-xs text-graphite line-clamp-2 leading-relaxed">
                {dest.desc}
              </p>
              <div className="mt-2.5 pt-2 border-t border-ash/70 flex items-center justify-between text-[11px]">
                <span className="font-mono text-muted">{dest.coords}</span>
                <span className="text-ochre font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lên lịch tới đây →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
