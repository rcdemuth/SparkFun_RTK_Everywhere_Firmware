import React, { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Radio,
  Sliders,
  Power,
  Navigation,
  RotateCw,
  Lightbulb,
  Zap,
  HelpCircle,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  SystemConfiguration,
  BoardDefinition,
  SwitchItemConfig,
  SwitchPoleType,
  SwitchActionType,
  SwitchContactType,
  SwitchStyle,
  SwitchFunction,
  LedItemConfig,
  LedType,
  LedColor,
  LedFunction,
  LedBlinkPattern,
} from '../types/config';
import {
  SWITCH_FUNCTIONS,
  SWITCH_STYLES,
  LED_FUNCTIONS,
  RESISTOR_GUIDELINES,
} from '../data/accessories';

interface Props {
  selectedBoard: BoardDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const SwitchesLedsEditor: React.FC<Props> = ({
  selectedBoard,
  config,
  onChangeConfig,
}) => {
  const [switchesOpen, setSwitchesOpen] = useState<boolean>(true);
  const [ledsOpen, setLedsOpen] = useState<boolean>(true);
  const [resistorGuideOpen, setResistorGuideOpen] = useState<boolean>(false);

  // Initialize switches if not present
  const switches: SwitchItemConfig[] = config.switches || [
    {
      id: 'sw_pwr',
      label: 'Main Power & Sleep Button',
      poleType: 'spst',
      actionType: 'momentary',
      contactType: 'normally_open',
      style: 'push_button',
      function: 'power_sleep',
      gpio1: selectedBoard.defaultPins.btnUser ?? 34,
      pullMode: 'pullup',
      debounceMs: 50,
      notes: 'Hold 500ms to power on, hold 2s to safe shutdown',
    },
    {
      id: 'sw_mode',
      label: 'GNSS Operating Mode Switch (Rover / Base)',
      poleType: 'spdt',
      actionType: 'latching',
      contactType: 'normally_open',
      style: 'toggle',
      function: 'gnss_mode_switch',
      gpio1: 0,
      gpio2: 35,
      pullMode: 'pullup',
      debounceMs: 80,
      notes: 'Bat toggle switch: UP = Rover, DOWN = Base Station',
    },
    {
      id: 'sw_bt',
      label: 'Bluetooth Discoverable Pairing Button',
      poleType: 'spst',
      actionType: 'momentary',
      contactType: 'normally_open',
      style: 'tactile',
      function: 'bt_pairing',
      gpio1: 32,
      pullMode: 'pullup',
      debounceMs: 40,
      notes: 'Press to force BLE/SPP discoverable mode',
    },
  ];

  // Initialize LEDs if not present
  const leds: LedItemConfig[] = config.leds || [
    {
      id: 'led_pwr',
      label: 'Power & Battery / Charging LED',
      type: 'discrete_single',
      color: 'yellow',
      function: 'power_battery',
      pin: 25,
      activeHigh: true,
      resistorValue: '220Ω (1/4W)',
      resistorNote: 'Connect 220Ω in series between GPIO and Anode (Vf ≈ 2.0V)',
    },
    {
      id: 'led_bt',
      label: 'Bluetooth Status LED',
      type: 'discrete_single',
      color: 'blue',
      function: 'bt_status',
      pin: 26,
      activeHigh: true,
      resistorValue: '100Ω (1/4W)',
      resistorNote: 'Connect 100Ω in series with Anode (Vf ≈ 3.1V)',
    },
    {
      id: 'led_rtk',
      label: 'RTK Fix Precision LED',
      type: 'discrete_single',
      color: 'green',
      function: 'rtk_fix_status',
      pin: 27,
      activeHigh: true,
      resistorValue: '150Ω (1/4W)',
      resistorNote: 'Connect 150Ω in series (Solid = RTK Fixed, Slow Blink = Float)',
    },
    {
      id: 'led_base',
      label: 'GNSS Mode / Base Radio TX LED',
      type: 'discrete_single',
      color: 'red',
      function: 'gnss_mode',
      pin: selectedBoard.defaultPins.ledStatus ?? 2,
      activeHigh: true,
      resistorValue: '220Ω (1/4W)',
      resistorNote: 'Red LED: 220Ω in series. (Onboard LED on GPIO 2 already has SMD resistor)',
    },
  ];

  const updateSwitches = (newSwitches: SwitchItemConfig[]) => {
    onChangeConfig({
      ...config,
      switches: newSwitches,
    });
  };

  const updateLeds = (newLeds: LedItemConfig[]) => {
    onChangeConfig({
      ...config,
      leds: newLeds,
    });
  };

  // Helper to add switch
  const handleAddSwitch = () => {
    const id = `sw_${Date.now().toString(36).slice(-4)}`;
    const newSwitch: SwitchItemConfig = {
      id,
      label: `Custom Switch ${switches.length + 1}`,
      poleType: 'spst',
      actionType: 'momentary',
      contactType: 'normally_open',
      style: 'push_button',
      function: 'mark_waypoint',
      gpio1: 13,
      pullMode: 'pullup',
      debounceMs: 50,
      notes: '',
    };
    updateSwitches([...switches, newSwitch]);
  };

  // Preset switch packs
  const handleAddPresetSwitch = (preset: 'nav_pad' | 'mode_toggle' | 'waypoint_button') => {
    if (preset === 'nav_pad') {
      const navPack: SwitchItemConfig[] = [
        {
          id: `sw_nav_up_${Date.now()}`,
          label: 'Menu UP / Prev',
          poleType: 'spst',
          actionType: 'momentary',
          contactType: 'normally_open',
          style: 'tactile',
          function: 'menu_prev',
          gpio1: 32,
          pullMode: 'pullup',
          debounceMs: 40,
        },
        {
          id: `sw_nav_down_${Date.now() + 1}`,
          label: 'Menu DOWN / Next',
          poleType: 'spst',
          actionType: 'momentary',
          contactType: 'normally_open',
          style: 'tactile',
          function: 'menu_next',
          gpio1: 33,
          pullMode: 'pullup',
          debounceMs: 40,
        },
        {
          id: `sw_nav_sel_${Date.now() + 2}`,
          label: 'Menu ENTER / Select',
          poleType: 'spst',
          actionType: 'momentary',
          contactType: 'normally_open',
          style: 'tactile',
          function: 'menu_select',
          gpio1: 25,
          pullMode: 'pullup',
          debounceMs: 40,
        },
        {
          id: `sw_nav_back_${Date.now() + 3}`,
          label: 'Menu BACK / Exit',
          poleType: 'spst',
          actionType: 'momentary',
          contactType: 'normally_open',
          style: 'tactile',
          function: 'menu_back',
          gpio1: 26,
          pullMode: 'pullup',
          debounceMs: 40,
        },
      ];
      updateSwitches([...switches, ...navPack]);
    } else if (preset === 'mode_toggle') {
      const modeSw: SwitchItemConfig = {
        id: `sw_dpdt_mode_${Date.now()}`,
        label: 'Rover / Base Heavy Rocker (DPDT)',
        poleType: 'dpdt',
        actionType: 'latching',
        contactType: 'normally_open',
        style: 'rocker',
        function: 'gnss_mode_switch',
        gpio1: 14,
        gpio2: 12,
        gpio3: 27,
        gpio4: 33,
        pullMode: 'pullup',
        debounceMs: 100,
        notes: 'DPDT Pole 1 senses MCU state; Pole 2 switches external antenna / LNA power',
      };
      updateSwitches([...switches, modeSw]);
    } else if (preset === 'waypoint_button') {
      const wpBtn: SwitchItemConfig = {
        id: `sw_wp_${Date.now()}`,
        label: 'Survey Pole Stakeout Button',
        poleType: 'spst',
        actionType: 'momentary',
        contactType: 'normally_open',
        style: 'push_button',
        function: 'mark_waypoint',
        gpio1: 4,
        pullMode: 'pullup',
        debounceMs: 30,
        notes: 'Mounted on pole grip. Triggers high-accuracy RTK coordinate stamp with beep',
      };
      updateSwitches([...switches, wpBtn]);
    }
  };

  // Helper to add LED
  const handleAddLed = (type: LedType = 'discrete_single') => {
    const id = `led_${Date.now().toString(36).slice(-4)}`;
    let newLed: LedItemConfig;

    if (type === 'rgb_discrete') {
      newLed = {
        id,
        label: '4-Pin RGB Status LED',
        type: 'rgb_discrete',
        color: 'rgb_multi',
        function: 'rtk_fix_status',
        pin: 4, // Default primary
        rgbPins: { r: 4, g: 16, b: 17 },
        activeHigh: true,
        resistorValue: 'R: 220Ω, G: 150Ω, B: 100Ω',
        resistorNote: '3 individual resistors required! One for each color cathode/anode',
      };
    } else if (type === 'addressable_strip') {
      newLed = {
        id,
        label: 'WS2812B NeoPixel Status Ring (8 Pixels)',
        type: 'addressable_strip',
        color: 'rgb_multi',
        function: 'rtk_fix_status',
        pin: 13,
        stripPixelCount: 8,
        stripProtocol: 'ws2812b',
        activeHigh: true,
        resistorValue: '330Ω data resistor + 1000µF 6.3V capacitor',
        resistorNote: 'Place 330Ω in series on DIN. Place 1000µF capacitor across +5V & GND rails',
      };
    } else {
      newLed = {
        id,
        label: `Indicator LED ${leds.length + 1}`,
        type: 'discrete_single',
        color: 'green',
        function: 'rtk_fix_status',
        pin: 14,
        activeHigh: true,
        resistorValue: '150Ω (1/4W)',
        resistorNote: 'Connect 150Ω current-limiting resistor in series',
      };
    }

    updateLeds([...leds, newLed]);
  };

  // Color badge helper
  const getColorBadge = (color: LedColor) => {
    switch (color) {
      case 'red':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'green':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'blue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'yellow':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'amber':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'white':
        return 'bg-slate-200/20 text-slate-100 border-slate-400/30';
      case 'rgb_multi':
        return 'bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SECTION 1: HARDWARE SWITCHES & BUTTONS (SPST, SPDT, DPDT) */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div
          className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
          onClick={() => setSwitchesOpen(!switchesOpen)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <ToggleLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">
                  Hardware Switches & Push Buttons (GPIO Wired)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {switches.length} Configured
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  SPST • SPDT • DPDT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Directly wire physical switches to microcontroller GPIOs with configurable debounce, contact states, and SparkFun RTK functions.
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {switchesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {switchesOpen && (
          <div className="p-5 space-y-5">
            {/* Quick Presets Bar */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">Quick Switch Templates:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPresetSwitch('waypoint_button')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Stakeout Waypoint Button
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetSwitch('nav_pad')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-purple-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 4-Key Navigation Pad (UP/DN/ENT/ESC)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetSwitch('mode_toggle')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> DPDT Heavy Rocker (Rover/Base)
                </button>
              </div>
            </div>

            {/* Switches List */}
            <div className="space-y-3">
              {switches.map((sw, index) => {
                const funcDef = SWITCH_FUNCTIONS.find((f) => f.id === sw.function);
                const styleDef = SWITCH_STYLES.find((s) => s.id === sw.style);

                return (
                  <div
                    key={sw.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3 text-xs"
                  >
                    {/* Top Row: Label, Topology Badge, & Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={sw.label}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].label = e.target.value;
                            updateSwitches(updated);
                          }}
                          className="bg-transparent font-semibold text-white text-sm focus:outline-none focus:border-b focus:border-cyan-400 px-1"
                          placeholder="Switch Name..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                          {sw.poleType}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {sw.actionType === 'momentary' ? 'Momentary' : 'Latching'}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {sw.contactType === 'normally_open' ? 'NO (Norm. Open)' : 'NC (Norm. Closed)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateSwitches(switches.filter((_, i) => i !== index));
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 transition"
                          title="Delete switch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* 1. Pole Configuration */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Pole Topology
                        </label>
                        <select
                          value={sw.poleType}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].poleType = e.target.value as SwitchPoleType;
                            updateSwitches(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          <option value="spst">SPST (Single-Pole Single-Throw) - 2 Pins</option>
                          <option value="spdt">SPDT (Single-Pole Double-Throw) - 3 Pins</option>
                          <option value="dpdt">DPDT (Double-Pole Double-Throw) - 6 Pins</option>
                        </select>
                      </div>

                      {/* 2. Action Type (Momentary vs Latching) */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Action / Mechanism
                        </label>
                        <select
                          value={sw.actionType}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].actionType = e.target.value as SwitchActionType;
                            updateSwitches(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          <option value="momentary">Momentary (Spring Return)</option>
                          <option value="latching">Latching / Maintained (Stay in Position)</option>
                        </select>
                      </div>

                      {/* 3. Normal Contact State (NO vs NC) */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Resting Contact State
                        </label>
                        <select
                          value={sw.contactType}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].contactType = e.target.value as SwitchContactType;
                            updateSwitches(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          <option value="normally_open">Normally Open (NO) - Standard Default</option>
                          <option value="normally_closed">Normally Closed (NC)</option>
                        </select>
                      </div>

                      {/* 4. Actuation Style */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Physical Style / Actuation
                        </label>
                        <select
                          value={sw.style}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].style = e.target.value as SwitchStyle;
                            updateSwitches(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          {SWITCH_STYLES.map((style) => (
                            <option key={style.id} value={style.id}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Second Row: Predefined Function & Pin Routing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      {/* Predefined Function Selector */}
                      <div className="sm:col-span-2">
                        <label className="text-slate-400 text-[11px] block mb-1 flex items-center justify-between">
                          <span>Assigned Firmware Function</span>
                          <span className="text-[10px] text-cyan-400 font-normal">
                            SparkFun RTK Surveyor Compatible
                          </span>
                        </label>
                        <select
                          value={sw.function}
                          onChange={(e) => {
                            const updated = [...switches];
                            updated[index].function = e.target.value as SwitchFunction;
                            updateSwitches(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          {SWITCH_FUNCTIONS.map((fn) => (
                            <option key={fn.id} value={fn.id}>
                              [{fn.category}] {fn.name}
                            </option>
                          ))}
                        </select>
                        {funcDef && (
                          <div className="mt-1 text-[11px] text-slate-400 flex items-start gap-1">
                            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>
                              {funcDef.description}{' '}
                              <span className="font-mono text-slate-500">({funcDef.sparkfunRef})</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pull Mode & Debounce */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 text-[11px] block mb-1">
                            Internal Pull
                          </label>
                          <select
                            value={sw.pullMode}
                            onChange={(e) => {
                              const updated = [...switches];
                              updated[index].pullMode = e.target.value as any;
                              updateSwitches(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-mono text-xs"
                          >
                            <option value="pullup">INPUT_PULLUP (Active LOW)</option>
                            <option value="pulldown">INPUT_PULLDOWN (Active HIGH)</option>
                            <option value="external">External Resistor</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 text-[11px] block mb-1">
                            Debounce (ms)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="500"
                            value={sw.debounceMs}
                            onChange={(e) => {
                              const updated = [...switches];
                              updated[index].debounceMs = parseInt(e.target.value) || 50;
                              updateSwitches(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* GPIO Pins Input for SPST, SPDT, DPDT */}
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                        <span>GPIO Pin Assignment:</span>
                        <span className="text-[10px] text-slate-500">
                          {sw.poleType === 'spst'
                            ? '1 GPIO Pin + GND connection'
                            : sw.poleType === 'spdt'
                            ? '2 GPIO Pins (Throw 1 & Throw 2)'
                            : '4 GPIO Pins (Dual Poles x Dual Throws)'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400 text-[11px]">Primary GPIO:</span>
                          <input
                            type="number"
                            value={sw.gpio1}
                            onChange={(e) => {
                              const updated = [...switches];
                              updated[index].gpio1 = parseInt(e.target.value) || 0;
                              updateSwitches(updated);
                            }}
                            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-mono text-xs font-bold"
                          />
                        </div>

                        {(sw.poleType === 'spdt' || sw.poleType === 'dpdt') && (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400 text-[11px]">Throw 2 GPIO:</span>
                            <input
                              type="number"
                              value={sw.gpio2 ?? 35}
                              onChange={(e) => {
                                const updated = [...switches];
                                updated[index].gpio2 = parseInt(e.target.value) || 0;
                                updateSwitches(updated);
                              }}
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-mono text-xs font-bold"
                            />
                          </div>
                        )}

                        {sw.poleType === 'dpdt' && (
                          <>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400 text-[11px]">Pole 2 Th1:</span>
                              <input
                                type="number"
                                value={sw.gpio3 ?? 27}
                                onChange={(e) => {
                                  const updated = [...switches];
                                  updated[index].gpio3 = parseInt(e.target.value) || 0;
                                  updateSwitches(updated);
                                }}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-mono text-xs font-bold"
                              />
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400 text-[11px]">Pole 2 Th2:</span>
                              <input
                                type="number"
                                value={sw.gpio4 ?? 33}
                                onChange={(e) => {
                                  const updated = [...switches];
                                  updated[index].gpio4 = parseInt(e.target.value) || 0;
                                  updateSwitches(updated);
                                }}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-mono text-xs font-bold"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Switch Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddSwitch}
                className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Switch / Button</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: STATUS LEDS & ADDRESSABLE LED STRIPS           */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div
          className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
          onClick={() => setLedsOpen(!ledsOpen)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">
                  Status LEDs & Addressable LED Strips
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {leds.length} Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Discrete • RGB • WS2812B NeoPixel
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pulse, blink, and solid indicators prioritizing Power/Charging, Bluetooth pairing, and RTK fix status (SparkFun RTK Surveyor style).
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {ledsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {ledsOpen && (
          <div className="p-5 space-y-5">
            {/* Quick Presets Bar */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-slate-200">Add LED Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddLed('discrete_single')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Single Discrete LED
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLed('rgb_discrete')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 4-Pin RGB LED (R,G,B Pins)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLed('addressable_strip')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-purple-300 rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> WS2812B NeoPixel Strip
                </button>
              </div>
            </div>

            {/* LEDs List */}
            <div className="space-y-3">
              {leds.map((led, index) => {
                const funcDef = LED_FUNCTIONS.find((f) => f.id === led.function);
                const resistorInfo =
                  RESISTOR_GUIDELINES[led.color === 'rgb_multi' ? 'rgb_discrete' : led.color] ||
                  RESISTOR_GUIDELINES.green;

                return (
                  <div
                    key={led.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3 text-xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={led.label}
                          onChange={(e) => {
                            const updated = [...leds];
                            updated[index].label = e.target.value;
                            updateLeds(updated);
                          }}
                          className="bg-transparent font-semibold text-white text-sm focus:outline-none focus:border-b focus:border-amber-400 px-1"
                          placeholder="LED Label..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border uppercase ${getColorBadge(
                            led.color
                          )}`}
                        >
                          {led.color}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {led.type === 'discrete_single'
                            ? 'Discrete LED'
                            : led.type === 'rgb_discrete'
                            ? '4-Pin RGB'
                            : led.type === 'addressable_strip'
                            ? `WS2812B (${led.stripPixelCount ?? 8} px)`
                            : '12V MOSFET Strip'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateLeds(leds.filter((_, i) => i !== index));
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 transition"
                          title="Delete LED"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* 1. LED Type */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">LED Type</label>
                        <select
                          value={led.type}
                          onChange={(e) => {
                            const updated = [...leds];
                            const newType = e.target.value as LedType;
                            updated[index].type = newType;
                            if (newType === 'rgb_discrete' || newType === 'addressable_strip') {
                              updated[index].color = 'rgb_multi';
                            }
                            updateLeds(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          <option value="discrete_single">Standard Single-Color LED</option>
                          <option value="rgb_discrete">RGB 4-Pin LED (Common Cathode/Anode)</option>
                          <option value="addressable_strip">WS2812B / NeoPixel Digital Strip</option>
                          <option value="single_color_strip">12V / 5V MOSFET Driven LED Strip</option>
                        </select>
                      </div>

                      {/* 2. Color Selection (Optional for single, locked for RGB/strip) */}
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">
                          LED Emitting Color
                        </label>
                        <select
                          value={led.color}
                          disabled={led.type === 'rgb_discrete' || led.type === 'addressable_strip'}
                          onChange={(e) => {
                            const updated = [...leds];
                            updated[index].color = e.target.value as LedColor;
                            updateLeds(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs disabled:opacity-50"
                        >
                          <option value="green">Green (Vf ≈ 3.0V)</option>
                          <option value="blue">Blue (Vf ≈ 3.1V)</option>
                          <option value="red">Red (Vf ≈ 1.9V)</option>
                          <option value="yellow">Yellow (Vf ≈ 2.0V)</option>
                          <option value="amber">Amber / Orange (Vf ≈ 2.0V)</option>
                          <option value="white">White (Vf ≈ 3.2V)</option>
                          <option value="rgb_multi">RGB Multicolor</option>
                        </select>
                      </div>

                      {/* 3. Function Selector */}
                      <div className="md:col-span-2">
                        <label className="text-slate-400 text-[11px] block mb-1">
                          Signaled Function
                        </label>
                        <select
                          value={led.function}
                          onChange={(e) => {
                            const updated = [...leds];
                            updated[index].function = e.target.value as LedFunction;
                            updateLeds(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                        >
                          {LED_FUNCTIONS.map((fn) => (
                            <option key={fn.id} value={fn.id}>
                              {fn.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Blink Patterns & Status Description */}
                    {funcDef && (
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                        <div className="text-slate-300 font-semibold flex items-center justify-between">
                          <span>SparkFun Status Blink Protocol:</span>
                          <span className="font-mono text-[10px] text-slate-500">{funcDef.sparkfunRef}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-slate-300">
                            <span className="text-slate-500 block">IDLE / NORMAL:</span>
                            {funcDef.patterns.idle}
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-emerald-400">
                            <span className="text-slate-500 block">ACTIVE / FIX:</span>
                            {funcDef.patterns.active}
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-amber-400">
                            <span className="text-slate-500 block">ALERT / FLOAT:</span>
                            {funcDef.patterns.alert}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pin Allocation & Resistor Recommendation Callout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Pins */}
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                        {led.type === 'rgb_discrete' ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-[11px]">RGB Pins:</span>
                            <span className="text-red-400 font-mono text-xs font-bold">R:</span>
                            <input
                              type="number"
                              value={led.rgbPins?.r ?? 4}
                              onChange={(e) => {
                                const updated = [...leds];
                                updated[index].rgbPins = {
                                  r: parseInt(e.target.value) || 0,
                                  g: updated[index].rgbPins?.g ?? 16,
                                  b: updated[index].rgbPins?.b ?? 17,
                                };
                                updateLeds(updated);
                              }}
                              className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-xs"
                            />
                            <span className="text-emerald-400 font-mono text-xs font-bold">G:</span>
                            <input
                              type="number"
                              value={led.rgbPins?.g ?? 16}
                              onChange={(e) => {
                                const updated = [...leds];
                                updated[index].rgbPins = {
                                  r: updated[index].rgbPins?.r ?? 4,
                                  g: parseInt(e.target.value) || 0,
                                  b: updated[index].rgbPins?.b ?? 17,
                                };
                                updateLeds(updated);
                              }}
                              className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-xs"
                            />
                            <span className="text-blue-400 font-mono text-xs font-bold">B:</span>
                            <input
                              type="number"
                              value={led.rgbPins?.b ?? 17}
                              onChange={(e) => {
                                const updated = [...leds];
                                updated[index].rgbPins = {
                                  r: updated[index].rgbPins?.r ?? 4,
                                  g: updated[index].rgbPins?.g ?? 16,
                                  b: parseInt(e.target.value) || 0,
                                };
                                updateLeds(updated);
                              }}
                              className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-xs"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-[11px]">
                              {led.type === 'addressable_strip' ? 'Data DIN Pin:' : 'GPIO Pin:'}
                            </span>
                            <input
                              type="number"
                              value={led.pin}
                              onChange={(e) => {
                                const updated = [...leds];
                                updated[index].pin = parseInt(e.target.value) || 0;
                                updateLeds(updated);
                              }}
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-mono text-xs font-bold"
                            />
                            {led.type === 'addressable_strip' && (
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-slate-400 text-[11px]">Pixels:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="128"
                                  value={led.stripPixelCount ?? 8}
                                  onChange={(e) => {
                                    const updated = [...leds];
                                    updated[index].stripPixelCount = parseInt(e.target.value) || 8;
                                    updateLeds(updated);
                                  }}
                                  className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Explicit Resistor Note Callout */}
                      <div className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/60 flex items-start space-x-2 text-[11px]">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-300 block">
                            Required Resistor: {resistorInfo.resistorAt3V3}
                          </span>
                          <span className="text-amber-200/80 text-[10px]">
                            {resistorInfo.specialNotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Button & Resistor Reference Accordion Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResistorGuideOpen(!resistorGuideOpen)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {resistorGuideOpen
                    ? 'Hide Resistor & Electrical Guide'
                    : 'View Comprehensive LED Resistor & Ohm Calculator Guide'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAddLed('discrete_single')}
                className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Indicator LED</span>
              </button>
            </div>

            {/* EXPANDED RESISTOR GUIDE CARD */}
            {resistorGuideOpen && (
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-4 text-xs">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-white text-sm">
                    Electrical Resistor Calculation & Wiring Reference
                  </h5>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Microcontrollers like the ESP32 output <strong>3.3V logic</strong> and can only safely source <strong>12mA per GPIO</strong> pin (40mA maximum absolute rating). Connecting a discrete LED directly without a current-limiting resistor will cause permanent silicon breakdown or severe reboot loops.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                        <th className="py-2 pr-3">LED Type / Color</th>
                        <th className="py-2 px-3">Forward Drop (Vf)</th>
                        <th className="py-2 px-3">3.3V Resistor Value</th>
                        <th className="py-2 px-3">5.0V Resistor Value</th>
                        <th className="py-2 pl-3">Wiring Directive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-red-400">Red / Amber / Yellow</td>
                        <td className="py-2 px-3">1.8V - 2.1V</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">220Ω (150Ω - 330Ω)</td>
                        <td className="py-2 px-3 text-slate-400">330Ω (270Ω - 470Ω)</td>
                        <td className="py-2 pl-3 text-slate-300">In series with Anode (+) or Cathode (-)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-emerald-400">Green / Blue / White</td>
                        <td className="py-2 px-3">2.9V - 3.2V</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">150Ω (100Ω - 220Ω)</td>
                        <td className="py-2 px-3 text-slate-400">220Ω (180Ω - 330Ω)</td>
                        <td className="py-2 pl-3 text-slate-300">100Ω to 150Ω provides brilliant daylight visibility</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-purple-400">RGB 4-Pin Discrete</td>
                        <td className="py-2 px-3">R: 2.0V, G: 3.1V, B: 3.1V</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">R: 220Ω, G: 150Ω, B: 100Ω</td>
                        <td className="py-2 px-3 text-slate-400">R: 330Ω, G: 220Ω, B: 220Ω</td>
                        <td className="py-2 pl-3 text-amber-300 font-bold">
                          CRITICAL: 3 individual resistors! Never share 1 common resistor!
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-pink-400">WS2812B / NeoPixel</td>
                        <td className="py-2 px-3">5V Bus / 3.3V Data</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">330Ω - 470Ω on DIN line</td>
                        <td className="py-2 px-3 text-slate-400">1000 µF capacitor on +5V/GND</td>
                        <td className="py-2 pl-3 text-slate-300">Dampens impedance ringing and spike protection</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-yellow-400">12V High-Power Strip</td>
                        <td className="py-2 px-3">12V External</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">10kΩ Gate Pull-Down + 100Ω</td>
                        <td className="py-2 px-3 text-slate-400">Logic-level N-MOSFET (IRLZ44N)</td>
                        <td className="py-2 pl-3 text-slate-300">Never wire directly to MCU; use MOSFET PWM switch</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-semibold text-slate-400">Onboard Board LEDs</td>
                        <td className="py-2 px-3">Pre-wired SMD</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">0Ω (NONE NEEDED)</td>
                        <td className="py-2 px-3 text-emerald-400">NONE NEEDED</td>
                        <td className="py-2 pl-3 text-emerald-300">SMD resistors are factory soldered on PCB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
