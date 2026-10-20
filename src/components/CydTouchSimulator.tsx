import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Battery,
  Wifi,
  Bluetooth,
  Compass,
  CheckCircle2,
  RefreshCw,
  Sliders,
  MapPin,
  Volume2,
  Radio,
  Cast,
  ArrowRightLeft,
  Share2,
} from 'lucide-react';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration, RoverCorrectionSource, BaseCorrectionBroadcast } from '../types/config';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const CydTouchSimulator: React.FC<Props> = ({
  selectedBoard,
  selectedGnss,
  config,
  onChangeConfig,
}) => {
  const [rtkFixStatus, setRtkFixStatus] = useState<'RTK_FIX' | 'RTK_FLOAT' | '3D_FIX'>('RTK_FIX');
  const [satellites, setSatellites] = useState<number>(34);
  const [activeTab, setActiveTab] = useState<'survey' | 'tilt' | 'comms' | 'system'>('survey');
  const [bubbleX, setBubbleX] = useState<number>(0);
  const [bubbleY, setBubbleY] = useState<number>(0);
  const [simulatedPitch, setSimulatedPitch] = useState<number>(14.2);
  const [simulatedRoll, setSimulatedRoll] = useState<number>(-8.5);
  const [simulatedHeading, setSimulatedHeading] = useState<number>(184.6);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  // In-field active protocol simulation
  const [activeInFieldCorr, setActiveInFieldCorr] = useState<string>(
    config.defaultComms?.roverCorrectionSource || 'ntrip_wifi'
  );
  const [activeInFieldBaseEgress, setActiveInFieldBaseEgress] = useState<string>(
    config.defaultComms?.baseCorrectionBroadcast || 'ntrip_caster'
  );

  // Animate bubble slightly to simulate real survey pole motion in the surveyor's hands
  useEffect(() => {
    const interval = setInterval(() => {
      const wobbleX = Math.sin(Date.now() / 600) * 12 + simulatedRoll * 1.5;
      const wobbleY = Math.cos(Date.now() / 700) * 12 + simulatedPitch * 1.5;
      setBubbleX(Math.max(-45, Math.min(45, wobbleX)));
      setBubbleY(Math.max(-45, Math.min(45, wobbleY)));
    }, 100);
    return () => clearInterval(interval);
  }, [simulatedPitch, simulatedRoll]);

  const triggerTouch = (label: string, action: () => void) => {
    setTouchFeedback(label);
    action();
    setTimeout(() => setTouchFeedback(null), 1200);
  };

  const currentTiltDeg = Math.sqrt(simulatedPitch * simulatedPitch + simulatedRoll * simulatedRoll);
  const poleOffsetCm = config.tilt.enabled
    ? (config.tilt.poleHeightMeters * Math.sin((currentTiltDeg * Math.PI) / 180) * 100).toFixed(1)
    : '0.0';

  const isRover = config.deviceRole === 'rover';

  // Cycle rover in-field correction protocol
  const cycleRoverComms = () => {
    const protocols: RoverCorrectionSource[] = ['ntrip_wifi', 'esp_now', 'lora_radio', 'bt_bridge'];
    const nextIdx = (protocols.indexOf(activeInFieldCorr as any) + 1) % protocols.length;
    const nextProto = protocols[nextIdx];
    setActiveInFieldCorr(nextProto);
    triggerTouch(`In-Field Swapped: ${nextProto.toUpperCase()}`, () => {
      if (config.defaultComms) {
        onChangeConfig({
          ...config,
          defaultComms: { ...config.defaultComms, roverCorrectionSource: nextProto },
        });
      }
    });
  };

  // Cycle base in-field broadcast protocol
  const cycleBaseComms = () => {
    const protocols: BaseCorrectionBroadcast[] = ['ntrip_caster', 'esp_now', 'lora_radio', 'local_tcp'];
    const nextIdx = (protocols.indexOf(activeInFieldBaseEgress as any) + 1) % protocols.length;
    const nextProto = protocols[nextIdx];
    setActiveInFieldBaseEgress(nextProto);
    triggerTouch(`Base Egress: ${nextProto.toUpperCase()}`, () => {
      if (config.defaultComms) {
        onChangeConfig({
          ...config,
          defaultComms: { ...config.defaultComms, baseCorrectionBroadcast: nextProto },
        });
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-amber-400" />
              CYD 2.8" TFT Touchscreen Firmware UI (ESP32-2432S028 / ES3C28P)
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Interactive Hardware Simulator
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time interactive preview of the LVGL / TFT_eSPI touch screen interface demonstrating <strong className="text-cyan-300">in-field Rover/Base toggling</strong> and <strong className="text-indigo-300">hot-swappable communication protocols</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Simulate GNSS Fix:</span>
          <select
            value={rtkFixStatus}
            onChange={(e) => setRtkFixStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
          >
            <option value="RTK_FIX">RTK FIX (1.2 cm)</option>
            <option value="RTK_FLOAT">RTK FLOAT (18 cm)</option>
            <option value="3D_FIX">3D DGNSS (1.4 m)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        {/* Physical CYD Device Frame */}
        <div className="relative p-6 bg-amber-600/90 rounded-3xl shadow-2xl border-4 border-amber-700 flex flex-col items-center">
          {/* Bezel branding */}
          <div className="w-full flex justify-between items-center text-[10px] font-bold text-amber-950 px-2 pb-2 tracking-widest uppercase">
            <span>ESP32-2432S028</span>
            <span>2.8" SPI TFT TOUCH</span>
          </div>

          {/* Actual 240x320 LCD Screen (scaled nicely to 280x390 px) */}
          <div className="w-[280px] h-[390px] bg-black rounded-lg border-2 border-slate-950 overflow-hidden shadow-inner flex flex-col justify-between text-white font-mono select-none relative">
            {/* Touch feedback banner / ripple */}
            {touchFeedback && (
              <div className="absolute top-10 inset-x-2 z-50 pointer-events-none flex items-center justify-center">
                <span className="px-2.5 py-1.5 bg-cyan-950/95 border border-cyan-400 text-cyan-200 rounded text-[11px] shadow-2xl animate-bounce text-center">
                  {touchFeedback}
                </span>
              </div>
            )}

            {/* SCREEN TOP STATUS BAR */}
            <div className="bg-slate-950 px-2 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Bluetooth className="w-3 h-3 text-cyan-400" />
                {config.btMode === 'ble_only' ? 'BLE' : 'BT'}
              </span>
              <span
                onClick={() =>
                  triggerTouch(`In-Field Switched to ${isRover ? 'BASE' : 'ROVER'} (Saved to NVS)`, () =>
                    onChangeConfig({
                      ...config,
                      deviceRole: isRover ? 'base' : 'rover',
                    })
                  )
                }
                className={`font-bold cursor-pointer px-1.5 py-0.5 rounded text-[10px] border ${
                  isRover
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 hover:bg-cyan-900'
                    : 'bg-purple-950 text-purple-300 border-purple-700 hover:bg-purple-900'
                }`}
                title="Tap to switch operating mode in the field"
              >
                {isRover ? 'ROVER' : 'BASE'} ⇄
              </span>
              <span className="text-amber-400">SIV:{satellites}</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Battery className="w-3 h-3" /> 84%
              </span>
            </div>

            {/* FIX OR BASE TRANSMIT BANNER */}
            {isRover ? (
              <div
                className={`py-1.5 px-3 flex items-center justify-between text-xs font-bold ${
                  rtkFixStatus === 'RTK_FIX'
                    ? 'bg-emerald-600 text-white'
                    : rtkFixStatus === 'RTK_FLOAT'
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{rtkFixStatus.replace('_', ' ')}</span>
                </div>
                <span className="text-[10px] tracking-tight">
                  {rtkFixStatus === 'RTK_FIX'
                    ? 'HPA: 0.014 m'
                    : rtkFixStatus === 'RTK_FLOAT'
                    ? 'HPA: 0.182 m'
                    : 'HPA: 1.450 m'}
                </span>
              </div>
            ) : (
              <div className="py-1.5 px-3 flex items-center justify-between text-xs font-bold bg-purple-600 text-white">
                <div className="flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>BASE: TX RTCM3</span>
                </div>
                <span className="text-[10px] tracking-tight">SURVEY-IN: 100%</span>
              </div>
            )}

            {/* MAIN SCREEN BODY BASED ON TAB */}
            <div className="flex-1 p-2.5 flex flex-col justify-between text-xs overflow-hidden">
              {activeTab === 'survey' && (
                isRover ? (
                  /* ROVER SURVEY SCREEN */
                  <div className="space-y-2">
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>COORDINATES (WGS84)</span>
                        <span className="text-cyan-400">{selectedGnss.name.slice(0, 10)}</span>
                      </div>
                      <div className="text-[12px] text-emerald-300 font-bold mt-0.5">
                        LAT: 40.0902948 N
                      </div>
                      <div className="text-[12px] text-emerald-300 font-bold">
                        LON: 105.1850576 W
                      </div>
                      <div className="text-[11px] text-slate-300">
                        MSL: 1560.12 m (Pole: {config.tilt.poleHeightMeters.toFixed(2)}m)
                      </div>
                    </div>

                    {/* Tilt Mini Status */}
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">IMU TILT STATUS</div>
                        <div className="text-xs font-bold text-amber-300">
                          {config.tilt.enabled ? `${currentTiltDeg.toFixed(1)}° COMPENSATED` : 'TILT OFF'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          HDG: {simulatedHeading.toFixed(1)}° | PITCH: {simulatedPitch.toFixed(1)}°
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-950 rounded-full border border-slate-700 flex items-center justify-center relative">
                        <div
                          className="w-4 h-4 bg-emerald-400 rounded-full shadow-sm"
                          style={{
                            transform: `translate(${bubbleX / 3.5}px, ${bubbleY / 3.5}px)`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* In-Field Comms Quick Switcher */}
                    <div
                      onClick={cycleRoverComms}
                      className="text-[10px] text-slate-300 bg-slate-900 hover:bg-slate-800 p-2 rounded border border-slate-800 flex justify-between items-center cursor-pointer transition"
                      title="Tap to hot-swap correction source in the field"
                    >
                      <span className="flex items-center gap-1 text-cyan-300 font-bold">
                        <Share2 className="w-3 h-3 text-cyan-400" />
                        CORR: {activeInFieldCorr.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-cyan-400 uppercase font-mono bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-800">
                        Tap to Swap ⇄
                      </span>
                    </div>
                  </div>
                ) : (
                  /* BASE STATION SCREEN */
                  <div className="space-y-2">
                    <div className="bg-slate-900/90 p-2 rounded border border-purple-900/50">
                      <div className="text-[10px] text-purple-300 flex justify-between font-bold">
                        <span>REFERENCE POSITION</span>
                        <span>FIXED / SURVEYED</span>
                      </div>
                      <div className="text-[11px] text-slate-200 font-mono mt-0.5">
                        LAT: {config.baseConfig.fixedLat.toFixed(7)} N
                      </div>
                      <div className="text-[11px] text-slate-200 font-mono">
                        LON: {Math.abs(config.baseConfig.fixedLon).toFixed(7)} W
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ALT: {config.baseConfig.fixedAlt.toFixed(2)} m (ELLIPSOID)
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800 space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>BROADCAST FRAMES:</span>
                        <span className="text-emerald-400 font-mono">1005, 1074, 1084, 1094</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>CONNECTED ROVERS:</span>
                        <span className="text-cyan-300 font-mono">2 PEERS (ESP-NOW/TCP)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>RATE:</span>
                        <span className="text-slate-200 font-mono">1.0 Hz (480 Bytes/sec)</span>
                      </div>
                    </div>

                    {/* In-Field Base Egress Hot-Swap */}
                    <div
                      onClick={cycleBaseComms}
                      className="text-[10px] text-slate-300 bg-slate-900 hover:bg-slate-800 p-2 rounded border border-purple-900/60 flex justify-between items-center cursor-pointer transition"
                      title="Tap to hot-swap base broadcast egress in the field"
                    >
                      <span className="flex items-center gap-1 text-purple-300 font-bold">
                        <Cast className="w-3 h-3 text-purple-400" />
                        EGRESS: {activeInFieldBaseEgress.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-purple-300 uppercase font-mono bg-purple-950/80 px-1 py-0.5 rounded border border-purple-800">
                        Tap to Swap ⇄
                      </span>
                    </div>
                  </div>
                )
              )}

              {activeTab === 'tilt' && (
                <div className="flex flex-col items-center justify-center space-y-2 py-1">
                  <div className="text-[11px] font-bold text-amber-300">
                    ONBOARD IMU TILT COMPENSATOR
                  </div>

                  {/* Visual Spirit Bubble Level */}
                  <div className="w-36 h-36 rounded-full bg-slate-950 border-2 border-slate-700 relative flex items-center justify-center shadow-inner">
                    <div className="w-24 h-24 rounded-full border border-slate-800 absolute"></div>
                    <div className="w-12 h-12 rounded-full border border-slate-800 absolute"></div>
                    <div className="w-full h-[1px] bg-slate-800 absolute"></div>
                    <div className="h-full w-[1px] bg-slate-800 absolute"></div>

                    {/* Bubble */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-75 ${
                        currentTiltDeg < config.tilt.maxTiltAngleDeg
                          ? 'bg-emerald-500/80 border-2 border-emerald-300 text-[10px] font-bold'
                          : 'bg-red-500/80 border-2 border-red-300 text-[10px] font-bold'
                      }`}
                      style={{
                        transform: `translate(${bubbleX}px, ${bubbleY}px)`,
                      }}
                    >
                      •
                    </div>
                  </div>

                  <div className="text-center text-[10px]">
                    <div className="text-slate-300 font-bold">
                      POLE TILT: {currentTiltDeg.toFixed(1)}° (Max: {config.tilt.maxTiltAngleDeg}°)
                    </div>
                    <div className="text-emerald-400">
                      Offset Corrected: {poleOffsetCm} cm
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comms' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="font-bold text-indigo-300 flex justify-between">
                    <span>IN-FIELD COMMS STATUS</span>
                    <span className="text-slate-400">{isRover ? 'ROVER' : 'BASE'}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1.5">
                    <div>
                      <span className="text-slate-400">Active Channel:</span>{' '}
                      <span className="text-cyan-300 font-bold">
                        {isRover
                          ? activeInFieldCorr.toUpperCase().replace('_', ' ')
                          : activeInFieldBaseEgress.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">WiFi SSID:</span>{' '}
                      <span className="text-slate-200">RTK-Config-34B1</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Web Portal:</span>{' '}
                      <span className="text-emerald-400">http://192.168.4.1</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Bluetooth SPP:</span>{' '}
                      <span className="text-indigo-300">Connected to SW Maps</span>
                    </div>
                    {config.features.enableEspNow && (
                      <div className="text-emerald-300 pt-0.5">
                        ⚡ ESP-NOW: Peer Mesh Active (Ch 1)
                      </div>
                    )}
                  </div>
                  <div className="text-slate-400 text-[9px] italic">
                    Tap the bottom COMMS button or screen badge to hot-swap channels in the field.
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="font-bold text-purple-300">HARDWARE & NVS PROFILE</div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                    <div>BOARD: {selectedBoard.id}</div>
                    <div>FLASH: {selectedBoard.flashSizeMB}MB | PSRAM: {selectedBoard.psramMB}MB</div>
                    <div>GNSS: {selectedGnss.name.slice(0, 16)}</div>
                    <div>UART: TX={config.pins.gnssTx} RX={config.pins.gnssRx}</div>
                    <div className="text-emerald-400">NVS STATE: PERSISTED IN FLASH</div>
                  </div>
                </div>
              )}
            </div>

            {/* SCREEN BOTTOM TOUCH TABS (Touch Buttons) */}
            <div className="bg-slate-950 p-1 border-t border-slate-800 grid grid-cols-4 gap-1 text-[10px] text-center">
              <button
                onClick={() => triggerTouch('SURVEY', () => setActiveTab('survey'))}
                className={`py-2 rounded font-bold transition ${
                  activeTab === 'survey' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                SURVEY
              </button>
              <button
                onClick={() => triggerTouch('TILT', () => setActiveTab('tilt'))}
                className={`py-2 rounded font-bold transition ${
                  activeTab === 'tilt' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                TILT
              </button>
              <button
                onClick={() =>
                  triggerTouch(`In-Field Switched to ${isRover ? 'BASE' : 'ROVER'} (Saved to NVS)`, () =>
                    onChangeConfig({
                      ...config,
                      deviceRole: isRover ? 'base' : 'rover',
                    })
                  )
                }
                className={`py-2 rounded font-bold transition ${
                  isRover
                    ? 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-700'
                    : 'bg-cyan-900/70 hover:bg-cyan-800 text-cyan-200 border border-cyan-700'
                }`}
                title="Tap to toggle between Rover and Base in the field"
              >
                {isRover ? '⇄ BASE' : '⇄ ROVER'}
              </button>
              <button
                onClick={() => triggerTouch('COMMS', () => setActiveTab('comms'))}
                className={`py-2 rounded font-bold transition ${
                  activeTab === 'comms' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                COMMS
              </button>
            </div>
          </div>

          {/* CYD hardware details */}
          <div className="mt-3 text-[10px] text-amber-950 font-bold flex items-center justify-between w-full px-2">
            <span>RESISTIVE TOUCH: XPT2046</span>
            <span>SPI TFT: ILI9341</span>
          </div>
        </div>

        {/* Live Simulator Controls Panel */}
        <div className="space-y-4 max-w-sm text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              In-Field Switching Simulator Controls
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The original firmware compiles <strong className="text-white">both Rover and Base capabilities</strong> into flash. Test in-field interactions directly:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() =>
                  triggerTouch(`In-Field Switched to ${isRover ? 'BASE' : 'ROVER'} (Saved to NVS)`, () =>
                    onChangeConfig({
                      ...config,
                      deviceRole: isRover ? 'base' : 'rover',
                    })
                  )
                }
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Simulate Tap: Switch to {isRover ? 'Base Station' : 'Rover'} Mode</span>
              </button>

              <button
                onClick={isRover ? cycleRoverComms : cycleBaseComms}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-indigo-300 flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Simulate Tap: Cycle In-Field Comms Protocol</span>
              </button>
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside pt-1">
              <li>Changes are saved to <code className="text-cyan-300">ESP32 NVS (Preferences)</code></li>
              <li>Reboots directly into the last selected field role</li>
              <li>If cellular drops in the woods, hot-swap to LoRa or ESP-NOW without recompiling</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="font-semibold text-white block">Simulate Survey Pole Motion:</span>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pole Pitch Angle:</span>
                <span className="font-mono text-cyan-300">{simulatedPitch.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="0.5"
                value={simulatedPitch}
                onChange={(e) => setSimulatedPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pole Roll Angle:</span>
                <span className="font-mono text-cyan-300">{simulatedRoll.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="0.5"
                value={simulatedRoll}
                onChange={(e) => setSimulatedRoll(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
