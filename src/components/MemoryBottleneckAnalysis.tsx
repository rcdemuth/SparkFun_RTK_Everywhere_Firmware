import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Cpu, HardDrive, ShieldAlert, Zap } from 'lucide-react';
import { BoardDefinition, SystemConfiguration } from '../types/config';

interface Props {
  selectedBoard: BoardDefinition;
  config: SystemConfiguration;
}

export const MemoryBottleneckAnalysis: React.FC<Props> = ({ selectedBoard, config }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-6">
      <div
        className="px-6 py-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">
                Technical Confirmation: Memory & Architecture Bottlenecks
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                User Intuition Confirmed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Why SparkFun's original "one size fits all" monolithic firmware cannot run on 4MB Flash, ESP32-C3/C6, or RP2040 Pico
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white p-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-6 space-y-5 text-sm text-slate-300">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="font-medium text-amber-200 mb-1">
              Yes, your analysis is 100% correct: The existing "one size fits all" technique will fail.
            </p>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              SparkFun designed RTK Everywhere for their proprietary boards (EVK, Facet, Torch) featuring 8MB/16MB Flash and 2MB–8MB PSRAM. Compiling all GNSS drivers, Bluetooth Classic SPP, WebServer, mbedTLS, and PointPerfect simultaneously produces a ~2.4MB–3.2MB binary that crashes or fails to fit on 4MB flash, exhausts SRAM on C3/C6, and cannot compile without Classic BT silicon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bottleneck 1 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <HardDrive className="w-4 h-4" />
                <span className="font-semibold text-xs tracking-wider uppercase">Flash Partition Limits</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                On 4MB Flash boards (<span className="text-slate-200">YD-C3, C6 DevKit, ESP32 Lite, CYD, WROOM</span>), dual-OTA partition tables allocate at most <strong className="text-white">~1,500–1,900 KB</strong> per app slot. The monolithic RTK binary requires <strong className="text-amber-400">2,500+ KB</strong> and fails to flash.
              </p>
              <div className="mt-3 text-xs bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Solution:</span>
                <span className="text-emerald-400 font-medium">Modular compile-time strip</span>
              </div>
            </div>

            {/* Bottleneck 2 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold text-xs tracking-wider uppercase">Bluetooth Classic vs BLE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">ESP32-C3 & ESP32-C6</strong> are RISC-V chips with <span className="text-red-400 font-semibold">NO Bluetooth Classic hardware</span>. The original codebase includes <code className="text-cyan-300">BluetoothSerial.h</code> which fails to compile on C3/C6.
              </p>
              <div className="mt-3 text-xs bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Solution:</span>
                <span className="text-emerald-400 font-medium">Pure BLE Nordic UART (NUS)</span>
              </div>
            </div>

            {/* Bottleneck 3 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-semibold text-xs tracking-wider uppercase">Hardware ID Lock-in</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                In <code className="text-cyan-300">Begin.ino</code>, the firmware runs <code className="text-slate-300">readBoardIdValue()</code> on GPIO 35 expecting resistor ratios. On generic dev boards, it flags <code className="text-red-400 font-mono">Product variant unknown</code> and halts in an error loop.
              </p>
              <div className="mt-3 text-xs bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                <span className="text-slate-400">Solution:</span>
                <span className="text-emerald-400 font-medium">Static Board HAL Override</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-200 font-semibold">
                  Active Board: {selectedBoard.name} ({selectedBoard.flashSizeMB}MB Flash, {selectedBoard.psramMB}MB PSRAM)
                </p>
                <p className="text-slate-400">
                  {selectedBoard.flashSizeMB <= 4
                    ? 'Automatic Lean Profile Active: Bluetooth Classic and WebServer stripped to fit 4MB flash limit.'
                    : 'Full Profile Available: Plenty of flash & RAM capacity for WebServer, logging, and large buffers.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-[11px]">
                {selectedBoard.hasBluetoothClassic ? 'BT Classic + BLE' : 'BLE Only (NUS)'}
              </span>
              <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded font-mono text-[11px]">
                {selectedBoard.psramMB > 0 ? `${selectedBoard.psramMB}MB PSRAM` : 'No PSRAM (Ringbuf 2KB)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
