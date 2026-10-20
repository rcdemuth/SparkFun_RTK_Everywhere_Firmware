import React, { useState } from 'react';
import {
  Cable,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Wrench,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Info,
  Radio,
  Layers,
  Check,
} from 'lucide-react';
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
  bus: 'UART' | 'I2C' | 'SPI' | 'GPIO' | 'Interrupt' | 'Input';
  description: string;
  onUpdate?: (val: number) => void;
}

export const PinMatrixEditor: React.FC<Props> = ({
  selectedBoard,
  config,
  onChangeConfig,
}) => {
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  const updatePin = (key: keyof SystemConfiguration['pins'], val: number) => {
    onChangeConfig({
      ...config,
      pins: {
        ...config.pins,
        [key]: val,
      },
    });
    setResolutionNotice(null);
  };

  // Compile full active pin map
  const pinEntries: PinMatrixRow[] = [
    {
      id: 'gnssTx',
      name: 'GNSS UART TX',
      pin: config.pins.gnssTx,
      bus: 'UART',
      description: 'ESP32 Serial TX ➔ GNSS RX (UBX/NMEA commands at 460800 baud)',
      onUpdate: (v) => updatePin('gnssTx', v),
    },
    {
      id: 'gnssRx',
      name: 'GNSS UART RX',
      pin: config.pins.gnssRx,
      bus: 'UART',
      description: 'ESP32 Serial RX ⬅ GNSS TX (Continuous High-rate UBX/RTCM stream)',
      onUpdate: (v) => updatePin('gnssRx', v),
    },
    {
      id: 'gnssReset',
      name: 'GNSS Hardware Reset',
      pin: config.pins.gnssReset,
      bus: 'GPIO',
      description: 'Active-low hardware reset trigger (Optional / -1 if not wired)',
      onUpdate: (v) => updatePin('gnssReset', v),
    },
    {
      id: 'gnssPps',
      name: 'GNSS PPS / TimePulse',
      pin: config.pins.gnssPps,
      bus: 'Interrupt',
      description: 'Sub-microsecond synchronization interrupt pulse (Input)',
      onUpdate: (v) => updatePin('gnssPps', v),
    },
    {
      id: 'i2cSda',
      name: 'I2C Bus SDA',
      pin: config.pins.i2cSda,
      bus: 'I2C',
      description: 'Two-Wire Serial Data (OLED, IMU/Tilt, Barometer, Qwiic/Stemma)',
      onUpdate: (v) => updatePin('i2cSda', v),
    },
    {
      id: 'i2cScl',
      name: 'I2C Bus SCL',
      pin: config.pins.i2cScl,
      bus: 'I2C',
      description: 'Two-Wire Serial Clock (Standard 400kHz Wire bus)',
      onUpdate: (v) => updatePin('i2cScl', v),
    },
    {
      id: 'statusLed',
      name: 'Status Indicator LED',
      pin: config.pins.statusLed,
      bus: 'GPIO',
      description: 'RTK Fix/Float visual blinking LED (Active High/Low)',
      onUpdate: (v) => updatePin('statusLed', v),
    },
  ];

  // Screen Add-on pins
  if (config.addons.screen.enabled) {
    if (config.addons.screen.pins.cs >= 0) {
      pinEntries.push({
        id: 'screenCs',
        name: 'Add-on Screen CS',
        pin: config.addons.screen.pins.cs,
        bus: 'SPI',
        description: 'Display Controller SPI Chip Select',
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
        bus: 'GPIO',
        description: 'TFT/E-Ink Data / Command selector pin',
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
        description: 'Display hardware reset line',
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
        bus: 'Interrupt',
        description: 'E-Ink display refresh active indicator (Input)',
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
        bus: 'Interrupt',
        description: 'Quadrature encoder channel A transition interrupt',
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
        bus: 'GPIO',
        description: 'Quadrature encoder channel B direction sense',
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
        description: 'Push-button center click trigger',
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

  // MicroSD pins
  if (config.addons.sd.enabled) {
    pinEntries.push({
      id: 'sdCs',
      name: 'MicroSD SPI CS',
      pin: config.addons.sd.pins.cs,
      bus: 'SPI',
      description: 'SPI Chip Select for SD card file logger',
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
        bus: 'Input',
        description: 'Physical card insertion switch sense line',
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

  // LoRa pins
  if (config.addons.lora.enabled) {
    if (config.addons.lora.chip.includes('uart')) {
      pinEntries.push({
        id: 'loraTx',
        name: 'LoRa UART TX',
        pin: config.addons.lora.pins.tx,
        bus: 'UART',
        description: 'ESP32 Serial TX ➔ EBYTE LoRa Module RX',
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
        name: 'LoRa UART RX',
        pin: config.addons.lora.pins.rx,
        bus: 'UART',
        description: 'ESP32 Serial RX ⬅ EBYTE LoRa Module TX',
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
          bus: 'Input',
          description: 'EBYTE buffer empty & transmission busy pin',
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
        description: 'SX1262/SX1276 SPI Chip Select',
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
          description: 'SX1262 hardware reset trigger',
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
          description: 'SX1262 Packet TxDone / RxDone interrupt (Input)',
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
          bus: 'Input',
          description: 'SX1262 internal state machine busy signal (Input)',
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

  // Dedicated check: UART and I2C shared pin collision!
  const uartPins = [
    config.pins.gnssTx,
    config.pins.gnssRx,
    config.addons.lora.enabled && config.addons.lora.chip.includes('uart')
      ? config.addons.lora.pins.tx
      : -1,
    config.addons.lora.enabled && config.addons.lora.chip.includes('uart')
      ? config.addons.lora.pins.rx
      : -1,
  ].filter((p) => p >= 0);

  const i2cPins = [config.pins.i2cSda, config.pins.i2cScl].filter((p) => p >= 0);

  const uartI2cCollisions: { pin: number; uart: string; i2c: string }[] = [];
  uartPins.forEach((uPin) => {
    if (i2cPins.includes(uPin)) {
      const uName =
        uPin === config.pins.gnssTx
          ? 'GNSS TX'
          : uPin === config.pins.gnssRx
          ? 'GNSS RX'
          : 'LoRa UART';
      const iName = uPin === config.pins.i2cSda ? 'I2C SDA' : 'I2C SCL';
      uartI2cCollisions.push({ pin: uPin, uart: uName, i2c: iName });
    }
  });

  // Strapping pins warnings for classic ESP32
  const strappingPinsESP32 = [0, 2, 12, 15];
  const strappingWarnings: string[] = [];
  if (selectedBoard.family === 'esp32') {
    pinEntries.forEach((entry) => {
      if (strappingPinsESP32.includes(entry.pin)) {
        strappingWarnings.push(
          `GPIO ${entry.pin} (${entry.name}) is an ESP32 strapping pin. Ensure external pull-up/down resistors do not alter boot mode.`
        );
      }
    });
  }

  // Safe GPIO pools per architecture
  const getSafeGpioPool = (family: string): number[] => {
    switch (family) {
      case 'esp32':
        // Safe free bidirectional GPIOs on ESP32 (avoiding flash 6-11, and input-only 34-39)
        return [21, 22, 25, 26, 27, 16, 17, 4, 32, 33, 14, 13, 18, 19, 23];
      case 'esp32-s3':
        // Safe free GPIOs on ESP32-S3
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 21, 38, 43, 44];
      case 'esp32-c3':
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21];
      case 'esp32-c6':
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      case 'rp2040':
      case 'rp2350':
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 28];
      default:
        return [21, 22, 25, 26, 27, 16, 17, 4, 5];
    }
  };

  // Smart Auto-Resolve Bus Overlaps & Separate UART from I2C
  const autoResolveConflicts = () => {
    const safePool = getSafeGpioPool(selectedBoard.family);
    const assigned = new Set<number>();

    // Step 1: Keep onboard fixed hardware pins untouched
    if (selectedBoard.hasDisplay && selectedBoard.defaultPins.displayCs) {
      assigned.add(selectedBoard.defaultPins.displayCs);
    }
    if (selectedBoard.hasDisplay && selectedBoard.defaultPins.displayDc) {
      assigned.add(selectedBoard.defaultPins.displayDc);
    }
    if (selectedBoard.hasDisplay && selectedBoard.defaultPins.touchCs) {
      assigned.add(selectedBoard.defaultPins.touchCs);
    }
    if (selectedBoard.hasMicroSD && selectedBoard.defaultPins.sdCs) {
      assigned.add(selectedBoard.defaultPins.sdCs);
    }

    // Step 2: Establish GNSS UART pins (primary mission-critical bus)
    let newGnssTx = config.pins.gnssTx;
    let newGnssRx = config.pins.gnssRx;
    if (newGnssTx < 0 || assigned.has(newGnssTx)) {
      newGnssTx = safePool.find((p) => !assigned.has(p)) ?? 27;
    }
    assigned.add(newGnssTx);

    if (newGnssRx < 0 || assigned.has(newGnssRx)) {
      newGnssRx = safePool.find((p) => !assigned.has(p)) ?? 22;
    }
    assigned.add(newGnssRx);

    // Step 3: Establish I2C Bus (must be strictly separated from UART)
    let newSda = config.pins.i2cSda;
    let newScl = config.pins.i2cScl;

    // If I2C shares any pin with GNSS UART or already assigned, find a fresh pair
    if (
      newSda === newGnssTx ||
      newSda === newGnssRx ||
      newScl === newGnssTx ||
      newScl === newGnssRx ||
      newSda === newScl ||
      assigned.has(newSda) ||
      assigned.has(newScl)
    ) {
      // Find candidate I2C pair
      const freePins = safePool.filter((p) => !assigned.has(p));
      if (selectedBoard.family === 'esp32') {
        // Preferred secondary pair on ESP32 is 25 & 26 (or 21 & 22 if free)
        if (!assigned.has(25) && !assigned.has(26)) {
          newSda = 25;
          newScl = 26;
        } else if (!assigned.has(21) && !assigned.has(22)) {
          newSda = 21;
          newScl = 22;
        } else {
          newSda = freePins[0] ?? 25;
          newScl = freePins[1] ?? 26;
        }
      } else if (selectedBoard.family === 'esp32-s3') {
        if (!assigned.has(1) && !assigned.has(2)) {
          newSda = 1;
          newScl = 2;
        } else if (!assigned.has(8) && !assigned.has(9)) {
          newSda = 8;
          newScl = 9;
        } else {
          newSda = freePins[0] ?? 1;
          newScl = freePins[1] ?? 2;
        }
      } else if (selectedBoard.family === 'esp32-c3') {
        if (!assigned.has(4) && !assigned.has(5)) {
          newSda = 4;
          newScl = 5;
        } else {
          newSda = freePins[0] ?? 4;
          newScl = freePins[1] ?? 5;
        }
      } else {
        newSda = freePins[0] ?? 4;
        newScl = freePins[1] ?? 5;
      }
    }
    assigned.add(newSda);
    assigned.add(newScl);

    // Step 4: PPS pin (can use input-only pins like GPIO 35 on ESP32)
    let newPps = config.pins.gnssPps;
    if (newPps >= 0 && assigned.has(newPps)) {
      if (selectedBoard.family === 'esp32') {
        newPps = 35; // Input-only pin 35 is ideal for PPS interrupt
      } else {
        const free = safePool.find((p) => !assigned.has(p));
        newPps = free ?? -1;
      }
    }
    if (newPps >= 0) assigned.add(newPps);

    // Step 5: Status LED
    let newLed = config.pins.statusLed;
    if (newLed >= 0 && assigned.has(newLed)) {
      const free = safePool.find((p) => !assigned.has(p));
      newLed = free ?? (selectedBoard.family === 'esp32' ? 4 : 8);
    }
    if (newLed >= 0) assigned.add(newLed);

    // Step 6: MicroSD and LoRa CS
    let newSdCs = config.pins.sdCs;
    if (newSdCs >= 0 && assigned.has(newSdCs)) {
      const free = safePool.find((p) => !assigned.has(p));
      newSdCs = free ?? -1;
    }
    if (newSdCs >= 0) assigned.add(newSdCs);

    let newLoraCs = config.pins.loraCs;
    if (newLoraCs >= 0 && assigned.has(newLoraCs)) {
      const free = safePool.find((p) => !assigned.has(p));
      newLoraCs = free ?? -1;
    }
    if (newLoraCs >= 0) assigned.add(newLoraCs);

    // Apply configuration
    onChangeConfig({
      ...config,
      pins: {
        ...config.pins,
        gnssTx: newGnssTx,
        gnssRx: newGnssRx,
        i2cSda: newSda,
        i2cScl: newScl,
        gnssPps: newPps,
        statusLed: newLed,
        sdCs: newSdCs,
        loraCs: newLoraCs,
      },
    });

    setResolutionNotice(
      `Auto-resolved bus assignments: GNSS UART set to GPIO ${newGnssTx}/${newGnssRx}, I2C Wire Bus isolated to GPIO ${newSda}/${newScl}. All bus collisions resolved.`
    );
  };

  const resetToBoardDefaults = () => {
    onChangeConfig({
      ...config,
      pins: {
        gnssTx: selectedBoard.defaultPins.gnssTx,
        gnssRx: selectedBoard.defaultPins.gnssRx,
        gnssReset: selectedBoard.defaultPins.gnssReset ?? -1,
        gnssPps: selectedBoard.defaultPins.gnssPps ?? -1,
        i2cSda: selectedBoard.defaultPins.i2cSda ?? 25,
        i2cScl: selectedBoard.defaultPins.i2cScl ?? 26,
        sdCs: selectedBoard.defaultPins.sdCs ?? -1,
        loraCs: selectedBoard.defaultPins.loraCs ?? -1,
        statusLed: selectedBoard.defaultPins.ledStatus ?? 2,
      },
    });
    setResolutionNotice(`Reset all pin definitions to factory defaults for ${selectedBoard.name}.`);
  };

  // Quick I2C Pair setter
  const setI2cPair = (sda: number, scl: number) => {
    onChangeConfig({
      ...config,
      pins: {
        ...config.pins,
        i2cSda: sda,
        i2cScl: scl,
      },
    });
    setResolutionNotice(`I2C Bus reallocated to SDA: GPIO ${sda}, SCL: GPIO ${scl}.`);
  };

  // Bus Badge styling
  const getBusBadge = (bus: PinMatrixRow['bus']) => {
    switch (bus) {
      case 'UART':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/80';
      case 'I2C':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80';
      case 'SPI':
        return 'bg-purple-950/70 text-purple-300 border-purple-800/80';
      case 'Interrupt':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80';
      case 'Input':
        return 'bg-blue-950/70 text-blue-300 border-blue-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cable className="w-5 h-5 text-cyan-400" />
            Pin Routing Matrix & Bus Allocator
          </h3>
          <p className="text-xs text-slate-400">
            Hardware signal matrix for {selectedBoard.name}. Enforces physical bus isolation between GNSS UART, I2C Wire, SPI peripherals, and daughter boards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {conflicts.length > 0 && (
            <button
              onClick={autoResolveConflicts}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-amber-900/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Resolve Collisions</span>
            </button>
          )}

          <button
            onClick={resetToBoardDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset {selectedBoard.family.toUpperCase()} Defaults</span>
          </button>
        </div>
      </div>

      {/* Success / Resolution Notice */}
      {resolutionNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/90 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resolutionNotice}</span>
          </div>
          <button
            onClick={() => setResolutionNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-medium ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Critical UART vs I2C Overlap Warning */}
      {uartI2cCollisions.length > 0 && (
        <div className="p-4 bg-red-950/80 border-2 border-red-700 rounded-xl text-xs text-red-200 space-y-2.5 shadow-lg shadow-red-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              <span>Hardware Bus Conflict: UART & I2C Sharing Same GPIO!</span>
            </div>
            <button
              onClick={autoResolveConflicts}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-xs shadow transition flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" /> Separate Buses Now
            </button>
          </div>
          <p className="text-red-300 leading-relaxed">
            GNSS Serial UART (push-pull framing at 460800 baud) and I2C Wire (open-drain bidirectional clock/data) are assigned to the same physical pin:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {uartI2cCollisions.map((c, i) => (
              <div
                key={i}
                className="bg-red-900/40 border border-red-800 p-2 rounded-lg flex items-center justify-between"
              >
                <span className="font-mono font-semibold text-red-200">GPIO {c.pin}</span>
                <span className="text-[11px] text-red-300">
                  Used by <strong className="text-amber-300">{c.uart}</strong> &{' '}
                  <strong className="text-cyan-300">{c.i2c}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Duplicate Conflicts Banner */}
      {conflicts.length > 0 && uartI2cCollisions.length === 0 && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-700/80 rounded-xl text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Duplicate Pin Allocation Detected:</span>
            </div>
            <button
              onClick={autoResolveConflicts}
              className="px-2.5 py-0.5 bg-amber-800 hover:bg-amber-700 text-white rounded text-[11px] font-medium transition"
            >
              Auto-Resolve
            </button>
          </div>
          {conflicts.map(([pin, names]) => (
            <p key={pin} className="text-amber-300/90 pl-6 font-mono">
              GPIO {pin} is shared by: {names.join(' + ')}
            </p>
          ))}
        </div>
      )}

      {/* Strapping pins warning */}
      {strappingWarnings.length > 0 && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
          <div className="flex items-center space-x-2 font-medium text-amber-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ESP32 Hardware Boot Strapping Caution:</span>
          </div>
          {strappingWarnings.slice(0, 2).map((warn, i) => (
            <p key={i} className="text-slate-400 pl-6 text-[11px]">
              {warn}
            </p>
          ))}
        </div>
      )}

      {/* Quick I2C Allocation Presets */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Quick I2C Bus Relocation:</span>
          <span className="text-[11px] text-slate-400">Switch I2C to conflict-free hardware pairs:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectedBoard.family === 'esp32' && (
            <>
              <button
                onClick={() => setI2cPair(25, 26)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 25 && config.pins.i2cScl === 26
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 25 (SDA) / 26 (SCL)
              </button>
              <button
                onClick={() => setI2cPair(21, 22)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 21 && config.pins.i2cScl === 22
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 21 (SDA) / 22 (SCL)
              </button>
              <button
                onClick={() => setI2cPair(32, 33)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 32 && config.pins.i2cScl === 33
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 32 (SDA) / 33 (SCL)
              </button>
            </>
          )}

          {selectedBoard.family === 'esp32-s3' && (
            <>
              <button
                onClick={() => setI2cPair(1, 2)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 1 && config.pins.i2cScl === 2
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 1 (SDA) / 2 (SCL) [Qwiic/Stemma]
              </button>
              <button
                onClick={() => setI2cPair(8, 9)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 8 && config.pins.i2cScl === 9
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 8 (SDA) / 9 (SCL)
              </button>
              <button
                onClick={() => setI2cPair(11, 12)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 11 && config.pins.i2cScl === 12
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 11 (SDA) / 12 (SCL)
              </button>
            </>
          )}

          {selectedBoard.family === 'esp32-c3' && (
            <>
              <button
                onClick={() => setI2cPair(4, 5)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 4 && config.pins.i2cScl === 5
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 4 (SDA) / 5 (SCL) [Standard C3 Wire]
              </button>
              <button
                onClick={() => setI2cPair(5, 6)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 5 && config.pins.i2cScl === 6
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 5 (SDA) / 6 (SCL) [OLED Default]
              </button>
            </>
          )}

          {(selectedBoard.family === 'esp32-c6' ||
            selectedBoard.family === 'rp2040' ||
            selectedBoard.family === 'rp2350') && (
            <>
              <button
                onClick={() => setI2cPair(6, 7)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 6 && config.pins.i2cScl === 7
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 6 (SDA) / 7 (SCL)
              </button>
              <button
                onClick={() => setI2cPair(4, 5)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  config.pins.i2cSda === 4 && config.pins.i2cScl === 5
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GPIO 4 (SDA) / 5 (SCL)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pin Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Interface Signal</th>
                <th className="py-3 px-4">Hardware Bus</th>
                <th className="py-3 px-4">Signal Description & Role</th>
                <th className="py-3 px-4">Assigned Pin</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {pinEntries.map((entry) => {
                const isConflicted = usedPins[entry.pin]?.length > 1;
                const isUartI2cCollision =
                  isConflicted &&
                  uartI2cCollisions.some((c) => c.pin === entry.pin);

                return (
                  <tr
                    key={entry.id}
                    className={`transition ${
                      isUartI2cCollision
                        ? 'bg-red-950/30 hover:bg-red-950/40'
                        : isConflicted
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          entry.bus === 'UART'
                            ? 'bg-amber-400'
                            : entry.bus === 'I2C'
                            ? 'bg-cyan-400'
                            : entry.bus === 'SPI'
                            ? 'bg-purple-400'
                            : 'bg-emerald-400'
                        }`}
                      ></span>
                      <span className="font-semibold">{entry.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBusBadge(
                          entry.bus
                        )}`}
                      >
                        {entry.bus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono text-[11px]">GPIO</span>
                        <input
                          type="number"
                          value={entry.pin}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (entry.onUpdate) entry.onUpdate(isNaN(val) ? -1 : val);
                          }}
                          className={`w-20 px-2.5 py-1 bg-slate-950 border rounded font-mono text-center focus:outline-none ${
                            isUartI2cCollision
                              ? 'border-red-500 text-red-200 bg-red-950/40 ring-1 ring-red-500'
                              : isConflicted
                              ? 'border-amber-500 text-amber-200 bg-amber-950/30 ring-1 ring-amber-500'
                              : 'border-slate-700 text-white focus:border-cyan-500'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isUartI2cCollision ? (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" /> UART/I2C Conflict
                        </span>
                      ) : isConflicted ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" /> Overlap
                        </span>
                      ) : entry.pin < 0 ? (
                        <span className="text-slate-500 text-[11px]">Unassigned (-1)</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Isolated & Ready
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
