import React from 'react';
import { Radio, Wifi, Bluetooth, Cast, Satellite, ToggleLeft, ToggleRight, Layers, Database } from 'lucide-react';
import { BoardDefinition, SystemConfiguration } from '../types/config';

interface Props {
  selectedBoard: BoardDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const RoleAndComms: React.FC<Props> = ({
  selectedBoard,
  config,
  onChangeConfig,
}) => {
  const isC3orC6 = selectedBoard.family === 'esp32-c3' || selectedBoard.family === 'esp32-c6';

  return (
    <div className="space-y-6">
      {/* Role Toggle: Rover vs Base */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Satellite className="w-5 h-5 text-cyan-400" />
              Operating Role Selection: Station (Base) vs Rover
            </h3>
            <p className="text-xs text-slate-400">
              Toggle RTK operating personality. Dynamically adjusts data routing and correction feeds.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onChangeConfig({ ...config, deviceRole: 'rover' })}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                config.deviceRole === 'rover'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rover (GIS Collector)
            </button>
            <button
              onClick={() => onChangeConfig({ ...config, deviceRole: 'base' })}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                config.deviceRole === 'base'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Station (RTK Base)
            </button>
          </div>
        </div>

        {config.deviceRole === 'rover' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-300 block">Correction Influx:</span>
              <p className="text-slate-400 leading-relaxed">
                Rover receives RTCM3 corrections from Phone (via NTRIP Client over BLE/WiFi) or local LoRa radio, pushes RTCM to GNSS RX, and reads tilt-compensated NMEA GGA/RMC back to the data collector.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="ntripClientToggle"
                  checked={config.features.enableNtripClient}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      features: { ...config.features, enableNtripClient: e.target.checked },
                    })
                  }
                  className="accent-cyan-500"
                />
                <label htmlFor="ntripClientToggle" className="text-slate-300 cursor-pointer">
                  Enable In-Firmware NTRIP Client (Connects direct to WiFi Hotspot)
                </label>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-300 block">GIS Software Compatibility:</span>
              <p className="text-slate-400 leading-relaxed">
                Connects out-of-the-box with SW Maps, QField, ArcGIS Field Maps, Survey123, SurvPC, and Lefebure GPS via standard Bluetooth NMEA streams.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                <label className="text-slate-300 font-medium block mb-1">Base Mode</label>
                <select
                  value={config.baseConfig.mode}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      baseConfig: {
                        ...config.baseConfig,
                        mode: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="survey_in">Survey-In (Auto-converge)</option>
                  <option value="fixed_llh">Fixed Coordinates (Geodetic Lat/Lon/Alt)</option>
                  <option value="fixed_ecef">Fixed Coordinates (ECEF X/Y/Z)</option>
                </select>
              </div>

              {config.baseConfig.mode === 'survey_in' ? (
                <>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium block mb-1">Target Accuracy (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.baseConfig.surveyInAccuracyMeters}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          baseConfig: {
                            ...config.baseConfig,
                            surveyInAccuracyMeters: parseFloat(e.target.value) || 1.5,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium block mb-1">Min Duration (Sec)</label>
                    <input
                      type="number"
                      value={config.baseConfig.surveyInDurationSec}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          baseConfig: {
                            ...config.baseConfig,
                            surveyInDurationSec: parseInt(e.target.value) || 120,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium block mb-1">Fixed Latitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={config.baseConfig.fixedLat}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          baseConfig: { ...config.baseConfig, fixedLat: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <label className="text-slate-300 font-medium block mb-1">Fixed Longitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={config.baseConfig.fixedLon}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          baseConfig: { ...config.baseConfig, fixedLon: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Broadcast Outlets */}
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ntripServerToggle"
                  checked={config.baseConfig.ntripServerEnabled}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      baseConfig: { ...config.baseConfig, ntripServerEnabled: e.target.checked },
                    })
                  }
                  className="accent-purple-500"
                />
                <label htmlFor="ntripServerToggle" className="text-slate-300 cursor-pointer font-medium">
                  Push RTCM to NTRIP Caster (e.g. RTK2Go, Emlid, custom)
                </label>
              </div>

              {selectedBoard.hasLoRa && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="loraBroadcastToggle"
                    checked={config.baseConfig.loraBroadcastEnabled}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        baseConfig: { ...config.baseConfig, loraBroadcastEnabled: e.target.checked },
                      })
                    }
                    className="accent-purple-500"
                  />
                  <label htmlFor="loraBroadcastToggle" className="text-slate-300 cursor-pointer font-medium">
                    Broadcast RTCM over LoRa Radio (915/868 MHz)
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wireless & Communication Protocol */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-indigo-400" />
          Wireless Link & Mobile Bridge Protocol
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* BLE Only */}
          <div
            onClick={() => onChangeConfig({ ...config, btMode: 'ble_only' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
              config.btMode === 'ble_only'
                ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-cyan-300">BLE UART (NUS)</span>
              {isC3orC6 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Required on {selectedBoard.family.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Compatible with all ESP32 chips (C3, C6, S3, Classic). Low power, iOS and Android native.
            </p>
          </div>

          {/* Classic SPP */}
          <div
            onClick={() => {
              if (selectedBoard.hasBluetoothClassic) {
                onChangeConfig({ ...config, btMode: 'classic_spp' });
              }
            }}
            className={`p-3.5 rounded-xl border text-left transition ${
              !selectedBoard.hasBluetoothClassic
                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                : config.btMode === 'classic_spp'
                ? 'bg-blue-950/50 border-blue-500 text-white shadow-sm cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-blue-300">Classic Bluetooth SPP</span>
              {!selectedBoard.hasBluetoothClassic && (
                <span className="text-[10px] text-red-400 font-mono">No Hardware</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Standard serial port profile. High streaming throughput on classic ESP32. Unsupported on C3/C6/S3.
            </p>
          </div>

          {/* Dual SPP + BLE */}
          <div
            onClick={() => {
              if (selectedBoard.hasBluetoothClassic) {
                onChangeConfig({ ...config, btMode: 'ble_and_spp' });
              }
            }}
            className={`p-3.5 rounded-xl border text-left transition ${
              !selectedBoard.hasBluetoothClassic
                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                : config.btMode === 'ble_and_spp'
                ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-indigo-300">Dual Mode (SPP + BLE)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simultaneous SPP and BLE advertisement. Requires 8MB flash and high RAM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
