import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BoardSelector } from './components/BoardSelector';
import { GnssTiltSelector } from './components/GnssTiltSelector';
import { PinMatrixEditor } from './components/PinMatrixEditor';
import { RoleAndComms } from './components/RoleAndComms';
import { CydTouchSimulator } from './components/CydTouchSimulator';
import { CodeOutputModal } from './components/CodeOutputModal';
import { LiveConsole } from './components/LiveConsole';
import { HardwareCatalogModal } from './components/HardwareCatalogModal';
import { AddonAccessoriesEditor } from './components/AddonAccessoriesEditor';
import { CloudCompilerModal } from './components/CloudCompilerModal';
import { BOARDS } from './data/boards';
import { GNSS_MODULES } from './data/gnssModules';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration } from './types/config';
import { Bookmark, Sparkles, Layers, Sliders, Check, Cloud } from 'lucide-react';

const VALID_TABS = ['builder', 'cloud_compiler', 'catalog', 'cyd_simulator', 'live_console', 'code_export'];

export const App: React.FC = () => {
  // Default selected board: Cheap Yellow Display (CYD) ESP32-2432S028 as explicitly requested by user
  const [selectedBoard, setSelectedBoard] = useState<BoardDefinition>(
    BOARDS.find((b) => b.id === 'cyd-esp32-2432s028') || BOARDS[0]
  );

  // Default selected GNSS: Unicorecomm UM981 with integrated onboard IMU tilt correction
  const [selectedGnss, setSelectedGnss] = useState<GnssChipDefinition>(
    GNSS_MODULES.find((g) => g.id === 'um981') || GNSS_MODULES[0]
  );

  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return VALID_TABS.includes(hash) ? hash : 'builder';
  };

  const [activeNav, setActiveNav] = useState<string>(getInitialTab);

  // Sync hash changes for GitHub Pages direct links & browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(hash)) {
        setActiveNav(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSetActiveNav = (tab: string) => {
    setActiveNav(tab);
    window.location.hash = tab;
  };

  const [config, setConfig] = useState<SystemConfiguration>({
    boardId: 'cyd-esp32-2432s028',
    gnssId: 'um981',
    deviceRole: 'rover',
    allowDynamicRoleSwitch: true,
    defaultComms: {
      roverCorrectionSource: 'ntrip_wifi',
      baseCorrectionBroadcast: 'ntrip_caster',
      dataCollectorOutput: 'bluetooth_spp',
      wifiMode: 'ap_config',
      allowInFieldProtocolSwitching: true,
    },
    btMode: 'classic_spp',
    pins: {
      gnssTx: 27,
      gnssRx: 22,
      gnssReset: -1,
      gnssPps: 35,
      i2cSda: 25,
      i2cScl: 26,
      sdCs: 5,
      loraCs: -1,
      statusLed: 4,
    },
    tilt: {
      enabled: true,
      useOnboardImu: true,
      externalImuType: 'none',
      poleHeightMeters: 1.8,
      leverArmX: 0.0,
      leverArmY: 0.0,
      leverArmZ: -0.05,
      autoRockCalibration: true,
      maxTiltAngleDeg: 35,
    },
    baseConfig: {
      mode: 'survey_in',
      surveyInDurationSec: 180,
      surveyInAccuracyMeters: 1.5,
      fixedLat: 40.0902948,
      fixedLon: -105.1850576,
      fixedAlt: 1560.089,
      ntripServerEnabled: true,
      ntripHost: 'rtk2go.com',
      ntripPort: 2101,
      ntripMountpoint: 'SPARKPNT_BASE_TEST',
      ntripPassword: 'BETAPASSWORD',
      loraBroadcastEnabled: false,
      loraFrequencyMhz: 915.0,
      espNowBroadcastEnabled: false,
    },
    features: {
      enableTouchUI: true,
      enableWebServer: false, // false by default on 4MB CYD to preserve flash budget
      enableSdLogging: true,
      enableNtripClient: true,
      enableLoRa: false,
      enableEspNow: false,
      espNowChannel: 1,
      enableOta: false,
      enablePpl: false,
    },
    addons: {
      screen: {
        enabled: false,
        type: 'none',
        i2cAddress: '0x3C',
        pins: {
          sda: 21,
          scl: 22,
          cs: 15,
          dc: 2,
          rst: 4,
          busy: -1,
          blk: 27,
          ec11A: -1,
          ec11B: -1,
          ec11Btn: -1,
        },
      },
      sd: {
        enabled: true,
        mode: 'spi',
        pins: {
          cs: 5,
          mosi: 23,
          miso: 19,
          sck: 18,
          cd: -1,
        },
        logRawUbx: true,
        logNmea: true,
        logRinex: false,
      },
      lora: {
        enabled: false,
        chip: 'sx1262',
        frequencyMhz: 915.0,
        powerDbm: 20,
        pins: {
          cs: 18,
          rst: 23,
          dio1: 26,
          busy: 27,
          tx: 17,
          rx: 16,
          aux: 4,
          m0: 2,
          m1: 15,
        },
      },
    },
    switches: [
      {
        id: 'sw_pwr',
        label: 'Power & Sleep Button',
        poleType: 'spst',
        actionType: 'momentary',
        contactType: 'normally_open',
        style: 'push_button',
        function: 'power_sleep',
        gpio1: 34,
        pullMode: 'pullup',
        debounceMs: 50,
      },
      {
        id: 'sw_mode',
        label: 'GNSS Operating Mode (Rover/Base)',
        poleType: 'spdt',
        actionType: 'latching',
        contactType: 'normally_open',
        style: 'toggle',
        function: 'gnss_mode_switch',
        gpio1: 0,
        gpio2: 35,
        pullMode: 'pullup',
        debounceMs: 80,
      },
      {
        id: 'sw_bt',
        label: 'Bluetooth Pairing Button',
        poleType: 'spst',
        actionType: 'momentary',
        contactType: 'normally_open',
        style: 'tactile',
        function: 'bt_pairing',
        gpio1: 32,
        pullMode: 'pullup',
        debounceMs: 40,
      },
      {
        id: 'sw_wp',
        label: 'Stakeout Mark Waypoint Button',
        poleType: 'spst',
        actionType: 'momentary',
        contactType: 'normally_open',
        style: 'push_button',
        function: 'mark_waypoint',
        gpio1: 33,
        pullMode: 'pullup',
        debounceMs: 30,
      },
    ],
    leds: [
      {
        id: 'led_pwr',
        label: 'Power & Battery / Charging LED',
        type: 'discrete_single',
        color: 'yellow',
        function: 'power_battery',
        pin: 25,
        activeHigh: true,
        resistorValue: '220Ω (1/4W)',
        resistorNote: '220Ω current-limiting resistor required in series with Anode',
      },
      {
        id: 'led_bt',
        label: 'Bluetooth Connection LED',
        type: 'discrete_single',
        color: 'blue',
        function: 'bt_status',
        pin: 26,
        activeHigh: true,
        resistorValue: '100Ω (1/4W)',
        resistorNote: '100Ω resistor in series with Anode',
      },
      {
        id: 'led_rtk',
        label: 'RTK Fix Status LED',
        type: 'discrete_single',
        color: 'green',
        function: 'rtk_fix_status',
        pin: 27,
        activeHigh: true,
        resistorValue: '150Ω (1/4W)',
        resistorNote: '150Ω resistor in series (Solid = Fixed, Slow Blink = Float)',
      },
      {
        id: 'led_base',
        label: 'GNSS Mode / Base TX LED',
        type: 'discrete_single',
        color: 'red',
        function: 'gnss_mode',
        pin: 4,
        activeHigh: true,
        resistorValue: '220Ω (1/4W)',
        resistorNote: '220Ω in series (Red LED Vf ≈ 1.9V)',
      },
    ],
  });

  const handleSelectBoard = (newBoard: BoardDefinition) => {
    setSelectedBoard(newBoard);
    const isC3orC6 = newBoard.family === 'esp32-c3' || newBoard.family === 'esp32-c6';

    setConfig((prev) => ({
      ...prev,
      boardId: newBoard.id,
      btMode: isC3orC6 ? 'ble_only' : prev.btMode,
      pins: {
        gnssTx: newBoard.defaultPins.gnssTx,
        gnssRx: newBoard.defaultPins.gnssRx,
        gnssReset: newBoard.defaultPins.gnssReset ?? -1,
        gnssPps: newBoard.defaultPins.gnssPps ?? -1,
        i2cSda: newBoard.defaultPins.i2cSda ?? 21,
        i2cScl: newBoard.defaultPins.i2cScl ?? 22,
        sdCs: newBoard.defaultPins.sdCs ?? -1,
        loraCs: newBoard.defaultPins.loraCs ?? -1,
        statusLed: newBoard.defaultPins.ledStatus ?? 2,
      },
      features: {
        ...prev.features,
        enableTouchUI: !!newBoard.hasDisplay,
        enableSdLogging: newBoard.hasMicroSD,
        enableLoRa: newBoard.hasLoRa,
        // Disable heavy webserver on <=4MB flash to guarantee fit
        enableWebServer: newBoard.flashSizeMB > 4,
      },
    }));
  };

  const handleSelectGnss = (newGnss: GnssChipDefinition) => {
    setSelectedGnss(newGnss);
    setConfig((prev) => ({
      ...prev,
      gnssId: newGnss.id,
      tilt: {
        ...prev.tilt,
        enabled: newGnss.hasOnboardIMU,
        useOnboardImu: newGnss.hasOnboardIMU,
        externalImuType: newGnss.hasOnboardIMU ? 'none' : 'im19',
      },
    }));
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: string) => {
    if (presetName === 'cyd_um981_tilt') {
      const b = BOARDS.find((x) => x.id === 'cyd-esp32-2432s028')!;
      const g = GNSS_MODULES.find((x) => x.id === 'um981')!;
      setSelectedBoard(b);
      setSelectedGnss(g);
      handleSelectBoard(b);
      handleSelectGnss(g);
    } else if (presetName === 'c6_lc29h_ble') {
      const b = BOARDS.find((x) => x.id === 'waveshare-c6-lcd-147')!;
      const g = GNSS_MODULES.find((x) => x.id === 'lc29h')!;
      setSelectedBoard(b);
      setSelectedGnss(g);
      handleSelectBoard(b);
      handleSelectGnss(g);
    } else if (presetName === 's3_k827_tilt') {
      const b = BOARDS.find((x) => x.id === 'ai-s3-n16r8')!;
      const g = GNSS_MODULES.find((x) => x.id === 'commnav_k827_k922')!;
      setSelectedBoard(b);
      setSelectedGnss(g);
      handleSelectBoard(b);
      handleSelectGnss(g);
    } else if (presetName === 'cyd_k802_rover') {
      const b = BOARDS.find((x) => x.id === 'cyd-esp32-2432s028')!;
      const g = GNSS_MODULES.find((x) => x.id === 'comnav_k802')!;
      setSelectedBoard(b);
      setSelectedGnss(g);
      handleSelectBoard(b);
      handleSelectGnss(g);
    } else if (presetName === 'lilygo_f9p_base') {
      const b = BOARDS.find((x) => x.id === 'lilygo-lora32-v21')!;
      const g = GNSS_MODULES.find((x) => x.id === 'zed_f9p')!;
      setSelectedBoard(b);
      setSelectedGnss(g);
      handleSelectBoard(b);
      handleSelectGnss(g);
      setConfig((p) => ({ ...p, deviceRole: 'base' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        selectedBoard={selectedBoard}
        selectedGnss={selectedGnss}
        config={config}
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        onOpenExport={() => handleSetActiveNav('code_export')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Presets Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">Recommended Tested Profiles:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('cyd_um981_tilt')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 transition"
            >
              🎯 CYD 2.8" + UM981 Onboard Tilt Rover
            </button>
            <button
              onClick={() => applyPreset('c6_lc29h_ble')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
            >
              ⚡ ESP32-C6 LCD + LC29H Pure BLE
            </button>
            <button
              onClick={() => applyPreset('s3_k827_tilt')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition"
            >
              🚀 S3 N16R8 + ComNav K827 Tilt Station
            </button>
            <button
              onClick={() => applyPreset('cyd_k802_rover')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700 transition"
            >
              📍 CYD + ComNav K802 Micro-Rover
            </button>
            <button
              onClick={() => applyPreset('lilygo_f9p_base')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 transition"
            >
              📻 LilyGO LoRa + ZED-F9P Base Caster
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {activeNav === 'catalog' && (
          <HardwareCatalogModal
            onSelectCombo={(b, g) => {
              handleSelectBoard(b);
              handleSelectGnss(g);
              handleSetActiveNav('builder');
            }}
          />
        )}

        {activeNav === 'builder' && (
          <div className="space-y-8">
            <BoardSelector selectedBoard={selectedBoard} onSelectBoard={handleSelectBoard} />
            <GnssTiltSelector
              selectedGnss={selectedGnss}
              onSelectGnss={handleSelectGnss}
              config={config}
              onChangeConfig={setConfig}
            />
            <AddonAccessoriesEditor
              selectedBoard={selectedBoard}
              config={config}
              onChangeConfig={setConfig}
            />
            <RoleAndComms
              selectedBoard={selectedBoard}
              config={config}
              onChangeConfig={setConfig}
            />
            <PinMatrixEditor
              selectedBoard={selectedBoard}
              config={config}
              onChangeConfig={setConfig}
            />
            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => handleSetActiveNav('cloud_compiler')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                <span>Compile in Cloud (Zero Install) →</span>
              </button>

              <button
                onClick={() => handleSetActiveNav('code_export')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold shadow transition"
              >
                Inspect C++ / JSON →
              </button>
            </div>
          </div>
        )}

        {activeNav === 'cloud_compiler' && (
          <CloudCompilerModal
            selectedBoard={selectedBoard}
            selectedGnss={selectedGnss}
            config={config}
          />
        )}

        {activeNav === 'cyd_simulator' && (
          <CydTouchSimulator
            selectedBoard={selectedBoard}
            selectedGnss={selectedGnss}
            config={config}
            onChangeConfig={setConfig}
          />
        )}

        {activeNav === 'live_console' && (
          <LiveConsole selectedGnss={selectedGnss} config={config} />
        )}

        {activeNav === 'code_export' && (
          <CodeOutputModal
            selectedBoard={selectedBoard}
            selectedGnss={selectedGnss}
            config={config}
            onOpenCloudCompiler={() => handleSetActiveNav('cloud_compiler')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Universal RTK Everywhere Firmware Studio • Supporting ESP32, S3, C3, C6, RP2040 Pico •
          Unicore UM980/UM981, ComNav K827/K922, Bynav M21/M22, Quectel, u-blox F9P
        </p>
      </footer>
    </div>
  );
};
export default App;
