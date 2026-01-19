
import React from 'react';
import { GeneratedResult } from '../types';

interface ResultCardProps {
  result: GeneratedResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-amber-100/50">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={result.imageUrl} 
          alt={result.scenario} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b0f]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 space-y-4">
          <p className="text-amber-200 text-sm font-medium tracking-wide">Professional Editorial Look</p>
          <div className="flex items-center gap-2 text-white font-bold">
            <span>View Detailed Portfolio</span>
            <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {/* Floating Label */}
        <div className="absolute top-6 right-6">
          <div className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#2d1b0f] text-xs font-bold rounded-full shadow-lg border border-amber-100">
            {result.scenario}
          </div>
        </div>
      </div>
      
      <div className="p-8 space-y-2">
        <h3 className="text-[#2d1b0f] font-serif text-2xl">{result.scenario} Setting</h3>
        <p className="text-[#8a6b5d] text-sm leading-relaxed">
          High-fidelity render featuring an Indian model styled specifically for {result.scenario.toLowerCase()} aesthetics.
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
