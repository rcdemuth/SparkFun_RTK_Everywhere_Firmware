import React from 'react';
import { Satellite, Cpu, Navigation, AlertTriangle, ShieldCheck, HardDrive, Download } from 'lucide-react';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration } from '../types/config';
import { estimateMemoryBudget } from '../utils/codeGenerator';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  activeNav: string;
  setActiveNav: (nav: any) => void;
  onOpenExport: () => void;
}

export const Header: React.FC<Props> = ({
  selectedBoard,
  selectedGnss,
  config,
  activeNav,
  setActiveNav,
  onOpenExport,
}) => {
  const budget = estimateMemoryBudget(selectedBoard, config, selectedGnss);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Universal RTK Everywhere
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  v3.2 Modular
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-Board HAL & Onboard IMU Tilt Compensation Studio
              </p>
            </div>
          </div>

          {/* Memory Budget Monitor */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 gap-2">
                  <span>Flash:</span>
                  <span className={budget.flashPercent > 90 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {budget.estimatedFlashKB} / {budget.maxFlashKB} KB ({budget.flashPercent}%)
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className={`h-full ${
                      budget.flashPercent > 90
                        ? 'bg-red-500'
                        : budget.flashPercent > 75
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${budget.flashPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-800"></div>

            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 gap-2">
                  <span>RAM:</span>
                  <span className="text-slate-200">
                    {budget.estimatedRamKB} / {budget.maxRamKB} KB ({budget.ramPercent}%)
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${budget.ramPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {budget.status === 'safe' ? (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Fits Target
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                <AlertTriangle className="w-3 h-3" /> Budget Warning
              </span>
            )}
          </div>

          {/* Export Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenExport}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/20 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get JSON & Headers</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex space-x-1 border-t border-slate-800/80 overflow-x-auto py-1 text-xs">
          {[
            { id: 'builder', label: 'Hardware Configurator' },
            { id: 'catalog', label: 'Ecosystem & Low-Cost Guide' },
            { id: 'cyd_simulator', label: 'CYD Touchscreen UI' },
            { id: 'live_console', label: 'Live GNSS & Serial' },
            { id: 'code_export', label: 'Code & JSON Export' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                activeNav === tab.id
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
