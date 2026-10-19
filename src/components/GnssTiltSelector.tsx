import React, { useState } from 'react';
import { Compass, Navigation, Radio, Check, Sparkles, Sliders, Info, ShieldCheck, Terminal } from 'lucide-react';
import { GnssChipDefinition, GnssChipId, SystemConfiguration } from '../types/config';
import { GNSS_MODULES } from '../data/gnssModules';

interface Props {
  selectedGnss: GnssChipDefinition;
  onSelectGnss: (gnss: GnssChipDefinition) => void;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const GnssTiltSelector: React.FC<Props> = ({
  selectedGnss,
  onSelectGnss,
  config,
  onChangeConfig,
}) => {
  const [simulatedAngle, setSimulatedAngle] = useState<number>(24);

  const handleTiltToggle = (enabled: boolean) => {
    onChangeConfig({
      ...config,
      tilt: {
        ...config.tilt,
        enabled,
      },
    });
  };

  const handlePoleHeightChange = (height: number) => {
    onChangeConfig({
      ...config,
      tilt: {
        ...config.tilt,
        poleHeightMeters: height,
      },
    });
  };

  // Math simulation for tilt compensation at simulatedAngle
  const poleH = config.tilt.poleHeightMeters;
  const rad = (simulatedAngle * Math.PI) / 180;
  const uncompensatedOffsetMeters = poleH * Math.sin(rad);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-400" />
          GNSS Receiver & Onboard IMU Tilt Correction Engine
        </h3>
        <p className="text-xs text-slate-400">
          Select your RTK GNSS chip and configure native onboard IMU tilt surveying parameters
        </p>
      </div>

      {/* GNSS Chips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {GNSS_MODULES.map((gnss) => {
          const isSelected = gnss.id === selectedGnss.id;
          return (
            <div
              key={gnss.id}
              onClick={() => onSelectGnss(gnss)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="text-[10px] text-slate-400 font-mono">
                  {gnss.manufacturer}
                </span>
                {gnss.hasOnboardIMU ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Onboard IMU
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-slate-800 text-slate-400">
                    Standard RTK
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-sm text-white mb-1 leading-snug">
                {gnss.name}
              </h4>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                {gnss.bands}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                <span className="font-mono text-cyan-300">{gnss.baudRate} baud</span>
                {isSelected && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tilt Correction Deep Configuration Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-lg border ${
                config.tilt.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-semibold text-white">
                  3D Tilt Compensation Engine
                </h4>
                {selectedGnss.hasOnboardIMU && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Native GNSS-Onboard INS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {selectedGnss.hasOnboardIMU
                  ? `Utilizes ${selectedGnss.name}'s internal 6-axis MEMS IMU for real-time survey pole angle correction up to 60°`
                  : 'Requires external IMU co-processor (IM19, BNO085, or ICM-20948) communicating over I2C/UART'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.tilt.enabled}
              onChange={(e) => handleTiltToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span className="ml-3 text-xs font-semibold text-slate-200">
              {config.tilt.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {config.tilt.enabled ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Parameters column */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pole Height */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium">Pole Height (Meters)</label>
                    <span className="text-cyan-400 font-mono font-semibold">
                      {config.tilt.poleHeightMeters.toFixed(2)} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={config.tilt.poleHeightMeters}
                    onChange={(e) => handlePoleHeightChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.50m (Handheld)</span>
                    <span>1.80m (Standard)</span>
                    <span>2.00m (Range pole)</span>
                  </div>
                </div>

                {/* Max Tilt Angle Limit */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium">Max Survey Tilt Angle</label>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {config.tilt.maxTiltAngleDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={config.tilt.maxTiltAngleDeg}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        tilt: { ...config.tilt, maxTiltAngleDeg: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-emerald-500 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15° (Strict)</span>
                    <span>30° (Nominal)</span>
                    <span>60° (Maximum)</span>
                  </div>
                </div>
              </div>

              {/* Antenna Lever Arm Offsets (X, Y, Z in meters) */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200">
                    Antenna Phase Center (APC) Lever Arm Offsets
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Offset between IMU center and antenna phase center
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Offset X (m)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.tilt.leverArmX}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          tilt: { ...config.tilt, leverArmX: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Offset Y (m)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.tilt.leverArmY}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          tilt: { ...config.tilt, leverArmY: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Offset Z (m)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={config.tilt.leverArmZ}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          tilt: { ...config.tilt, leverArmZ: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calibration & Initialization mode */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-slate-200">
                      Shake-to-Align / Auto Rock Initializer
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.tilt.autoRockCalibration}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        tilt: { ...config.tilt, autoRockCalibration: e.target.checked },
                      })
                    }
                    className="accent-emerald-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When RTK Fix is locked, swinging or walking the survey pole back and forth initializes the Kalman IMU attitude filter automatically without magnetic compass calibration.
                </p>
              </div>

              {/* Native Commands preview */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Commands dispatched to {selectedGnss.name}:
                  </span>
                  <span className="text-[10px] text-emerald-400">Auto-configured</span>
                </div>
                <pre className="text-[11px] text-cyan-300/90 font-mono bg-slate-900/80 p-2.5 rounded overflow-x-auto leading-relaxed">
                  {selectedGnss.tiltCompensationCommands.enable.slice(0, 4).join('\n')}
                  {'\n' + selectedGnss.tiltCompensationCommands.setPoleHeight(config.tilt.poleHeightMeters)}
                  {selectedGnss.tiltCompensationCommands.setLeverArm
                    ? '\n' +
                      selectedGnss.tiltCompensationCommands.setLeverArm(
                        config.tilt.leverArmX,
                        config.tilt.leverArmY,
                        config.tilt.leverArmZ
                      )
                    : ''}
                </pre>
              </div>
            </div>

            {/* Interactive 3D / Geometric Tilt Visualization */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-200">Tilt Geometry Simulation</span>
                <span className="font-mono text-cyan-400">Angle: {simulatedAngle}°</span>
              </div>

              {/* Graphical Canvas / SVG Diagram */}
              <div className="relative w-full h-56 flex items-center justify-center bg-slate-900/60 rounded-lg border border-slate-800/80 overflow-hidden">
                <svg viewBox="0 0 280 200" className="w-full h-full">
                  {/* Ground line */}
                  <line x1="20" y1="170" x2="260" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="210" y="185" fill="#64748b" fontSize="9" fontFamily="monospace">
                    GROUND
                  </text>

                  {/* Pole tip on ground (Compensated Target point) */}
                  <circle cx="140" cy="170" r="5" fill="#10b981" />
                  <circle cx="140" cy="170" r="10" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="140" y="192" fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Pole Tip (Target Point)
                  </text>

                  {/* Vertical reference line */}
                  <line x1="140" y1="170" x2="140" y2="35" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Tilted pole */}
                  {(() => {
                    const poleLen = 125;
                    const topX = 140 + Math.sin(rad) * poleLen;
                    const topY = 170 - Math.cos(rad) * poleLen;
                    return (
                      <g>
                        {/* Pole body */}
                        <line
                          x1="140"
                          y1="170"
                          x2={topX}
                          y2={topY}
                          stroke="#38bdf8"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Antenna at top */}
                        <circle cx={topX} cy={topY} r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                        <circle cx={topX} cy={topY} r="3" fill="#ffffff" />
                        <text x={topX + 12} y={topY + 3} fill="#bae6fd" fontSize="9" fontWeight="bold">
                          Antenna (Raw GNSS)
                        </text>

                        {/* Horizontal error projection vector */}
                        <line
                          x1="140"
                          y1={topY}
                          x2={topX}
                          y2={topY}
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                        <text
                          x={(140 + topX) / 2}
                          y={topY - 6}
                          fill="#f87171"
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          Error: +{(uncompensatedOffsetMeters * 100).toFixed(1)} cm
                        </text>

                        {/* Angle arc */}
                        <path
                          d={`M 140 120 A 50 50 0 0 1 ${140 + Math.sin(rad) * 50} ${170 - Math.cos(rad) * 50}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                        />
                        <text x="148" y="115" fill="#fbbf24" fontSize="9" fontWeight="bold">
                          {simulatedAngle}°
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Slider to interact with angle */}
              <div className="w-full mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Simulate Tilt Angle:</span>
                  <span className="font-mono text-amber-400 font-semibold">{simulatedAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simulatedAngle}
                  onChange={(e) => setSimulatedAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800"
                />
              </div>

              {/* Impact readouts */}
              <div className="w-full mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-slate-500 block">Raw Antenna Drift:</span>
                  <span className="text-red-400 font-mono font-bold">
                    {(uncompensatedOffsetMeters * 100).toFixed(1)} cm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Compensated Pole Tip:</span>
                  <span className="text-emerald-400 font-mono font-bold">&lt; 1.5 cm RTK</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
            Tilt compensation is currently turned off. The GNSS antenna must be held strictly plumb/vertical (bubble centered) over the survey point.
          </div>
        )}
      </div>
    </div>
  );
};
