import React from 'react';
import {
  Radio,
  Wifi,
  Bluetooth,
  Cast,
  Satellite,
  ToggleLeft,
  ToggleRight,
  Layers,
  Database,
  Smartphone,
  Sliders,
  RefreshCw,
  HardDrive,
  Cpu,
  Zap,
  Globe,
  RadioTower,
  Share2,
} from 'lucide-react';
import {
  BoardDefinition,
  SystemConfiguration,
  RoverCorrectionSource,
  BaseCorrectionBroadcast,
  DataCollectorOutput,
  DefaultWifiMode,
} from '../types/config';

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

  const defaultComms = config.defaultComms || {
    roverCorrectionSource: 'ntrip_wifi',
    baseCorrectionBroadcast: 'ntrip_caster',
    dataCollectorOutput: 'bluetooth_spp',
    wifiMode: 'ap_config',
    allowInFieldProtocolSwitching: true,
  };

  const updateDefaultComms = (partial: Partial<typeof defaultComms>) => {
    onChangeConfig({
      ...config,
      defaultComms: {
        ...defaultComms,
        ...partial,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Default Role & Dual-Role In-Field Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Satellite className="w-5 h-5 text-cyan-400" />
                Default Operating Role & Dynamic In-Field Switching
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Dual-Role State Machine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sets the <strong className="text-slate-200">default power-on personality</strong> (Rover vs Base). The firmware compiles dual-role capability so you can <strong className="text-cyan-300">switch anytime in the field</strong> without reflashing.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Default Boot Role:
            </span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => onChangeConfig({ ...config, deviceRole: 'rover' })}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                  config.deviceRole === 'rover'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rover (Default)
              </button>
              <button
                onClick={() => onChangeConfig({ ...config, deviceRole: 'base' })}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                  config.deviceRole === 'base'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Station / Base (Default)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic In-Field Switching Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span className="font-semibold text-xs text-emerald-300">
                Enable In-Field Dynamic Role Switching (Runtime NVS Storage)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowDynamicRoleSwitch !== false}
                onChange={(e) =>
                  onChangeConfig({ ...config, allowDynamicRoleSwitch: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            When enabled, the compiled firmware maintains both Rover and Base algorithms in flash. Changes made in the field are stored directly in <strong className="text-slate-200">ESP32 Non-Volatile Storage (Preferences / NVS)</strong> so the unit always reboots into your last selected role.
          </p>

          {/* 5 In-Field Switching Methods Available */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Supported In-Field Switching Interfaces:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <div>
                  <strong className="text-slate-200 block">Touchscreen / CYD Display:</strong>
                  <span className="text-slate-400">1-tap <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">[ROVER &lt;-&gt; BASE]</code> button on LCD status bar.</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start space-x-2">
                <span className="text-purple-400 font-bold">2.</span>
                <div>
                  <strong className="text-slate-200 block">WiFi Web Captive Portal:</strong>
                  <span className="text-slate-400">Join <code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">RTK Config</code> AP at <code className="text-purple-300 bg-slate-950 px-1 py-0.5 rounded">192.168.4.1</code> on your phone browser.</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <div>
                  <strong className="text-slate-200 block">Bluetooth / BLE CLI:</strong>
                  <span className="text-slate-400">Send ASCII <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">mode rover</code> or <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">mode base</code> from SW Maps or Terminal.</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start space-x-2">
                <span className="text-amber-400 font-bold">4.</span>
                <div>
                  <strong className="text-slate-200 block">OLED + Rotary / Button:</strong>
                  <span className="text-slate-400">Double-tap hardware setup button or rotate EC11 knob to <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">1) RTK Mode</code>.</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start space-x-2 sm:col-span-2 lg:col-span-2">
                <span className="text-emerald-400 font-bold">5.</span>
                <div>
                  <strong className="text-slate-200 block">USB CDC / Hardware Serial Menu:</strong>
                  <span className="text-slate-400">Connect USB-C to laptop or OTG tablet at 115200 baud and type <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">menu</code> for interactive configuration.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Role Details & Default Fine-Tuning */}
        {config.deviceRole === 'rover' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-300 block">Default Rover Configuration:</span>
              <p className="text-slate-400 leading-relaxed">
                When booting in Rover mode, the receiver receives RTCM3 corrections, applies tilt compensation vectors from the IMU, and streams NMEA coordinates to your mobile data collector.
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

              {selectedBoard.family !== 'rp2040' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="roverEspNowToggle"
                    checked={config.features.enableEspNow}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        features: { ...config.features, enableEspNow: e.target.checked },
                      })
                    }
                    className="accent-cyan-500"
                  />
                  <label htmlFor="roverEspNowToggle" className="text-slate-300 cursor-pointer">
                    Enable ESP-NOW 2.4GHz RTCM Influx (Receive direct from nearby ESP32 Base up to ~250m)
                  </label>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-300 block">GIS Software Compatibility:</span>
              <p className="text-slate-400 leading-relaxed">
                Seamlessly connects out-of-the-box with SW Maps, QField, ArcGIS Field Maps, Survey123, SurvPC, and Lefebure GPS via standard Bluetooth NMEA streams.
              </p>
              {config.features.enableEspNow && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300">
                  ⚡ ESP-NOW Active: Listening for peer RTCM frames on 2.4GHz Wi-Fi MAC layer (Channel {config.features.espNowChannel || 1}).
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                <label className="text-slate-300 font-medium block mb-1">Base Calculation Mode</label>
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
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-300 block">Base RTCM Broadcast Outlets:</span>
              <div className="flex flex-wrap gap-4 items-center">
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

                {selectedBoard.family !== 'rp2040' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="espNowBroadcastToggle"
                      checked={config.baseConfig.espNowBroadcastEnabled || config.features.enableEspNow}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          baseConfig: { ...config.baseConfig, espNowBroadcastEnabled: e.target.checked },
                          features: { ...config.features, enableEspNow: e.target.checked },
                        })
                      }
                      className="accent-purple-500"
                    />
                    <label htmlFor="espNowBroadcastToggle" className="text-slate-300 cursor-pointer font-medium">
                      Broadcast RTCM over ESP-NOW 2.4GHz (Zero-config connectionless packets)
                    </label>
                  </div>
                )}

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
          </div>
        )}
      </div>

      {/* 2. Default Communication Protocols & In-Field Modifiability */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <RadioTower className="w-5 h-5 text-indigo-400" />
                Default Communication Protocols & In-Field Modification
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Runtime Configurable
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure initial protocol defaults. If cellular or WiFi drops out during fieldwork, you can <strong className="text-indigo-300">switch protocols in the field</strong> (e.g. flip from NTRIP to LoRa or ESP-NOW) via the web portal or display.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="allowInFieldProtocolSwitchingToggle"
              checked={defaultComms.allowInFieldProtocolSwitching !== false}
              onChange={(e) =>
                updateDefaultComms({ allowInFieldProtocolSwitching: e.target.checked })
              }
              className="accent-indigo-500"
            />
            <label
              htmlFor="allowInFieldProtocolSwitchingToggle"
              className="text-xs text-slate-300 cursor-pointer font-medium"
            >
              Allow In-Field Protocol Switching
            </label>
          </div>
        </div>

        {/* 4 Protocol Matrix Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rover Correction Influx */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Rover Influx
              </span>
              <span className="text-[10px] text-slate-500">Default Source</span>
            </div>
            <select
              value={defaultComms.roverCorrectionSource}
              onChange={(e) =>
                updateDefaultComms({
                  roverCorrectionSource: e.target.value as RoverCorrectionSource,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ntrip_wifi">NTRIP via WiFi / Hotspot</option>
              <option value="esp_now">ESP-NOW 2.4GHz (Direct peer)</option>
              <option value="lora_radio">LoRa Radio (915/868 MHz)</option>
              <option value="bt_bridge">Bluetooth App Bridge (Lefebure/SW)</option>
              <option value="serial_radio">External Serial / UHF Radio</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Primary corrections channel when operating as Rover. Can be hot-swapped in the field.
            </p>
          </div>

          {/* Base RTCM Egress */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Cast className="w-3.5 h-3.5" /> Base Broadcast
              </span>
              <span className="text-[10px] text-slate-500">Default Egress</span>
            </div>
            <select
              value={defaultComms.baseCorrectionBroadcast}
              onChange={(e) =>
                updateDefaultComms({
                  baseCorrectionBroadcast: e.target.value as BaseCorrectionBroadcast,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ntrip_caster">NTRIP Caster (RTK2Go/Server)</option>
              <option value="esp_now">ESP-NOW 2.4GHz Broadcast</option>
              <option value="lora_radio">LoRa Radio Broadcast</option>
              <option value="local_tcp">Local TCP/UDP Socket Server</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Channel used to push base corrections out to field rovers or cloud casters.
            </p>
          </div>

          {/* Data Collector Output */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> GIS App Output
              </span>
              <span className="text-[10px] text-slate-500">Phone Stream</span>
            </div>
            <select
              value={defaultComms.dataCollectorOutput}
              onChange={(e) =>
                updateDefaultComms({
                  dataCollectorOutput: e.target.value as DataCollectorOutput,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="bluetooth_spp">Classic Bluetooth SPP</option>
              <option value="ble">BLE Nordic UART (iOS/Android)</option>
              <option value="usb_serial">USB CDC Serial NMEA</option>
              <option value="tcp_server">WiFi TCP Server (Port 2948)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              How coordinates stream to QField, SW Maps, or Survey123 on your mobile device.
            </p>
          </div>

          {/* Default WiFi Mode */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> WiFi Boot Mode
              </span>
              <span className="text-[10px] text-slate-500">Default Power-on</span>
            </div>
            <select
              value={defaultComms.wifiMode}
              onChange={(e) =>
                updateDefaultComms({
                  wifiMode: e.target.value as DefaultWifiMode,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ap_config">Access Point (192.168.4.1 Portal)</option>
              <option value="station_client">Client (Auto-join Hotspot)</option>
              <option value="off">WiFi Off (Max battery life)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              In-field config portal or instant hotspot connection when powered on.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Physical Bluetooth Radio Subsystem */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-indigo-400" />
          Hardware Bluetooth Radio Subsystem
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
