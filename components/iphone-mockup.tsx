'use client';

import { cn } from '@/lib/utils';

interface IPhoneMockupProps {
  imageSrc: string;
  alt: string;
  className?: string;
  floatDirection?: 'left' | 'right' | 'up';
  floatDelay?: number;
}

export function IPhoneMockup({ 
  imageSrc, 
  alt, 
  className,
  floatDirection = 'up',
  floatDelay = 0 
}: IPhoneMockupProps) {
  const animationClass = 
    floatDirection === 'left' ? 'animate-float-left' : 
    floatDirection === 'right' ? 'animate-float-right' : 
    'animate-float';
    
  return (
    <div 
      className={cn(
        "relative",
        animationClass,
        className
      )}
      style={{ animationDelay: `${floatDelay}s` }}
    >
      {/* Glow effect behind the phone */}
      <div className="absolute -inset-4 sm:-inset-6 lg:-inset-8 bg-gradient-to-br from-primary/25 via-blue-500/15 to-violet-500/20 rounded-[40px] sm:rounded-[50px] lg:rounded-[60px] blur-2xl sm:blur-3xl opacity-70 dark:from-white/10 dark:via-white/5 dark:to-white/10 dark:opacity-50" />
      
      {/* iPhone Frame */}
      <div className="relative">
        {/* Outer frame - titanium look */}
        <div className="relative bg-gradient-to-b from-[#3a3a3c] via-[#2a2a2c] to-[#1a1a1c] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-[2px] sm:p-[3px] shadow-2xl shadow-black/60">
          {/* Inner frame highlight */}
          <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
          
          {/* Screen bezel */}
          <div className="relative bg-black rounded-[1.4rem] sm:rounded-[1.9rem] lg:rounded-[2.35rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-1 sm:top-1.5 lg:top-2 left-1/2 -translate-x-1/2 z-20">
              <div className="w-12 sm:w-16 lg:w-20 h-4 sm:h-5 lg:h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-1.5 sm:w-2 lg:w-2.5 h-1.5 sm:h-2 lg:h-2.5 rounded-full bg-[#1a1a1c]" />
              </div>
            </div>
            
            {/* Screen content */}
            <div className="relative overflow-hidden bg-black">
              <img 
                src={imageSrc} 
                alt={alt}
                className="w-full h-auto object-cover object-top"
              />
              
              {/* Screen glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Side buttons - minimal for cleaner look */}
          <div className="absolute top-[20%] -right-[1px] sm:-right-[2px] w-[2px] sm:w-[3px] h-8 sm:h-10 lg:h-12 bg-gradient-to-b from-[#4a4a4c] to-[#2a2a2c] rounded-r-sm" />
          <div className="absolute top-[15%] -left-[1px] sm:-left-[2px] w-[2px] sm:w-[3px] h-4 sm:h-6 lg:h-7 bg-gradient-to-b from-[#4a4a4c] to-[#2a2a2c] rounded-l-sm" />
          <div className="absolute top-[25%] -left-[1px] sm:-left-[2px] w-[2px] sm:w-[3px] h-6 sm:h-8 lg:h-10 bg-gradient-to-b from-[#4a4a4c] to-[#2a2a2c] rounded-l-sm" />
        </div>
      </div>
    </div>
  );
}
