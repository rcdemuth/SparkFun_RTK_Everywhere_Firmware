import React, { useState } from 'react';
import {
  Monitor,
  HardDrive,
  Radio,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  RotateCw,
  Grid,
} from 'lucide-react';
import { SystemConfiguration, AddonScreenType, BoardDefinition } from '../types/config';
import { ADDON_SCREENS, LORA_MODULES } from '../data/accessories';
import { SwitchesLedsEditor } from './SwitchesLedsEditor';

interface Props {
  selectedBoard: BoardDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const AddonAccessoriesEditor: React.FC<Props> = ({
  selectedBoard,
  config,
  onChangeConfig,
}) => {
  const [screenOpen, setScreenOpen] = useState<boolean>(true);
  const [sdOpen, setSdOpen] = useState<boolean>(false);
  const [loraOpen, setLoraOpen] = useState<boolean>(false);

  const selectedScreenOpt =
    ADDON_SCREENS.find((s) => s.type === config.addons.screen.type) || ADDON_SCREENS[0];
  const selectedLoraOpt =
    LORA_MODULES.find((l) => l.chip === config.addons.lora.chip) || LORA_MODULES[0];

  const handleScreenChange = (type: AddonScreenType) => {
    const opt = ADDON_SCREENS.find((s) => s.type === type);
    if (!opt) return;

    onChangeConfig({
      ...config,
      addons: {
        ...config.addons,
        screen: {
          ...config.addons.screen,
          type,
          enabled: type !== 'none',
          pins: {
            ...config.addons.screen.pins,
            sda: opt.defaultPins.sda ?? config.addons.screen.pins.sda,
            scl: opt.defaultPins.scl ?? config.addons.screen.pins.scl,
            cs: opt.defaultPins.cs ?? config.addons.screen.pins.cs,
            dc: opt.defaultPins.dc ?? config.addons.screen.pins.dc,
            rst: opt.defaultPins.rst ?? config.addons.screen.pins.rst,
            busy: opt.defaultPins.busy ?? config.addons.screen.pins.busy,
            blk: opt.defaultPins.blk ?? config.addons.screen.pins.blk,
            ec11A: opt.defaultPins.ec11A ?? config.addons.screen.pins.ec11A,
            ec11B: opt.defaultPins.ec11B ?? config.addons.screen.pins.ec11B,
            ec11Btn: opt.defaultPins.ec11Btn ?? config.addons.screen.pins.ec11Btn,
          },
        },
      },
    });
  };

  const handleSdToggle = (enabled: boolean) => {
    onChangeConfig({
      ...config,
      addons: {
        ...config.addons,
        sd: {
          ...config.addons.sd,
          enabled,
        },
      },
      features: {
        ...config.features,
        enableSdLogging: enabled,
      },
    });
  };

  const handleLoraToggle = (enabled: boolean) => {
    onChangeConfig({
      ...config,
      addons: {
        ...config.addons,
        lora: {
          ...config.addons.lora,
          enabled,
        },
      },
      features: {
        ...config.features,
        enableLoRa: enabled,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Add-on Daughter Boards & Optional Peripherals
        </h3>
        <p className="text-xs text-slate-400">
          Expand your microcontroller with plug-in screens, rotary encoder dials, MicroSD card slots, and LoRa radios. Pins are dynamically checked for conflicts.
        </p>
      </div>

      {/* 1. ADD-ON DISPLAY / SCREEN MODULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div
          className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
          onClick={() => setScreenOpen(!screenOpen)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">Add-on Display Screen Module</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {config.addons.screen.enabled ? selectedScreenOpt.name.split('(')[0] : 'None / Headless'}
                </span>
                {selectedScreenOpt.hasEncoder && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    + EC11 Rotary Dial
                  </span>
                )}
                {selectedScreenOpt.hasKeypad && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    + 4x4 Keypad
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                OLED (SSD1306, SH1106, SSD1315), TFT LCD (ST7735S, ST7789), or Sunlight E-Ink (SSD1680)
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {screenOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {screenOpen && (
          <div className="p-5 space-y-5">
            {/* Screen Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ADDON_SCREENS.map((screen) => {
                const isSelected = config.addons.screen.type === screen.type;
                return (
                  <div
                    key={screen.type}
                    onClick={() => handleScreenChange(screen.type)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition text-xs relative ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{screen.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{screen.costRangeUSD}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                        {screen.interface}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                        {screen.driver}
                      </span>
                      {screen.hasEncoder && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                          EC11 Dial
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{screen.description}</p>

                    {isSelected && (
                      <div className="mt-2 text-right">
                        <span className="text-[10px] font-bold text-amber-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Config details when a screen is active */}
            {config.addons.screen.enabled && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h5 className="font-semibold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Hardware Pins for {selectedScreenOpt.name}
                    </h5>
                    <span className="text-[11px] text-slate-400">
                      Using driver library: <code className="text-cyan-300 font-mono">{selectedScreenOpt.driver}</code>
                    </span>
                  </div>

                  {selectedScreenOpt.interface === 'I2C' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">I2C Address:</span>
                      <select
                        value={config.addons.screen.i2cAddress || (selectedScreenOpt.type === 'lcd1602_i2c' ? '0x27' : '0x3C')}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              screen: { ...config.addons.screen, i2cAddress: e.target.value },
                            },
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                      >
                        <option value="0x27">0x27 (Standard 1602 PCF8574)</option>
                        <option value="0x3F">0x3F (Alternate 1602 PCF8574A)</option>
                        <option value="0x3C">0x3C (Standard OLED SSD1306)</option>
                        <option value="0x3D">0x3D (Alternate OLED)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Specific pin inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedScreenOpt.interface === 'I2C' ? (
                    <>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">I2C SDA Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.sda}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, sda: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">I2C SCL Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.scl}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, scl: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                    </>
                  ) : selectedScreenOpt.interface === 'Parallel' ? (
                    <>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">LCD RS Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdRs ?? 19}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdRs: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">LCD Enable (EN) Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdEn ?? 23}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdEn: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Data D4 Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdD4 ?? 18}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdD4: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Data D5 Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdD5 ?? 5}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdD5: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Data D6 Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdD6 ?? 17}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdD6: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Data D7 Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.lcdD7 ?? 16}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, lcdD7: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">SPI CS Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.cs}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, cs: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">DC / Command Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.dc}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, dc: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-[11px] block mb-1">Reset Pin</label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.rst}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, rst: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      {selectedScreenOpt.type === 'eink_ssd1680' && (
                        <div>
                          <label className="text-slate-400 text-[11px] block mb-1">E-Ink BUSY Pin</label>
                          <input
                            type="number"
                            value={config.addons.screen.pins.busy}
                            onChange={(e) =>
                              onChangeConfig({
                                ...config,
                                addons: {
                                  ...config.addons,
                                  screen: {
                                    ...config.addons.screen,
                                    pins: { ...config.addons.screen.pins, busy: parseInt(e.target.value) || 0 },
                                  },
                                },
                              })
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* EC11 Rotary Encoder Pins if present */}
                  {selectedScreenOpt.hasEncoder && (
                    <>
                      <div>
                        <label className="text-purple-300 text-[11px] block mb-1 font-semibold">
                          EC11 Dial A (CLK)
                        </label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.ec11A}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, ec11A: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-purple-800 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-[11px] block mb-1 font-semibold">
                          EC11 Dial B (DT)
                        </label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.ec11B}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, ec11B: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-purple-800 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-[11px] block mb-1 font-semibold">
                          EC11 Push Switch
                        </label>
                        <input
                          type="number"
                          value={config.addons.screen.pins.ec11Btn}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              addons: {
                                ...config.addons,
                                screen: {
                                  ...config.addons.screen,
                                  pins: { ...config.addons.screen.pins, ec11Btn: parseInt(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-purple-800 rounded px-2.5 py-1 text-white font-mono text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. OPTIONAL MICROSD / TF CARD SLOT */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div
          className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
          onClick={() => setSdOpen(!sdOpen)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">MicroSD / TF Card Logging Slot</h4>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    config.addons.sd.enabled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {config.addons.sd.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Record raw GNSS carrier phase (RINEX/UBX), NMEA coordinates, and survey waypoints directly to SD
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {sdOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {sdOpen && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Enable MicroSD Card Logging</span>
                <span className="text-[11px] text-slate-400">
                  Enables SdFat v2.1.1 filesystem driver and background async SD writer task
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.addons.sd.enabled}
                  onChange={(e) => handleSdToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {config.addons.sd.enabled && (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Bus Interface Mode</label>
                    <select
                      value={config.addons.sd.mode}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          addons: {
                            ...config.addons,
                            sd: { ...config.addons.sd, mode: e.target.value as any },
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                    >
                      <option value="spi">Standard SPI (Universal)</option>
                      <option value="sdmmc_1bit">ESP32 SDMMC 1-Bit</option>
                      <option value="sdmmc_4bit">ESP32 SDMMC 4-Bit (High Speed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">MicroSD SPI CS Pin</label>
                    <input
                      type="number"
                      value={config.addons.sd.pins.cs}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          addons: {
                            ...config.addons,
                            sd: {
                              ...config.addons.sd,
                              pins: { ...config.addons.sd.pins, cs: parseInt(e.target.value) || 0 },
                            },
                          },
                          pins: { ...config.pins, sdCs: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Card Detect (CD) Pin</label>
                    <input
                      type="number"
                      value={config.addons.sd.pins.cd}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          addons: {
                            ...config.addons,
                            sd: {
                              ...config.addons.sd,
                              pins: { ...config.addons.sd.pins, cd: parseInt(e.target.value) || -1 },
                            },
                          },
                        })
                      }
                      placeholder="-1 if unassigned"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <span className="font-semibold text-slate-300 block mb-2">Automated Log Output Formats:</span>
                  <div className="flex flex-wrap gap-4 text-slate-400 text-[11px]">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.addons.sd.logRawUbx}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              sd: { ...config.addons.sd, logRawUbx: e.target.checked },
                            },
                          })
                        }
                        className="accent-cyan-500"
                      />
                      <span>Raw Binary Packets (UBX-RAWX / Unicore / ComNav)</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.addons.sd.logNmea}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              sd: { ...config.addons.sd, logNmea: e.target.checked },
                            },
                          })
                        }
                        className="accent-cyan-500"
                      />
                      <span>NMEA GGA/RMC/GST (Tilt-Compensated)</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.addons.sd.logRinex}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              sd: { ...config.addons.sd, logRinex: e.target.checked },
                            },
                          })
                        }
                        className="accent-cyan-500"
                      />
                      <span>RINEX v3.04 (Post-Processing Kinematic - PPK)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. OPTIONAL EXTERNAL LORA MODULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div
          className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
          onClick={() => setLoraOpen(!loraOpen)}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-white">External LoRa Radio Transceiver</h4>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    config.addons.lora.enabled
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {config.addons.lora.enabled ? selectedLoraOpt.name.split('(')[0] : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transmit or receive RTCM 3.X corrections over long distances (up to 15 km) without cellular or internet
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {loraOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {loraOpen && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Enable External LoRa Radio Transceiver</span>
                <span className="text-[11px] text-slate-400">
                  Enables RadioLib integration and dedicated FreeRTOS packet task
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.addons.lora.enabled}
                  onChange={(e) => handleLoraToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {config.addons.lora.enabled && (
              <div className="space-y-4">
                {/* LoRa chip selection cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LORA_MODULES.map((mod) => {
                    const isSelected = config.addons.lora.chip === mod.chip;
                    return (
                      <div
                        key={mod.chip}
                        onClick={() =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              lora: {
                                ...config.addons.lora,
                                chip: mod.chip,
                                pins: {
                                  ...config.addons.lora.pins,
                                  cs: mod.defaultPins.cs ?? config.addons.lora.pins.cs,
                                  rst: mod.defaultPins.rst ?? config.addons.lora.pins.rst,
                                  dio1: mod.defaultPins.dio1 ?? config.addons.lora.pins.dio1,
                                  busy: mod.defaultPins.busy ?? config.addons.lora.pins.busy,
                                  tx: mod.defaultPins.tx ?? config.addons.lora.pins.tx,
                                  rx: mod.defaultPins.rx ?? config.addons.lora.pins.rx,
                                  aux: mod.defaultPins.aux ?? config.addons.lora.pins.aux,
                                  m0: mod.defaultPins.m0 ?? config.addons.lora.pins.m0,
                                  m1: mod.defaultPins.m1 ?? config.addons.lora.pins.m1,
                                },
                              },
                            },
                          })
                        }
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">{mod.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{mod.costRangeUSD}</span>
                        </div>
                        <div className="flex gap-1.5 text-[9px] font-mono text-slate-300 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">{mod.interface}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">{mod.maxPower}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">{mod.rangeKm}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{mod.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* LoRa settings and pins */}
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Frequency Band</label>
                      <select
                        value={config.addons.lora.frequencyMhz}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              lora: { ...config.addons.lora, frequencyMhz: parseFloat(e.target.value) },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                      >
                        <option value="915.0">915.0 MHz (US / Americas FCC)</option>
                        <option value="868.0">868.0 MHz (Europe CE)</option>
                        <option value="433.0">433.0 MHz (Asia / Global ISM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Transmit Power (dBm)</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={config.addons.lora.powerDbm}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            addons: {
                              ...config.addons,
                              lora: { ...config.addons.lora, powerDbm: parseInt(e.target.value) || 20 },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Pin inputs depending on SPI vs UART */}
                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-slate-300 text-[11px] font-semibold block mb-2">
                      LoRa Module Pin Assignments:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedLoraOpt.interface === 'SPI' ? (
                        <>
                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">NSS / CS Pin</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.cs}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, cs: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                  pins: { ...config.pins, loraCs: parseInt(e.target.value) || 0 },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">RST (Reset) Pin</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.rst}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, rst: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">DIO1 / IRQ Pin</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.dio1}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, dio1: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>

                          {config.addons.lora.chip === 'sx1262' && (
                            <div>
                              <label className="text-slate-400 text-[11px] block mb-1">BUSY Pin</label>
                              <input
                                type="number"
                                value={config.addons.lora.pins.busy}
                                onChange={(e) =>
                                  onChangeConfig({
                                    ...config,
                                    addons: {
                                      ...config.addons,
                                      lora: {
                                        ...config.addons.lora,
                                        pins: { ...config.addons.lora.pins, busy: parseInt(e.target.value) || 0 },
                                      },
                                    },
                                  })
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">ESP TX to EBYTE RX</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.tx}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, tx: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">ESP RX from EBYTE TX</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.rx}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, rx: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 text-[11px] block mb-1">AUX Pin</label>
                            <input
                              type="number"
                              value={config.addons.lora.pins.aux}
                              onChange={(e) =>
                                onChangeConfig({
                                  ...config,
                                  addons: {
                                    ...config.addons,
                                    lora: {
                                      ...config.addons.lora,
                                      pins: { ...config.addons.lora.pins, aux: parseInt(e.target.value) || 0 },
                                    },
                                  },
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. SWITCHES, BUTTONS & STATUS LEDS SECTION */}
      <SwitchesLedsEditor
        selectedBoard={selectedBoard}
        config={config}
        onChangeConfig={onChangeConfig}
      />
    </div>
  );
};
