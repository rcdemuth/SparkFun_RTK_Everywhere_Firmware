import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  DollarSign,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Zap,
  Sparkles,
  Layers,
  Radio,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { GNSS_MODULES } from '../data/gnssModules';
import { BOARDS } from '../data/boards';
import { GnssChipDefinition, BoardDefinition } from '../types/config';

interface Props {
  onSelectCombo: (board: BoardDefinition, gnss: GnssChipDefinition) => void;
}

export const HardwareCatalogModal: React.FC<Props> = ({ onSelectCombo }) => {
  const [activeTab, setActiveTab] = useState<'combos' | 'gnss' | 'boards'>('combos');

  const combos = [
    {
      title: 'The Sub-$50 Complete Handheld RTK Rover',
      badge: 'Best Ultra-Budget',
      boardId: 'cyd-esp32-2432s028',
      gnssId: 'lc29h',
      totalCost: '~$45 - $55',
      description:
        'Combines the 2.8" Cheap Yellow Display (ESP32 + touchscreen + SD card) with the Quectel LC29H dual-frequency RTK module. Full standalone color GUI with Bluetooth streaming to SW Maps or QField on your phone.',
      whyItWorks:
        'The CYD already has a 240x320 color screen, SD card slot, and power circuitry. Adding a $30 LC29H gives you centimeter-level precision with zero extra enclosures needed.',
    },
    {
      title: 'Pro Tilt-Compensated Survey Wand',
      badge: 'Best Value Tilt RTK',
      boardId: 'cyd-esp32-2432s028',
      gnssId: 'um981',
      totalCost: '~$90 - $115',
      description:
        'Pairs the CYD 2.8" touch display with the Unicore UM981 integrated 6-axis MEMS IMU. Provides calibration-free 60° pole tilt surveying directly at the rod tip with a live spirit bubble level on screen.',
      whyItWorks:
        'Commercial tilt-compensated survey rovers (Trimble, Leica, Emlid Reach RX) cost $2,500 to $8,000+. This hardware pairing delivers the exact same sub-2cm pole-tip math for under $120.',
    },
    {
      title: 'Long-Range 15km LoRa RTCM Base Station',
      badge: 'Best Standalone Base',
      boardId: 'lilygo-lora32-v21',
      gnssId: 'skytraq_px1172r',
      totalCost: '~$60 - $75',
      description:
        'LILYGO LoRa32 ESP32 with Semtech SX1276 radio and OLED screen paired with Skytraq PX1172R triple-band GNSS. Automatically surveys-in and broadcasts RTCM 3.3 corrections across up to 15 km line-of-sight without cellular fees.',
      whyItWorks:
        'No cellular SIM card or monthly NTRIP fees required. Perfect for farm equipment, construction sites, and remote drone surveys.',
    },
    {
      title: 'All-Day Field Wand with Swappable 18650',
      badge: 'Best Outdoor Ruggedness',
      boardId: 'lilygo-t-beam-supreme',
      gnssId: 'um981',
      totalCost: '~$115 - $145',
      description:
        'LILYGO T-Beam Supreme (ESP32-S3, onboard 18650 battery holder, AXP2101 power gauge, SX1262 LoRa, 8MB PSRAM) + UM981 with onboard IMU. Swap standard 18650 cells in the field for unlimited runtime.',
      whyItWorks:
        '18650 batteries are cheap and universally available. The AXP2101 power IC handles charging and voltage regulation safely.',
    },
    {
      title: 'Thumb-Sized Antenna-Cap Rover Node',
      badge: 'Smallest Footprint',
      boardId: 'seeed-xiao-esp32-s3',
      gnssId: 'quectel_lg69t',
      totalCost: '~$50 - $65',
      description:
        'Thumb-sized Seeed Studio XIAO ESP32-S3 (21x17.5mm) paired with the Quectel LG69T dual-band module with integrated IMU. Weighs under 30g and fits directly inside a helical antenna hat or drone gimbal.',
      whyItWorks:
        'Extreme miniaturization with 8MB Flash and 8MB PSRAM. Connects to your phone over Nordic UART Service (NUS) BLE.',
    },
    {
      title: 'Turnkey Rugged Field Terminal (No 3D Printing)',
      badge: 'Finished Industrial Case',
      boardId: 'm5stack-cores3',
      gnssId: 'commnav_k827_k922',
      totalCost: '~$160 - $220',
      description:
        'M5Stack CoreS3 (injection-molded industrial enclosure, 2.0" capacitive touch screen, internal battery, speaker, RTC, microSD) + ComNav K827 SinoGNSS IMU board connected via Grove port.',
      whyItWorks:
        'Provides an off-the-shelf, waterproof/dust-resistant handheld unit without needing a 3D printer.',
    },
  ];

  const handleApplyCombo = (boardId: string, gnssId: string) => {
    const b = BOARDS.find((x) => x.id === boardId);
    const g = GNSS_MODULES.find((x) => x.id === gnssId);
    if (b && g) {
      onSelectCombo(b, g);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Hardware Catalog & Low-Cost RTK Ecosystem Guide
          </h2>
          <p className="text-xs text-slate-400">
            Compare budget RTK GNSS chipsets and the best wireless controller boards with transparent pricing and real-world pros/cons.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('combos')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'combos' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recommended Combos
          </button>
          <button
            onClick={() => setActiveTab('gnss')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'gnss' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RTK GNSS Modules
          </button>
          <button
            onClick={() => setActiveTab('boards')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'boards' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Controller Boards
          </button>
        </div>
      </div>

      {/* COMBOS VIEW */}
      {activeTab === 'combos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map((combo, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {combo.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {combo.totalCost}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white leading-snug">
                  {combo.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {combo.description}
                </p>

                <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <strong className="text-slate-200 block">Why this hardware works:</strong>
                  <p>{combo.whyItWorks}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {combo.boardId.split('-')[0].toUpperCase()} + {combo.gnssId.toUpperCase()}
                </span>
                <button
                  onClick={() => handleApplyCombo(combo.boardId, combo.gnssId)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Load Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GNSS MODULES COMPARISON TABLE */}
      {activeTab === 'gnss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">GNSS Chipset</th>
                  <th className="py-3 px-4">Est. Price</th>
                  <th className="py-3 px-4">Bands & Constellations</th>
                  <th className="py-3 px-4">Tilt / IMU Engine</th>
                  <th className="py-3 px-4">Protocol</th>
                  <th className="py-3 px-4">Key Advantages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {GNSS_MODULES.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{mod.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{mod.manufacturer}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {mod.costRangeUSD || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300 max-w-xs">
                      {mod.bands}
                    </td>
                    <td className="py-3 px-4">
                      {mod.hasOnboardIMU ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Onboard IMU (Native 60°)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">External IMU Required</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                      {mod.protocol}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {mod.pros?.slice(0, 2).join(' • ') || mod.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTROLLER BOARDS COMPARISON TABLE */}
      {activeTab === 'boards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Board Name</th>
                  <th className="py-3 px-4">Architecture</th>
                  <th className="py-3 px-4">Flash / RAM</th>
                  <th className="py-3 px-4">Wireless</th>
                  <th className="py-3 px-4">Peripherals</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {BOARDS.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{b.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{b.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {b.family.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {b.flashSizeMB}MB / {b.psramMB > 0 ? `${b.psramMB}MB PSRAM` : 'No PSRAM'}
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div className="flex flex-wrap gap-1">
                        {b.hasBluetoothClassic && <span className="text-blue-400">BT Classic</span>}
                        {b.hasBLE && <span className="text-cyan-400">BLE</span>}
                        {b.hasWiFi && <span className="text-slate-400">Wi-Fi</span>}
                        {b.hasLoRa && <span className="text-indigo-400 font-bold">LoRa</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">
                      {b.hasDisplay ? b.displayResolution : 'None'}
                      {b.hasTouch ? ' (Touch)' : ''}
                      {b.hasMicroSD ? ' + SD' : ''}
                      {b.hasBatteryMgmt ? ' + Chg' : ''}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {b.costRangeUSD || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {b.recommendedRole === 'rover' ? 'Field Rover' : b.recommendedRole === 'base' ? 'Base Station' : 'Rover or Base'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
