import React from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Chrome, Square, Smartphone, Tablet } from 'lucide-react';

export type FrameType = 'mac' | 'chrome' | 'iphone' | 'ipad' | 'none';
export type Theme = 'light' | 'dark';

interface MockupFrameProps {
  type: FrameType;
  theme: Theme;
  children: React.ReactNode;
  className?: string;
  showUrlBar?: boolean;
  url?: string;
}

export function MockupFrame({
  type,
  theme,
  children,
  className,
  showUrlBar = true,
  url = 'example.com',
}: MockupFrameProps) {
  const isDark = theme === 'dark';

  if (type === 'none') {
    return <div className={cn("relative overflow-hidden", className)}>{children}</div>;
  }

  if (type === 'mac') {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
          className
        )}
      >
        {/* Mac Header */}
        <div className={cn(
          "h-10 px-4 flex items-center gap-2 select-none",
          isDark ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-100"
        )}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>
          {showUrlBar && (
             <div className={cn(
                "flex-1 mx-4 text-center text-xs font-medium opacity-60 truncate",
                isDark ? "text-gray-400" : "text-gray-500"
             )}>
                {url}
             </div>
          )}
        </div>
        <div className="relative overflow-hidden bg-white">
            {children}
        </div>
      </div>
    );
  }

  if (type === 'chrome') {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
          className
        )}
      >
        {/* Chrome Header */}
        <div className={cn(
          "flex flex-col select-none",
          isDark ? "bg-gray-900" : "bg-gray-100"
        )}>
           {/* Tabs area */}
           <div className="h-9 px-3 flex items-end gap-2 pt-2">
              <div className={cn(
                 "w-3 h-3 rounded-full bg-[#FF5F56] mb-2 mr-2", 
                 isDark ? "opacity-80" : "opacity-100"
              )} />
              <div className={cn(
                 "w-3 h-3 rounded-full bg-[#FFBD2E] mb-2 mr-2",
                 isDark ? "opacity-80" : "opacity-100"
              )} />
              <div className={cn(
                 "w-3 h-3 rounded-full bg-[#27C93F] mb-2",
                 isDark ? "opacity-80" : "opacity-100"
              )} />
              
              {/* Active Tab */}
              <div className={cn(
                 "relative px-4 py-1.5 rounded-t-lg text-xs font-medium flex items-center gap-2 min-w-[120px] max-w-[200px]",
                 isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
              )}>
                 <span className="truncate">New Tab</span>
                 <span className="ml-auto opacity-50 hover:opacity-100 cursor-pointer">×</span>
              </div>
           </div>

           {/* Address Bar area */}
           <div className={cn(
              "h-9 px-3 flex items-center gap-3 border-b",
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
           )}>
              <div className="flex gap-3 text-gray-400">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18"/><path d="M12.5 3a17 17 0 0 1 0 18"/></svg>
              </div>
              <div className={cn(
                 "flex-1 h-6 rounded-full px-3 flex items-center text-xs",
                 isDark ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-600"
              )}>
                 {url}
              </div>
           </div>
        </div>
        <div className="relative overflow-hidden bg-white">
            {children}
        </div>
      </div>
    );
  }

  if (type === 'iphone') {
    return (
      <div
        className={cn(
          "relative rounded-[3rem] border-[8px] shadow-2xl overflow-hidden",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
          className
        )}
        style={{ aspectRatio: '9/19.5' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-7 bg-black rounded-b-2xl z-20" />
        
        {/* Screen Content */}
        <div className="w-full h-full overflow-hidden bg-white relative z-10">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-black/20 rounded-full z-20" />
      </div>
    );
  }

  if (type === 'ipad') {
    return (
      <div
        className={cn(
          "relative rounded-[2rem] border-[8px] shadow-2xl overflow-hidden",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
          className
        )}
        style={{ aspectRatio: '3/4' }}
      >
        {/* Camera Dot */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/20 rounded-full z-20" />

        {/* Screen Content */}
        <div className="w-full h-full overflow-hidden bg-white relative z-10">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-black/20 rounded-full z-20" />
      </div>
    );
  }

  return null;
}
