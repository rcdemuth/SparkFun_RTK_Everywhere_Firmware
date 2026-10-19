import React from 'react';
import { Cable, AlertCircle, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { BoardDefinition, SystemConfiguration } from '../types/config';

interface Props {
  selectedBoard: BoardDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

interface PinMatrixRow {
  id: string;
  name: string;
  pin: number;
  bus: string;
  onUpdate?: (val: number) => void;
}

export const PinMatrixEditor: React.FC<Props> = ({
  selectedBoard,
  config,
  onChangeConfig,
}) => {
  const updatePin = (key: keyof SystemConfiguration['pins'], val: number) => {
    onChangeConfig({
      ...config,
      pins: {
        ...config.pins,
        [key]: val,
      },
    });
  };

  // Conflict detection & list
  const pinEntries: PinMatrixRow[] = [
    {
      id: 'gnssTx',
      name: 'GNSS UART TX (ESP -> GNSS RX)',
      pin: config.pins.gnssTx,
      bus: 'UART',
      onUpdate: (v) => updatePin('gnssTx', v),
    },
    {
      id: 'gnssRx',
      name: 'GNSS UART RX (ESP <- GNSS TX)',
      pin: config.pins.gnssRx,
      bus: 'UART',
      onUpdate: (v) => updatePin('gnssRx', v),
    },
    {
      id: 'gnssReset',
      name: 'GNSS Hardware Reset',
      pin: config.pins.gnssReset,
      bus: 'GPIO',
      onUpdate: (v) => updatePin('gnssReset', v),
    },
    {
      id: 'gnssPps',
      name: 'GNSS PPS / TimePulse',
      pin: config.pins.gnssPps,
      bus: 'Interrupt',
      onUpdate: (v) => updatePin('gnssPps', v),
    },
    {
      id: 'i2cSda',
      name: 'I2C Bus SDA',
      pin: config.pins.i2cSda,
      bus: 'I2C',
      onUpdate: (v) => updatePin('i2cSda', v),
    },
    {
      id: 'i2cScl',
      name: 'I2C Bus SCL',
      pin: config.pins.i2cScl,
      bus: 'I2C',
      onUpdate: (v) => updatePin('i2cScl', v),
    },
    {
      id: 'statusLed',
      name: 'Status Indicator LED',
      pin: config.pins.statusLed,
      bus: 'GPIO',
      onUpdate: (v) => updatePin('statusLed', v),
    },
  ];

  // Include Screen Add-on pins if enabled
  if (config.addons.screen.enabled) {
    if (config.addons.screen.pins.cs >= 0) {
      pinEntries.push({
        id: 'screenCs',
        name: 'Add-on Screen CS',
        pin: config.addons.screen.pins.cs,
        bus: 'SPI',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, cs: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.dc >= 0) {
      pinEntries.push({
        id: 'screenDc',
        name: 'Add-on Screen DC',
        pin: config.addons.screen.pins.dc,
        bus: 'SPI',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, dc: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.rst >= 0) {
      pinEntries.push({
        id: 'screenRst',
        name: 'Add-on Screen RST',
        pin: config.addons.screen.pins.rst,
        bus: 'GPIO',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, rst: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.busy >= 0) {
      pinEntries.push({
        id: 'screenBusy',
        name: 'E-Ink Screen BUSY',
        pin: config.addons.screen.pins.busy,
        bus: 'GPIO',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, busy: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.ec11A >= 0) {
      pinEntries.push({
        id: 'ec11A',
        name: 'EC11 Rotary Dial A (CLK)',
        pin: config.addons.screen.pins.ec11A,
        bus: 'GPIO/IRQ',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, ec11A: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.ec11B >= 0) {
      pinEntries.push({
        id: 'ec11B',
        name: 'EC11 Rotary Dial B (DT)',
        pin: config.addons.screen.pins.ec11B,
        bus: 'GPIO/IRQ',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, ec11B: v },
              },
            },
          }),
      });
    }
    if (config.addons.screen.pins.ec11Btn >= 0) {
      pinEntries.push({
        id: 'ec11Btn',
        name: 'EC11 Rotary Switch (SW)',
        pin: config.addons.screen.pins.ec11Btn,
        bus: 'GPIO',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              screen: {
                ...config.addons.screen,
                pins: { ...config.addons.screen.pins, ec11Btn: v },
              },
            },
          }),
      });
    }
  }

  // Include MicroSD pins if enabled
  if (config.addons.sd.enabled) {
    pinEntries.push({
      id: 'sdCs',
      name: 'MicroSD SPI CS',
      pin: config.addons.sd.pins.cs,
      bus: 'SPI',
      onUpdate: (v) => {
        updatePin('sdCs', v);
        onChangeConfig({
          ...config,
          pins: { ...config.pins, sdCs: v },
          addons: {
            ...config.addons,
            sd: { ...config.addons.sd, pins: { ...config.addons.sd.pins, cs: v } },
          },
        });
      },
    });
    if (config.addons.sd.pins.cd >= 0) {
      pinEntries.push({
        id: 'sdCd',
        name: 'MicroSD Card Detect',
        pin: config.addons.sd.pins.cd,
        bus: 'GPIO',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              sd: { ...config.addons.sd, pins: { ...config.addons.sd.pins, cd: v } },
            },
          }),
      });
    }
  }

  // Include LoRa pins if enabled
  if (config.addons.lora.enabled) {
    if (config.addons.lora.chip.includes('uart')) {
      pinEntries.push({
        id: 'loraTx',
        name: 'LoRa UART TX (ESP TX -> EBYTE RX)',
        pin: config.addons.lora.pins.tx,
        bus: 'UART',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, tx: v } },
            },
          }),
      });
      pinEntries.push({
        id: 'loraRx',
        name: 'LoRa UART RX (ESP RX <- EBYTE TX)',
        pin: config.addons.lora.pins.rx,
        bus: 'UART',
        onUpdate: (v) =>
          onChangeConfig({
            ...config,
            addons: {
              ...config.addons,
              lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, rx: v } },
            },
          }),
      });
      if (config.addons.lora.pins.aux >= 0) {
        pinEntries.push({
          id: 'loraAux',
          name: 'LoRa AUX Line',
          pin: config.addons.lora.pins.aux,
          bus: 'GPIO',
          onUpdate: (v) =>
            onChangeConfig({
              ...config,
              addons: {
                ...config.addons,
                lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, aux: v } },
              },
            }),
        });
      }
    } else {
      pinEntries.push({
        id: 'loraCs',
        name: 'LoRa Radio SPI CS',
        pin: config.addons.lora.pins.cs,
        bus: 'SPI',
        onUpdate: (v) => {
          updatePin('loraCs', v);
          onChangeConfig({
            ...config,
            pins: { ...config.pins, loraCs: v },
            addons: {
              ...config.addons,
              lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, cs: v } },
            },
          });
        },
      });
      if (config.addons.lora.pins.rst >= 0) {
        pinEntries.push({
          id: 'loraRst',
          name: 'LoRa Radio RST',
          pin: config.addons.lora.pins.rst,
          bus: 'GPIO',
          onUpdate: (v) =>
            onChangeConfig({
              ...config,
              addons: {
                ...config.addons,
                lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, rst: v } },
              },
            }),
        });
      }
      if (config.addons.lora.pins.dio1 >= 0) {
        pinEntries.push({
          id: 'loraDio1',
          name: 'LoRa Radio DIO1/IRQ',
          pin: config.addons.lora.pins.dio1,
          bus: 'Interrupt',
          onUpdate: (v) =>
            onChangeConfig({
              ...config,
              addons: {
                ...config.addons,
                lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, dio1: v } },
              },
            }),
        });
      }
      if (config.addons.lora.pins.busy >= 0) {
        pinEntries.push({
          id: 'loraBusy',
          name: 'LoRa SX1262 BUSY',
          pin: config.addons.lora.pins.busy,
          bus: 'GPIO',
          onUpdate: (v) =>
            onChangeConfig({
              ...config,
              addons: {
                ...config.addons,
                lora: { ...config.addons.lora, pins: { ...config.addons.lora.pins, busy: v } },
              },
            }),
        });
      }
    }
  }

  // Detect duplicate pins (excluding -1 unassigned)
  const usedPins: { [pin: number]: string[] } = {};
  pinEntries.forEach((entry) => {
    if (entry.pin >= 0) {
      if (!usedPins[entry.pin]) usedPins[entry.pin] = [];
      usedPins[entry.pin].push(entry.name);
    }
  });

  const conflicts = Object.entries(usedPins).filter(([_, names]) => names.length > 1);

  // Strapping pins warnings for classic ESP32
  const strappingPinsESP32 = [0, 2, 12, 15];
  const strappingWarnings: string[] = [];
  if (selectedBoard.family === 'esp32') {
    pinEntries.forEach((entry) => {
      if (strappingPinsESP32.includes(entry.pin)) {
        strappingWarnings.push(
          `GPIO ${entry.pin} (${entry.name}) is an ESP32 strapping pin. Ensure external pull-up/pull-down does not interfere with boot mode.`
        );
      }
    });
  }

  const resetToBoardDefaults = () => {
    onChangeConfig({
      ...config,
      pins: {
        gnssTx: selectedBoard.defaultPins.gnssTx,
        gnssRx: selectedBoard.defaultPins.gnssRx,
        gnssReset: selectedBoard.defaultPins.gnssReset ?? -1,
        gnssPps: selectedBoard.defaultPins.gnssPps ?? -1,
        i2cSda: selectedBoard.defaultPins.i2cSda ?? 21,
        i2cScl: selectedBoard.defaultPins.i2cScl ?? 22,
        sdCs: selectedBoard.defaultPins.sdCs ?? -1,
        loraCs: selectedBoard.defaultPins.loraCs ?? -1,
        statusLed: selectedBoard.defaultPins.ledStatus ?? 2,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cable className="w-5 h-5 text-cyan-400" />
            Pin Routing Matrix & Bus Allocator
          </h3>
          <p className="text-xs text-slate-400">
            Customize GPIO assignments between {selectedBoard.name}, GNSS, and attached daughter boards. All pins are validated for conflicts.
          </p>
        </div>

        <button
          onClick={resetToBoardDefaults}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          Reset to {selectedBoard.family.toUpperCase()} Defaults
        </button>
      </div>

      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200 space-y-1">
          <div className="flex items-center space-x-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Pin Assignment Conflict Detected:</span>
          </div>
          {conflicts.map(([pin, names]) => (
            <p key={pin} className="text-red-300 pl-6">
              GPIO {pin} is assigned to multiple functions: {names.join(', ')}
            </p>
          ))}
        </div>
      )}

      {/* Strapping pins warning */}
      {strappingWarnings.length > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-200 space-y-1">
          <div className="flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Hardware Strapping Pin Caution:</span>
          </div>
          {strappingWarnings.slice(0, 2).map((warn, i) => (
            <p key={i} className="text-amber-300/80 pl-6">
              {warn}
            </p>
          ))}
        </div>
      )}

      {/* Pin Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Interface Function</th>
                <th className="py-3 px-4">Protocol Bus</th>
                <th className="py-3 px-4">Assigned GPIO</th>
                <th className="py-3 px-4">Status & Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {pinEntries.map((entry) => {
                const isConflicted = usedPins[entry.pin]?.length > 1;
                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {entry.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {entry.bus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono">GPIO</span>
                        <input
                          type="number"
                          value={entry.pin}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            if (entry.onUpdate) entry.onUpdate(val);
                          }}
                          className={`w-20 px-2.5 py-1 bg-slate-950 border rounded font-mono text-center focus:outline-none ${
                            isConflicted
                              ? 'border-red-500 text-red-300 bg-red-950/20'
                              : 'border-slate-700 text-white focus:border-cyan-500'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isConflicted ? (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Conflict
                        </span>
                      ) : entry.pin < 0 ? (
                        <span className="text-slate-500">Unassigned (-1)</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
