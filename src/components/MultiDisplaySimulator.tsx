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
  Tv,
  ChevronRight,
  ChevronLeft,
  Power,
  Zap,
  Lightbulb,
  ToggleLeft,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import {
  BoardDefinition,
  GnssChipDefinition,
  SystemConfiguration,
  RoverCorrectionSource,
  BaseCorrectionBroadcast,
  SwitchItemConfig,
  LedItemConfig,
} from '../types/config';
import { RESISTOR_GUIDELINES } from '../data/accessories';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export type SimulatedScreenType =
  | 'lcd1602'
  | 'oled_128x64'
  | 'tft_18_color'
  | 'cyd_touch'
  | 'epaper_ssd1680'
  | 'm5stack_core';

export const MultiDisplaySimulator: React.FC<Props> = ({
  selectedBoard,
  selectedGnss,
  config,
  onChangeConfig,
}) => {
  // Screen selector
  const [activeScreen, setActiveScreen] = useState<SimulatedScreenType>(() => {
    if (config.addons.screen.type === 'lcd1602_i2c' || config.addons.screen.type === 'lcd1602_parallel') {
      return 'lcd1602';
    }
    if (
      config.addons.screen.type === 'ssd1306_096_i2c' ||
      config.addons.screen.type === 'sh1106_13_i2c' ||
      config.addons.screen.type === 'oled_ec11_combo'
    ) {
      return 'oled_128x64';
    }
    if (config.addons.screen.type === 'st7735s_18_spi') {
      return 'tft_18_color';
    }
    if (config.addons.screen.type === 'eink_ssd1680') {
      return 'epaper_ssd1680';
    }
    return 'cyd_touch';
  });

  // Simulation states
  const [rtkFixStatus, setRtkFixStatus] = useState<'RTK_FIX' | 'RTK_FLOAT' | '3D_FIX'>('RTK_FIX');
  const [satellites, setSatellites] = useState<number>(34);
  const [batteryPercent, setBatteryPercent] = useState<number>(92);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(4.14);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [btConnected, setBtConnected] = useState<boolean>(true);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  // In-field protocol simulation
  const [activeInFieldCorr, setActiveInFieldCorr] = useState<string>(
    config.defaultComms?.roverCorrectionSource || 'ntrip_wifi'
  );
  const [activeInFieldBaseEgress, setActiveInFieldBaseEgress] = useState<string>(
    config.defaultComms?.baseCorrectionBroadcast || 'ntrip_caster'
  );

  // 1602 LCD States
  const [lcdBacklight, setLcdBacklight] = useState<boolean>(true);
  const [lcdBacklightColor, setLcdBacklightColor] = useState<'blue' | 'yellow_green'>('blue');
  const [lcdMenuMode, setLcdMenuMode] = useState<boolean>(false);
  const [lcdMenuIndex, setLcdMenuIndex] = useState<number>(0);

  // 128x64 OLED States
  const [oledMenuMode, setOledMenuMode] = useState<boolean>(false);
  const [oledMenuIndex, setOledMenuIndex] = useState<number>(0);

  // CYD states
  const [cydActiveTab, setCydActiveTab] = useState<'survey' | 'tilt' | 'comms' | 'system'>('survey');
  const [bubbleX, setBubbleX] = useState<number>(0);
  const [bubbleY, setBubbleY] = useState<number>(0);
  const [simulatedPitch, setSimulatedPitch] = useState<number>(14.2);
  const [simulatedRoll, setSimulatedRoll] = useState<number>(-8.5);

  // Virtual switches & LEDs from config
  const switches: SwitchItemConfig[] = config.switches || [];
  const leds: LedItemConfig[] = config.leds || [];

  // Active simulated role
  const isRover = config.deviceRole === 'rover';

  // Animate bubble for CYD tilt simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const wobbleX = Math.sin(Date.now() / 600) * 12 + simulatedRoll * 1.5;
      const wobbleY = Math.cos(Date.now() / 700) * 12 + simulatedPitch * 1.5;
      setBubbleX(Math.max(-45, Math.min(45, wobbleX)));
      setBubbleY(Math.max(-45, Math.min(45, wobbleY)));
    }, 100);
    return () => clearInterval(interval);
  }, [simulatedPitch, simulatedRoll]);

  const triggerFeedback = (label: string, action?: () => void) => {
    setTouchFeedback(label);
    if (action) action();
    setTimeout(() => setTouchFeedback(null), 1400);
  };

  // Toggle Rover / Base
  const handleToggleRole = () => {
    const nextRole = isRover ? 'base' : 'rover';
    triggerFeedback(`Switched to ${nextRole.toUpperCase()} Mode (Saved to NVS)`, () => {
      onChangeConfig({
        ...config,
        deviceRole: nextRole,
      });
    });
  };

  // Cycle Comms
  const handleCycleComms = () => {
    if (isRover) {
      const protocols: RoverCorrectionSource[] = ['ntrip_wifi', 'esp_now', 'lora_radio', 'bt_bridge'];
      const nextIdx = (protocols.indexOf(activeInFieldCorr as any) + 1) % protocols.length;
      const nextProto = protocols[nextIdx];
      setActiveInFieldCorr(nextProto);
      triggerFeedback(`In-Field Swapped: ${nextProto.toUpperCase()}`, () => {
        if (config.defaultComms) {
          onChangeConfig({
            ...config,
            defaultComms: { ...config.defaultComms, roverCorrectionSource: nextProto },
          });
        }
      });
    } else {
      const protocols: BaseCorrectionBroadcast[] = ['ntrip_caster', 'esp_now', 'lora_radio', 'local_tcp'];
      const nextIdx = (protocols.indexOf(activeInFieldBaseEgress as any) + 1) % protocols.length;
      const nextProto = protocols[nextIdx];
      setActiveInFieldBaseEgress(nextProto);
      triggerFeedback(`Base Egress: ${nextProto.toUpperCase()}`, () => {
        if (config.defaultComms) {
          onChangeConfig({
            ...config,
            defaultComms: { ...config.defaultComms, baseCorrectionBroadcast: nextProto },
          });
        }
      });
    }
  };

  // 1602 Menu items
  const lcdMenuItems = [
    { label: 'Mode', value: isRover ? 'Rover' : 'Base' },
    { label: 'Comms', value: isRover ? activeInFieldCorr.toUpperCase() : activeInFieldBaseEgress.toUpperCase() },
    { label: 'Survey-In', value: isRover ? 'N/A' : 'CONVERGED' },
    { label: 'Pole Height', value: `${config.tilt.poleHeightMeters.toFixed(2)}m` },
    { label: 'IMU Tilt', value: config.tilt.enabled ? 'ENABLED' : 'OFF' },
    { label: 'Bluetooth', value: btConnected ? 'CONNECTED' : 'PAIRING' },
    { label: 'Firmware', value: 'v2.4 Universal' },
    { label: 'Save & Exit', value: 'ENTER' },
  ];

  // Handle hardware switch click
  const handleHardwareSwitchClick = (sw: SwitchItemConfig) => {
    switch (sw.function) {
      case 'power_sleep':
        triggerFeedback('Power Button: Long Press -> System Sleep / Wake');
        break;
      case 'gnss_mode_switch':
        handleToggleRole();
        break;
      case 'comms_mode_switch':
        handleCycleComms();
        break;
      case 'bt_pairing':
        setBtConnected((prev) => !prev);
        triggerFeedback('Bluetooth: Pairing Mode Initiated (Fast LED Blink)');
        break;
      case 'menu_next':
        if (activeScreen === 'lcd1602') {
          setLcdMenuMode(true);
          setLcdMenuIndex((prev) => (prev + 1) % lcdMenuItems.length);
          triggerFeedback('Menu: Next Item');
        } else if (activeScreen === 'oled_128x64') {
          setOledMenuMode(true);
          setOledMenuIndex((prev) => (prev + 1) % 5);
          triggerFeedback('OLED Menu: Cursor Down');
        } else {
          triggerFeedback('Menu Next Pressed');
        }
        break;
      case 'menu_prev':
        if (activeScreen === 'lcd1602') {
          setLcdMenuMode(true);
          setLcdMenuIndex((prev) => (prev - 1 + lcdMenuItems.length) % lcdMenuItems.length);
          triggerFeedback('Menu: Previous Item');
        } else if (activeScreen === 'oled_128x64') {
          setOledMenuMode(true);
          setOledMenuIndex((prev) => (prev - 1 + 5) % 5);
          triggerFeedback('OLED Menu: Cursor Up');
        } else {
          triggerFeedback('Menu Prev Pressed');
        }
        break;
      case 'menu_select':
        if (activeScreen === 'lcd1602') {
          if (!lcdMenuMode) {
            setLcdMenuMode(true);
          } else {
            if (lcdMenuIndex === 0) handleToggleRole();
            else if (lcdMenuIndex === 1) handleCycleComms();
            else if (lcdMenuIndex === lcdMenuItems.length - 1) setLcdMenuMode(false);
            else triggerFeedback(`Selected: ${lcdMenuItems[lcdMenuIndex].label}`);
          }
        } else {
          triggerFeedback('Menu Select / Enter Triggered');
        }
        break;
      case 'menu_back':
        setLcdMenuMode(false);
        setOledMenuMode(false);
        triggerFeedback('Returned to Main Survey Dashboard');
        break;
      case 'mark_waypoint':
        triggerFeedback('📍 Waypoint Logged! Stored to MicroSD with Millimeter Precision');
        break;
      case 'zero_tilt_imu':
        setSimulatedPitch(0);
        setSimulatedRoll(0);
        triggerFeedback('IMU Tilt Zeroed to Plumb Axis (0.0°)');
        break;
      case 'display_backlight':
        setLcdBacklight((prev) => !prev);
        triggerFeedback('Display Backlight Toggled');
        break;
      case 'base_restart_survey':
        triggerFeedback('Base Station: Restarting Survey-In Accumulation (0m)');
        break;
      case 'toggle_wifi_ap':
        triggerFeedback('Wi-Fi AP Hotspot Toggled (192.168.4.1)');
        break;
      default:
        triggerFeedback(`Button Pressed: ${sw.label}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Top Header & Screen Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-400" />
              Multi-Display Screen & Hardware Menus Simulator
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive Hardware Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Preview live menus and UI layouts across supported screens (1602 LCD, 128x64 OLED, Color TFT, CYD Touchscreen, E-Paper, and M5Stack) with hardware switch & LED simulation.
          </p>
        </div>

        {/* Global GNSS Fix Simulator Control */}
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

      {/* Screen Formats Switcher Bar */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'lcd1602', name: '1602 Character LCD (2x16)', desc: 'I2C Backpack / 4-Bit Parallel' },
          { id: 'oled_128x64', name: '0.96" / 1.3" OLED (128x64)', desc: 'SSD1306 / SH1106 Monochrome' },
          { id: 'tft_18_color', name: '1.8" Color TFT LCD', desc: 'ST7735S 128x160 SPI' },
          { id: 'cyd_touch', name: 'CYD 2.8" / 3.5" Touchscreen', desc: 'ESP32-2432S028 ILI9341' },
          { id: 'epaper_ssd1680', name: '1.54" / 2.9" E-Paper Display', desc: 'SSD1680 Sunlight View' },
          { id: 'm5stack_core', name: 'M5Stack Core2 / CoreS3', desc: '320x240 LCD + 3 Touch Keys' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScreen(tab.id as SimulatedScreenType)}
            className={`px-3.5 py-2 rounded-xl text-left font-medium transition border flex flex-col min-w-[170px] ${
              activeScreen === tab.id
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/5'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="font-semibold text-xs text-white">{tab.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Touch / Action Toast Feedback */}
      {touchFeedback && (
        <div className="p-2.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/40 rounded-xl text-center text-xs font-mono text-cyan-200 shadow-xl animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{touchFeedback}</span>
        </div>
      )}

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: ACTIVE DISPLAY SIMULATION FRAME (7 COLS)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[440px]">
          {/* 1. 1602 CHARACTER LCD SIMULATOR */}
          {activeScreen === 'lcd1602' && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
              {/* Bezel frame */}
              <div className="w-full bg-slate-900 border-4 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200">HD44780 LCD 1602 (16x2)</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLcdBacklightColor(lcdBacklightColor === 'blue' ? 'yellow_green' : 'blue')
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {lcdBacklightColor === 'blue' ? 'Color: Blue' : 'Color: Yellow-Green'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLcdBacklight(!lcdBacklight)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        lcdBacklight ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      BL: {lcdBacklight ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* 1602 LCD Glass Matrix (16 cols x 2 rows) */}
                <div
                  className={`p-4 rounded-lg font-mono text-base tracking-widest border-4 shadow-inner transition select-none flex flex-col justify-center space-y-1.5 ${
                    !lcdBacklight
                      ? 'bg-emerald-950/40 text-emerald-900/60 border-slate-800'
                      : lcdBacklightColor === 'blue'
                      ? 'bg-blue-600 text-white shadow-blue-500/20 border-blue-800'
                      : 'bg-lime-500 text-black shadow-lime-500/20 border-lime-700'
                  }`}
                  style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '0.22em',
                    textShadow:
                      lcdBacklight && lcdBacklightColor === 'blue'
                        ? '0 0 4px rgba(255,255,255,0.8)'
                        : undefined,
                  }}
                >
                  {!lcdMenuMode ? (
                    // Live Survey Dashboard (16 chars per line)
                    <>
                      <div className="whitespace-pre">
                        {isRover
                          ? `FIX:${rtkFixStatus === 'RTK_FIX' ? 'RTK' : rtkFixStatus === 'RTK_FLOAT' ? 'FLT' : '3D '} SIV:${satellites} ${batteryPercent}%`
                          : `BASE:1005 TX 1Hz`}
                      </div>
                      <div className="whitespace-pre">
                        {isRover
                          ? `H:${rtkFixStatus === 'RTK_FIX' ? '0.012m' : '0.180m'} ${activeInFieldCorr.toUpperCase().slice(0, 6)}`
                          : `CONVERGED:0.008m`}
                      </div>
                    </>
                  ) : (
                    // 1602 Menu Mode
                    <>
                      <div className="whitespace-pre">
                        {`>${lcdMenuIndex + 1}.${lcdMenuItems[lcdMenuIndex].label.slice(0, 7)}:${lcdMenuItems[lcdMenuIndex].value.slice(0, 6)}`}
                      </div>
                      <div className="whitespace-pre">
                        {` ${lcdMenuIndex + 2 <= lcdMenuItems.length ? `${lcdMenuIndex + 2}.${lcdMenuItems[(lcdMenuIndex + 1) % lcdMenuItems.length].label.slice(0, 7)}` : 'END MENU'}`}
                      </div>
                    </>
                  )}
                </div>

                {/* Physical Navigation Buttons on 1602 Keypad Shield */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>1602 Shield Keypad:</span>
                    <span className="font-mono text-[10px] text-cyan-400">
                      {lcdMenuMode ? 'MENU NAVIGATION ACTIVE' : 'LIVE DASHBOARD'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLcdMenuMode(true);
                        setLcdMenuIndex((p) => (p - 1 + lcdMenuItems.length) % lcdMenuItems.length);
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs font-bold transition text-center"
                    >
                      ▲ UP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLcdMenuMode(true);
                        setLcdMenuIndex((p) => (p + 1) % lcdMenuItems.length);
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs font-bold transition text-center"
                    >
                      ▼ DOWN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!lcdMenuMode) {
                          setLcdMenuMode(true);
                        } else {
                          if (lcdMenuIndex === 0) handleToggleRole();
                          else if (lcdMenuIndex === 1) handleCycleComms();
                          else if (lcdMenuIndex === lcdMenuItems.length - 1) setLcdMenuMode(false);
                          else triggerFeedback(`Set: ${lcdMenuItems[lcdMenuIndex].label}`);
                        }
                      }}
                      className="py-1.5 px-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-mono text-xs font-bold transition text-center"
                    >
                      SELECT
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLcdMenuMode(false);
                        triggerFeedback('Exited Menu -> Status Screen');
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs font-bold transition text-center"
                    >
                      BACK
                    </button>
                    <button
                      type="button"
                      onClick={() => setLcdBacklight(!lcdBacklight)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono text-xs font-bold transition text-center"
                    >
                      LIGHT
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Uses <code className="text-cyan-300">LiquidCrystal_I2C</code> (address 0x27) or standard parallel 4-bit GPIOs (RS, EN, D4-D7). Ultra-low memory footprint (~240 bytes).
              </p>
            </div>
          )}

          {/* 2. 0.96" / 1.3" OLED (128x64 MONOCHROME) SIMULATOR */}
          {activeScreen === 'oled_128x64' && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <div className="p-5 bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl w-full">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-1.5 mb-3">
                  <span>SSD1306 / SH1106 OLED</span>
                  <span>128 x 64 I2C</span>
                </div>

                {/* 128x64 Screen Window */}
                <div className="w-[256px] h-[128px] mx-auto bg-black rounded border border-slate-800 p-2 font-mono text-white flex flex-col justify-between select-none shadow-inner">
                  {!oledMenuMode ? (
                    <>
                      {/* Top status icons row */}
                      <div className="flex justify-between items-center border-b border-slate-700 pb-1 text-[10px]">
                        <span className="font-bold text-amber-300">
                          {isRover ? 'ROVER' : 'BASE'}
                        </span>
                        <span>SIV:{satellites}</span>
                        <span className="px-1 bg-white text-black font-bold text-[9px] rounded-sm">
                          {rtkFixStatus === 'RTK_FIX' ? 'FIX' : rtkFixStatus === 'RTK_FLOAT' ? 'FLT' : '3D'}
                        </span>
                        <span>{batteryPercent}%</span>
                      </div>

                      {/* Main coordinates */}
                      <div className="text-[11px] leading-tight space-y-0.5 py-1">
                        <div>LAT: 37°46'29.841"N</div>
                        <div>LON: 122°25'09.124"W</div>
                        <div className="flex justify-between text-[10px] text-slate-300">
                          <span>ELEV: 52.41m</span>
                          <span>H-ACC: 0.012m</span>
                        </div>
                      </div>

                      {/* Comms indicator */}
                      <div className="flex justify-between text-[9px] text-slate-400 border-t border-slate-800 pt-0.5">
                        <span>CORR: {activeInFieldCorr.toUpperCase()}</span>
                        <span>BT: {btConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                      </div>
                    </>
                  ) : (
                    // Graphical OLED Menu
                    <div className="space-y-1 text-[10px]">
                      <div className="border-b border-white pb-0.5 text-center font-bold">
                        -- RTK MAIN MENU --
                      </div>
                      {[
                        { label: `Mode: ${isRover ? 'ROVER' : 'BASE'}`, action: handleToggleRole },
                        { label: `Radio: ${activeInFieldCorr.toUpperCase()}`, action: handleCycleComms },
                        { label: 'Mark Point: CSV Log', action: () => triggerFeedback('📍 Point Stamped') },
                        { label: 'Tilt IMU: Rock Align', action: () => triggerFeedback('IMU Calibrated') },
                        { label: '<- Exit Menu', action: () => setOledMenuMode(false) },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setOledMenuIndex(idx);
                            item.action();
                          }}
                          className={`cursor-pointer px-1 rounded flex items-center justify-between ${
                            oledMenuIndex === idx ? 'bg-white text-black font-bold' : 'text-slate-200'
                          }`}
                        >
                          <span>{oledMenuIndex === idx ? `> ${item.label}` : `  ${item.label}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OLED interaction buttons */}
                <div className="mt-4 flex justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOledMenuMode(!oledMenuMode);
                      setOledMenuIndex(0);
                    }}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition text-center"
                  >
                    {oledMenuMode ? 'View Dashboard' : 'Open Menu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (oledMenuMode) {
                        setOledMenuIndex((p) => (p + 1) % 5);
                      } else {
                        handleCycleComms();
                      }
                    }}
                    className="flex-1 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-semibold transition text-center"
                  >
                    {oledMenuMode ? 'Next Item' : 'Cycle Comms'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. 1.8" COLOR TFT (ST7735S 128x160) SIMULATOR */}
          {activeScreen === 'tft_18_color' && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <div className="p-5 bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl w-full">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-1.5 mb-3">
                  <span>ST7735S COLOR TFT SPI</span>
                  <span>128 x 160 FULL COLOR</span>
                </div>

                {/* 128x160 Color Window (scaled to 192x240) */}
                <div className="w-[192px] h-[240px] mx-auto bg-slate-950 rounded border-2 border-slate-800 p-2.5 font-mono text-white flex flex-col justify-between select-none shadow-xl">
                  {/* Banner */}
                  <div className="flex items-center justify-between text-[10px] border-b border-slate-800 pb-1">
                    <span className="font-bold text-cyan-400">RTK EVERYWHERE</span>
                    <span className="text-emerald-400 font-bold">{batteryPercent}%</span>
                  </div>

                  {/* Fix status banner */}
                  <div
                    className={`py-1 px-1.5 rounded text-center font-bold text-xs ${
                      rtkFixStatus === 'RTK_FIX'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : rtkFixStatus === 'RTK_FLOAT'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {rtkFixStatus === 'RTK_FIX' ? '● RTK FIXED (1.2cm)' : rtkFixStatus === 'RTK_FLOAT' ? '▲ RTK FLOAT (18cm)' : '■ 3D STANDALONE'}
                  </div>

                  {/* Multi-constellation C/N0 bar graph */}
                  <div className="space-y-1 bg-slate-900/80 p-2 rounded border border-slate-800 text-[10px]">
                    <div className="text-[9px] text-slate-400">CONSTELLATION SIGNALS:</div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-8 text-[9px] text-blue-300 font-bold">GPS:</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-blue-500 h-full w-[85%]"></div>
                      </div>
                      <span className="text-[9px] text-slate-300">44dB</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-8 text-[9px] text-emerald-300 font-bold">GLO:</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[78%]"></div>
                      </div>
                      <span className="text-[9px] text-slate-300">41dB</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-8 text-[9px] text-amber-300 font-bold">GAL:</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-amber-500 h-full w-[82%]"></div>
                      </div>
                      <span className="text-[9px] text-slate-300">43dB</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-8 text-[9px] text-purple-300 font-bold">BDS:</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-purple-500 h-full w-[90%]"></div>
                      </div>
                      <span className="text-[9px] text-slate-300">46dB</span>
                    </div>
                  </div>

                  {/* Bottom protocol details */}
                  <div className="text-[9px] text-slate-400 space-y-0.5">
                    <div>ROLE: <span className="text-white font-bold">{isRover ? 'ROVER' : 'BASE'}</span></div>
                    <div>RADIO: <span className="text-cyan-300">{activeInFieldCorr.toUpperCase()}</span></div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleToggleRole}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
                  >
                    Toggle Role (Rover/Base)
                  </button>
                  <button
                    type="button"
                    onClick={handleCycleComms}
                    className="flex-1 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-semibold"
                  >
                    Cycle Radio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. CYD 2.8" TOUCHSCREEN (ESP32-2432S028) SIMULATOR */}
          {activeScreen === 'cyd_touch' && (
            <div className="relative p-6 bg-amber-600/90 rounded-3xl shadow-2xl border-4 border-amber-700 flex flex-col items-center">
              <div className="w-full flex justify-between items-center text-[10px] font-bold text-amber-950 px-2 pb-2 tracking-widest uppercase">
                <span>ESP32-2432S028</span>
                <span>2.8" SPI TFT TOUCH</span>
              </div>

              {/* 240x320 Touch LCD Glass */}
              <div className="w-[280px] h-[380px] bg-black rounded-lg border-2 border-slate-950 overflow-hidden shadow-inner flex flex-col justify-between text-white font-mono select-none relative">
                {/* Status Bar */}
                <div className="bg-slate-950 px-2 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${rtkFixStatus === 'RTK_FIX' ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`}></span>
                    <span className="font-bold text-white">{isRover ? 'ROVER' : 'BASE'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-cyan-300">SIV:{satellites}</span>
                    <span className="text-emerald-400">{batteryPercent}%</span>
                  </div>
                </div>

                {/* Tab content */}
                {cydActiveTab === 'survey' && (
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div
                      className={`p-2 rounded text-center font-bold text-sm ${
                        rtkFixStatus === 'RTK_FIX'
                          ? 'bg-emerald-600 text-white'
                          : rtkFixStatus === 'RTK_FLOAT'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {rtkFixStatus === 'RTK_FIX' ? '● RTK FIXED (1.2cm)' : rtkFixStatus === 'RTK_FLOAT' ? '▲ RTK FLOAT (18cm)' : '■ STANDALONE'}
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] text-slate-400">CURRENT POSITION (WGS84):</div>
                      <div className="text-cyan-300 font-bold text-[11px]">37°46'29.8412" N</div>
                      <div className="text-cyan-300 font-bold text-[11px]">122°25'09.1248" W</div>
                      <div className="flex justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                        <span>ALT: 52.418m</span>
                        <span>HRMS: 0.012m</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[10px] flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block">CORRECTION SOURCE:</span>
                        <span className="font-bold text-indigo-300 uppercase">{activeInFieldCorr}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCycleComms}
                        className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-white font-bold text-[10px]"
                      >
                        SWAP
                      </button>
                    </div>
                  </div>
                )}

                {cydActiveTab === 'tilt' && (
                  <div className="p-3 flex-1 flex flex-col items-center justify-between">
                    <div className="text-center">
                      <div className="text-xs font-bold text-cyan-300">DIGITAL SPIRIT BUBBLE LEVEL</div>
                      <div className="text-[10px] text-slate-400">Auto Pole Offset Compensation</div>
                    </div>

                    {/* Circular Level Target */}
                    <div className="relative w-36 h-36 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border border-slate-800"></div>
                      <div className="w-12 h-12 rounded-full border border-cyan-800"></div>
                      <div className="absolute w-full h-[1px] bg-slate-800"></div>
                      <div className="absolute h-full w-[1px] bg-slate-800"></div>

                      {/* Moving bubble */}
                      <div
                        className="absolute w-6 h-6 rounded-full bg-cyan-400/80 shadow-lg shadow-cyan-400/50 border border-white transition-all duration-75"
                        style={{
                          transform: `translate(${bubbleX}px, ${bubbleY}px)`,
                        }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-center text-slate-300">
                      Pitch: {simulatedPitch.toFixed(1)}° • Roll: {simulatedRoll.toFixed(1)}°
                    </div>
                  </div>
                )}

                {/* Bottom Touch Navigation Bar */}
                <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-950 border-t border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCydActiveTab('survey')}
                    className={`py-1.5 rounded font-bold ${
                      cydActiveTab === 'survey' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    SURVEY
                  </button>
                  <button
                    type="button"
                    onClick={() => setCydActiveTab('tilt')}
                    className={`py-1.5 rounded font-bold ${
                      cydActiveTab === 'tilt' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    TILT
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleRole}
                    className="py-1.5 rounded font-bold bg-purple-900 text-purple-200"
                  >
                    {isRover ? '⇄ BASE' : '⇄ ROVER'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCycleComms}
                    className="py-1.5 rounded font-bold bg-indigo-900 text-indigo-200"
                  >
                    COMMS
                  </button>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-amber-950 font-bold flex justify-between w-full px-2">
                <span>XPT2046 TOUCH</span>
                <span>ILI9341 320x240</span>
              </div>
            </div>
          )}

          {/* 5. 1.54" / 2.9" E-PAPER DISPLAY SIMULATOR */}
          {activeScreen === 'epaper_ssd1680' && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <div className="p-5 bg-stone-300 border-4 border-stone-400 rounded-2xl shadow-2xl w-full text-stone-900">
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-stone-400 pb-1 mb-3">
                  <span className="font-bold">E-INK PAPER SSD1680</span>
                  <span>SUNLIGHT READABLE</span>
                </div>

                {/* E-Paper Screen Window */}
                <div className="w-[220px] h-[150px] mx-auto bg-stone-100 rounded border-2 border-stone-400 p-3 font-mono text-stone-950 flex flex-col justify-between select-none shadow-sm">
                  <div className="flex justify-between items-center border-b border-stone-400 pb-1 text-[11px] font-bold">
                    <span>{isRover ? 'ROVER' : 'BASE STATION'}</span>
                    <span>BATT: {batteryPercent}%</span>
                  </div>

                  <div className="py-1">
                    <div className="text-sm font-black tracking-tight">
                      {rtkFixStatus === 'RTK_FIX' ? '[RTK FIXED]' : rtkFixStatus === 'RTK_FLOAT' ? '[RTK FLOAT]' : '[3D FIX]'}
                    </div>
                    <div className="text-xs pt-1">SIV: {satellites} SATS (4 BANDS)</div>
                    <div className="text-xs">ACCURACY: 0.014m</div>
                  </div>

                  <div className="text-[10px] border-t border-stone-400 pt-1 flex justify-between">
                    <span>RADIO: {activeInFieldCorr.toUpperCase()}</span>
                    <span>PARTIAL: OK</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleToggleRole}
                    className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold"
                  >
                    In-Field Toggle Role
                  </button>
                  <button
                    type="button"
                    onClick={handleCycleComms}
                    className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold"
                  >
                    Cycle Protocol
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. M5STACK CORE2 / CORES3 SIMULATOR */}
          {activeScreen === 'm5stack_core' && (
            <div className="p-6 bg-stone-800 border-4 border-stone-700 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full">
              <div className="w-full flex justify-between text-[10px] text-stone-400 font-bold mb-2">
                <span>M5STACK CORES3</span>
                <span>ESP32-S3</span>
              </div>

              {/* 320x240 LCD in CoreS3 */}
              <div className="w-[260px] h-[200px] bg-black rounded border-2 border-stone-900 p-2.5 font-mono text-white flex flex-col justify-between shadow-inner">
                <div className="flex justify-between items-center border-b border-stone-800 pb-1 text-[10px]">
                  <span className="font-bold text-amber-400">{isRover ? 'ROVER' : 'BASE'}</span>
                  <span>{satellites} SATS</span>
                  <span className="text-emerald-400">{batteryPercent}%</span>
                </div>

                <div className="space-y-1 py-1 text-center">
                  <div
                    className={`py-1 rounded font-bold text-xs ${
                      rtkFixStatus === 'RTK_FIX' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {rtkFixStatus === 'RTK_FIX' ? 'RTK FIXED (1.2cm)' : 'RTK FLOAT (18cm)'}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    LAT: 37°46'29.84" N | LON: 122°25'09.12" W
                  </div>
                  <div className="text-[10px] text-cyan-300">
                    RADIO: {activeInFieldCorr.toUpperCase()}
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-stone-400 border-t border-stone-800 pt-1">
                  <span>[BTN A: MENU]</span>
                  <span>[BTN B: SWAP]</span>
                  <span>[BTN C: ROLE]</span>
                </div>
              </div>

              {/* 3 Capacitive Bottom Touch Keys */}
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => triggerFeedback('M5 Button A: Open Menu')}
                  className="py-2 bg-stone-900 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold border border-stone-700 text-center"
                >
                  BTN A
                </button>
                <button
                  type="button"
                  onClick={handleCycleComms}
                  className="py-2 bg-stone-900 hover:bg-stone-700 text-cyan-300 rounded-lg text-xs font-bold border border-stone-700 text-center"
                >
                  BTN B
                </button>
                <button
                  type="button"
                  onClick={handleToggleRole}
                  className="py-2 bg-stone-900 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-bold border border-stone-700 text-center"
                >
                  BTN C
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: VIRTUAL SWITCHES & STATUS LEDS (5 COLS)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* HARDWARE SWITCHES & BUTTONS TEST BENCH */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-cyan-400" />
                Physical Switches & Buttons Bench
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {switches.length} Configured
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Click any configured hardware switch to execute its firmware routine in real-time on the simulated display above:
            </p>

            <div className="space-y-2">
              {switches.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => handleHardwareSwitchClick(sw)}
                  className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 hover:border-cyan-500/50 border border-slate-800 rounded-lg text-left transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5 text-xs">
                      <span>{sw.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GPIO {sw.gpio1} • {sw.poleType.toUpperCase()} • {sw.actionType}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-slate-800 group-hover:bg-cyan-950 group-hover:text-cyan-300 border border-slate-700">
                    ACTUATE
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STATUS LEDS INDICATOR PANEL */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Real-Time Status LEDs Bench
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {leds.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {leds.map((led) => {
                let isLit = true;
                let isBlinking = false;
                let glowColor = 'bg-emerald-400 shadow-emerald-400/80';

                if (led.function === 'rtk_fix_status') {
                  if (rtkFixStatus === 'RTK_FIX') {
                    isLit = true;
                    isBlinking = false;
                    glowColor = 'bg-emerald-400 shadow-emerald-400/80';
                  } else if (rtkFixStatus === 'RTK_FLOAT') {
                    isLit = true;
                    isBlinking = true;
                    glowColor = 'bg-amber-400 shadow-amber-400/80';
                  } else {
                    isLit = false;
                    glowColor = 'bg-slate-700';
                  }
                } else if (led.function === 'bt_status') {
                  if (btConnected) {
                    isLit = true;
                    isBlinking = false;
                    glowColor = 'bg-blue-400 shadow-blue-400/80';
                  } else {
                    isLit = true;
                    isBlinking = true;
                    glowColor = 'bg-blue-400 shadow-blue-400/80';
                  }
                } else if (led.function === 'gnss_mode') {
                  isLit = !isRover;
                  glowColor = 'bg-red-500 shadow-red-500/80';
                } else if (led.function === 'power_battery') {
                  isLit = true;
                  glowColor = 'bg-amber-400 shadow-amber-400/80';
                }

                return (
                  <div
                    key={led.id}
                    className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Virtual LED diode with realistic glowing halo */}
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`w-4 h-4 rounded-full border border-white/40 transition-all ${
                            isLit
                              ? `${glowColor} shadow-lg ${isBlinking ? 'animate-pulse' : ''}`
                              : 'bg-slate-800 border-slate-700'
                          }`}
                        ></div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{led.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          GPIO {led.pin} • Resistor: <span className="text-amber-300 font-bold">{led.resistorValue}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {isLit ? (isBlinking ? '1Hz BLINK' : 'SOLID ON') : 'OFF'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Resistor reminder card */}
            <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-800/40 text-[11px] text-amber-200/90 space-y-1">
              <span className="font-semibold text-amber-300 block flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Resistor Reminder:
              </span>
              <span>
                Standard 3.3V GPIOs require a <strong>220Ω resistor</strong> for Red/Yellow LEDs and <strong>150Ω</strong> for Green/Blue LEDs. Onboard LEDs on ESP32 boards already contain built-in SMD resistors.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
