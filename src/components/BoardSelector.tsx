import React, { useState } from 'react';
import { Cpu, HardDrive, Radio, Monitor, BatteryCharging, Check, Layers, Search } from 'lucide-react';
import { BoardDefinition, ChipFamily } from '../types/config';
import { BOARDS } from '../data/boards';

interface Props {
  selectedBoard: BoardDefinition;
  onSelectBoard: (board: BoardDefinition) => void;
}

export const BoardSelector: React.FC<Props> = ({ selectedBoard, onSelectBoard }) => {
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBoards = BOARDS.filter((b) => {
    const matchesFamily = filterFamily === 'all' || b.family === filterFamily;
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.family.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Controller Board Matrix (16 Target Boards)
          </h3>
          <p className="text-xs text-slate-400">
            Select your microcontroller development board to configure pin routing and memory parameters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {['all', 'esp32', 'esp32-s3', 'esp32-c3', 'esp32-c6', 'rp2040'].map((fam) => (
              <button
                key={fam}
                onClick={() => setFilterFamily(fam)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  filterFamily === fam
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fam.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBoards.map((board) => {
          const isSelected = board.id === selectedBoard.id;
          return (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    board.family === 'esp32-s3'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                      : board.family === 'esp32-c3'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : board.family === 'esp32-c6'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : board.family === 'rp2040'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-blue-950/80 text-blue-300 border-blue-800'
                  }`}
                >
                  {board.family}
                </span>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    {board.flashSizeMB}MB Flash
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-sm text-white mb-1.5 leading-snug line-clamp-1">
                {board.name}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {board.notes}
              </p>

              {/* Hardware feature badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300">
                <span className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 flex items-center gap-1">
                  <HardDrive className="w-2.5 h-2.5 text-cyan-400" />
                  {board.flashSizeMB}MB Flash
                </span>

                <span className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-purple-400" />
                  {board.psramMB > 0 ? `${board.psramMB}MB PSRAM` : 'No PSRAM'}
                </span>

                {board.hasDisplay && (
                  <span className="px-1.5 py-0.5 bg-amber-950/50 text-amber-300 rounded border border-amber-800 flex items-center gap-1">
                    <Monitor className="w-2.5 h-2.5" />
                    {board.displayResolution ?? 'Display'}
                    {board.hasTouch ? ' Touch' : ''}
                  </span>
                )}

                {board.hasLoRa && (
                  <span className="px-1.5 py-0.5 bg-indigo-950/50 text-indigo-300 rounded border border-indigo-800 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5" />
                    LoRa
                  </span>
                )}

                {board.hasBatteryMgmt && (
                  <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-300 rounded border border-emerald-800 flex items-center gap-1">
                    <BatteryCharging className="w-2.5 h-2.5" />
                    LiPo Chg
                  </span>
                )}
              </div>

              {/* Default GNSS UART Pins */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>GNSS UART:</span>
                <span className="font-mono text-cyan-300">
                  TX: GPIO{board.defaultPins.gnssTx} | RX: GPIO{board.defaultPins.gnssRx}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
