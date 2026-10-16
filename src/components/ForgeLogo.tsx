import React from 'react';

interface ForgeLogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ForgeLogo: React.FC<ForgeLogoProps> = ({
  collapsed = false,
  className = '',
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Forge & Code Symbol */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-br from-[#8065F5] to-[#4F3FB0] p-0.5 shadow-md shadow-[#8065F5]/25 flex items-center justify-center flex-shrink-0 relative overflow-hidden group`}
      >
        <div className="w-full h-full bg-[#12141D] rounded-[10px] flex items-center justify-center relative">
          {/* Stylized Anvil / Bracket Mark */}
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-[#A995FF] group-hover:scale-105 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Forge hammer & code bracket glyph */}
            <path d="M7 8L3 12L7 16" />
            <path d="M17 8L21 12L17 16" />
            <path d="M14 4L10 20" stroke="#8065F5" strokeWidth="2" />
            <circle cx="12" cy="7" r="1.2" fill="#A995FF" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-[#F5F5FA] ${textSize}`}>
              Code<span className="text-[#A995FF]">Forge</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30">
              Luau
            </span>
          </div>
          <span className="text-[10px] text-[#9699AC] mt-0.5 font-medium tracking-wide">
            Roblox Toolkit
          </span>
        </div>
      )}
    </div>
  );
};
