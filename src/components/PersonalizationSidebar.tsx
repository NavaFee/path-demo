'use client';

import { useState } from 'react';
import { PROTOCOLS, ProtocolInfo } from '@/config/icons';
import IconImage from './IconImage';

interface PersonalizationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizationSidebar({ isOpen, onClose }: PersonalizationSidebarProps) {
  const [protocols, setProtocols] = useState<ProtocolInfo[]>(PROTOCOLS);
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);

  const toggleProtocol = (id: string) => {
    setProtocols(prev => 
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const updateProtocolConfig = (id: string, field: keyof ProtocolInfo, value: number) => {
    setProtocols(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedProtocol(prev => prev === id ? null : id);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[420px] bg-zinc-950 border-l border-white/10 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-6 flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Personalization</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <span className="material-icons-outlined text-sm">close</span>
            </button>
          </div>

          {/* Section Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="material-icons-outlined text-white text-sm">link</span>
            </div>
            <span className="text-sm font-medium text-white">Base Protocols</span>
          </div>

          {/* Protocol List */}
          <div className="flex-1 space-y-2">
            {protocols.map((protocol) => (
              <div key={protocol.id} className="bg-zinc-900/60 border border-white/5 rounded-xl overflow-hidden">
                {/* Protocol Row */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(protocol.id)}
                >
                  <div className="flex items-center gap-3">
                    <IconImage 
                      src={protocol.icon}
                      fallbackText={protocol.iconFallback}
                      fallbackColor={protocol.color}
                      alt={protocol.name}
                      size={36}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{protocol.name}</span>
                        <span className="material-icons-outlined text-slate-500 text-[14px]">open_in_new</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{protocol.apr.toFixed(2)}% APR</span>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProtocol(protocol.id);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      protocol.enabled ? 'bg-primary' : 'bg-zinc-700'
                    }`}
                  >
                    <div 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        protocol.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded Config */}
                {expandedProtocol === protocol.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4 animate-fade-in">
                    {/* Max Allocation */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-slate-400">Max Allocation</span>
                        <span className="text-[11px] text-primary font-mono">{protocol.maxAllocation}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={protocol.maxAllocation}
                        onChange={(e) => updateProtocolConfig(protocol.id, 'maxAllocation', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Min APR */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-slate-400">Min APR Threshold</span>
                        <span className="text-[11px] text-primary font-mono">{protocol.minAPR.toFixed(1)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value={protocol.minAPR}
                        onChange={(e) => updateProtocolConfig(protocol.id, 'minAPR', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Min TVL */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-slate-400">Min TVL (Millions)</span>
                        <span className="text-[11px] text-primary font-mono">${protocol.minTVL}M</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        step="10"
                        value={protocol.minTVL}
                        onChange={(e) => updateProtocolConfig(protocol.id, 'minTVL', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex gap-3">
            <span className="material-icons-outlined text-slate-500 text-sm mt-0.5">info</span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Note: the more protocols are enabled, the more <span className="text-primary">performant</span> the agent will be.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
