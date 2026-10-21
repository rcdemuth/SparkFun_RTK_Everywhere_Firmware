import {
  BoardDefinition,
  GnssChipDefinition,
  SystemConfiguration,
  SwitchItemConfig,
  LedItemConfig,
} from '../types/config';

export function generateBoardConfigJson(
  config: SystemConfiguration,
  board: BoardDefinition,
  gnss: GnssChipDefinition
): string {
  const jsonOutput = {
    schema_version: '2.1.0',
    generated_at: new Date().toISOString(),
    hardware: {
      board: {
        id: board.id,
        name: board.name,
        architecture: board.family,
        flash_size_mb: board.flashSizeMB,
        psram_size_mb: board.psramMB,
        has_bluetooth_classic: board.hasBluetoothClassic,
        has_ble: board.hasBLE,
        has_wifi: board.hasWiFi,
        has_lora: board.hasLoRa,
        display: board.hasDisplay
          ? {
              type: board.displayType,
              resolution: board.displayResolution,
              touch: !!board.hasTouch,
            }
          : null,
        microsd_slot: board.hasMicroSD,
        battery_management: board.hasBatteryMgmt,
      },
      gnss_module: {
        id: gnss.id,
        name: gnss.name,
        manufacturer: gnss.manufacturer,
        default_baud: gnss.baudRate,
        protocol: gnss.protocol,
        has_onboard_imu: gnss.hasOnboardIMU,
        tilt_type: gnss.tiltType,
      },
      pin_mapping: {
        gnss_uart: {
          tx_to_gnss_rx: config.pins.gnssTx,
          rx_from_gnss_tx: config.pins.gnssRx,
          pps: config.pins.gnssPps,
          reset: config.pins.gnssReset,
        },
        i2c_bus: {
          sda: config.pins.i2cSda,
          scl: config.pins.i2cScl,
        },
        storage: {
          sd_spi_cs: config.pins.sdCs,
        },
        radio: {
          lora_cs: config.pins.loraCs,
        },
        status_led: config.pins.statusLed,
      },
      daughter_boards_and_addons: {
        screen: config.addons.screen.enabled
          ? {
              type: config.addons.screen.type,
              i2c_address: config.addons.screen.i2cAddress,
              pins: config.addons.screen.pins,
            }
          : null,
        microsd: config.addons.sd.enabled
          ? {
              interface_mode: config.addons.sd.mode,
              pins: config.addons.sd.pins,
              log_raw_ubx: config.addons.sd.logRawUbx,
              log_nmea: config.addons.sd.logNmea,
              log_rinex: config.addons.sd.logRinex,
            }
          : null,
        external_lora: config.addons.lora.enabled
          ? {
              transceiver_chip: config.addons.lora.chip,
              frequency_mhz: config.addons.lora.frequencyMhz,
              tx_power_dbm: config.addons.lora.powerDbm,
              pins: config.addons.lora.pins,
            }
          : null,
      },
      switches: config.switches || [],
      status_leds: config.leds || [],
    },
    system_profile: {
      operating_role: config.deviceRole,
      bluetooth_mode: config.btMode,
      tilt_engine: {
        enabled: config.tilt.enabled,
        onboard_imu_active: config.tilt.useOnboardImu && gnss.hasOnboardIMU,
        external_imu_fallback: config.tilt.externalImuType,
        pole_height_meters: config.tilt.poleHeightMeters,
        antenna_lever_arm: {
          x: config.tilt.leverArmX,
          y: config.tilt.leverArmY,
          z: config.tilt.leverArmZ,
        },
        max_tilt_angle_deg: config.tilt.maxTiltAngleDeg,
        auto_rock_calibration: config.tilt.autoRockCalibration,
        initialization_commands: config.tilt.useOnboardImu && gnss.hasOnboardIMU
          ? [
              ...gnss.tiltCompensationCommands.enable,
              gnss.tiltCompensationCommands.setPoleHeight(config.tilt.poleHeightMeters),
              ...(gnss.tiltCompensationCommands.setLeverArm
                ? [
                    gnss.tiltCompensationCommands.setLeverArm(
                      config.tilt.leverArmX,
                      config.tilt.leverArmY,
                      config.tilt.leverArmZ
                    ),
                  ]
                : []),
            ]
          : [],
      },
      default_role: config.deviceRole,
      runtime_switching: {
        allow_dynamic_role_switch: config.allowDynamicRoleSwitch !== false,
        allow_in_field_protocol_switch: config.defaultComms?.allowInFieldProtocolSwitching !== false,
        nvs_storage_enabled: true,
        supported_interfaces: [
          'cyd_touchscreen_button',
          'wifi_captive_portal_192_168_4_1',
          'bluetooth_ble_cli',
          'oled_rotary_button_menu',
          'usb_serial_menu',
        ],
      },
      default_comms: {
        rover_correction_source: config.defaultComms?.roverCorrectionSource || 'ntrip_wifi',
        base_correction_broadcast: config.defaultComms?.baseCorrectionBroadcast || 'ntrip_caster',
        data_collector_output: config.defaultComms?.dataCollectorOutput || 'bluetooth_spp',
        wifi_mode: config.defaultComms?.wifiMode || 'ap_config',
      },
      base_station_settings:
        config.deviceRole === 'base' || config.allowDynamicRoleSwitch !== false
          ? {
              mode: config.baseConfig.mode,
              survey_in: {
                duration_sec: config.baseConfig.surveyInDurationSec,
                target_accuracy_m: config.baseConfig.surveyInAccuracyMeters,
              },
              fixed_coordinates: {
                lat: config.baseConfig.fixedLat,
                lon: config.baseConfig.fixedLon,
                alt_m: config.baseConfig.fixedAlt,
              },
              ntrip_caster: {
                enabled: config.baseConfig.ntripServerEnabled,
                host: config.baseConfig.ntripHost,
                port: config.baseConfig.ntripPort,
                mountpoint: config.baseConfig.ntripMountpoint,
              },
              lora_radio_broadcast: {
                enabled: config.baseConfig.loraBroadcastEnabled,
                frequency_mhz: config.baseConfig.loraFrequencyMhz,
              },
              esp_now_broadcast: {
                enabled: config.baseConfig.espNowBroadcastEnabled || config.features.enableEspNow,
                channel: config.features.espNowChannel || 1,
              },
            }
          : null,
      compilation_flags: {
        dual_role_support: config.allowDynamicRoleSwitch !== false,
        touch_gui: config.features.enableTouchUI && !!board.hasDisplay,
        web_server: config.features.enableWebServer && board.flashSizeMB >= 8,
        sd_logging: (config.features.enableSdLogging && board.hasMicroSD) || config.addons.sd.enabled,
        ntrip_client: config.features.enableNtripClient,
        lora_transceiver: (config.features.enableLoRa && board.hasLoRa) || config.addons.lora.enabled,
        esp_now: config.features.enableEspNow && board.family !== 'rp2040',
        ota_update: config.features.enableOta && board.flashSizeMB >= 8,
      },
    },
  };

  return JSON.stringify(jsonOutput, null, 2);
}

export function generateCppHeader(
  config: SystemConfiguration,
  board: BoardDefinition,
  gnss: GnssChipDefinition
): string {
  const isC3orC6 = board.family === 'esp32-c3' || board.family === 'esp32-c6';
  const hasOnboardImuTilt = config.tilt.enabled && config.tilt.useOnboardImu && gnss.hasOnboardIMU;
  const screen = config.addons.screen;
  const sd = config.addons.sd;
  const lora = config.addons.lora;

  const activeSwitches: SwitchItemConfig[] =
    config.switches && config.switches.length > 0
      ? config.switches
      : [
          {
            id: 'sw_pwr',
            label: 'Main Power & Sleep',
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
            label: 'Rover / Base Toggle',
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
            label: 'Bluetooth Pairing',
            poleType: 'spst',
            actionType: 'momentary',
            contactType: 'normally_open',
            style: 'tactile',
            function: 'bt_pairing',
            gpio1: 32,
            pullMode: 'pullup',
            debounceMs: 40,
          },
        ];

  const activeLeds: LedItemConfig[] =
    config.leds && config.leds.length > 0
      ? config.leds
      : [
          {
            id: 'led_pwr',
            label: 'Power & Battery',
            type: 'discrete_single',
            color: 'yellow',
            function: 'power_battery',
            pin: 25,
            activeHigh: true,
            resistorValue: '220Ω (1/4W)',
            resistorNote: '220Ω in series with Anode',
          },
          {
            id: 'led_bt',
            label: 'Bluetooth Link',
            type: 'discrete_single',
            color: 'blue',
            function: 'bt_status',
            pin: 26,
            activeHigh: true,
            resistorValue: '100Ω (1/4W)',
            resistorNote: '100Ω in series',
          },
          {
            id: 'led_rtk',
            label: 'RTK Fix Precision',
            type: 'discrete_single',
            color: 'green',
            function: 'rtk_fix_status',
            pin: 27,
            activeHigh: true,
            resistorValue: '150Ω (1/4W)',
            resistorNote: '150Ω in series',
          },
          {
            id: 'led_base',
            label: 'GNSS Mode Indicator',
            type: 'discrete_single',
            color: 'red',
            function: 'gnss_mode',
            pin: 2,
            activeHigh: true,
            resistorValue: '220Ω (1/4W)',
            resistorNote: '220Ω in series',
          },
        ];

  return `/*
 * Modular RTK Everywhere Hardware & Firmware Profile
 * Target Board: ${board.name}
 * GNSS Engine:  ${gnss.name}
 * Generated:    ${new Date().toISOString()}
 * Auto-generated by Universal RTK Firmware Studio
 */

#ifndef __MODULAR_RTK_CONFIG_H__
#define __MODULAR_RTK_CONFIG_H__

// ==========================================
// 1. BOARD ARCHITECTURE & SILICON DEFINITION
// ==========================================
#define BOARD_ID_${board.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}
#define BOARD_NAME "${board.name}"
#define MCU_FAMILY_${board.family.toUpperCase().replace(/[^A-Z0-9]/g, '_')}
#define BOARD_FLASH_SIZE_MB ${board.flashSizeMB}
#define BOARD_PSRAM_SIZE_MB ${board.psramMB}

${board.psramMB === 0 ? '// Low Memory Target: PSRAM Not Available\n#define NO_PSRAM_AVAILABLE 1\n#define RING_BUFFER_SIZE_SMALL 2048' : '// High Memory Target: PSRAM Enabled\n#define HAS_EXTERNAL_PSRAM 1\n#define RING_BUFFER_SIZE_DEFAULT 16384'}

// ==========================================
// 2. GNSS RECEIVER & ONBOARD TILT PROFILE
// ==========================================
#define GNSS_MODEL_${gnss.id.toUpperCase()}
#define GNSS_DEFAULT_BAUD ${gnss.baudRate}
#define GNSS_PROTOCOL_${gnss.protocol.toUpperCase()}

${hasOnboardImuTilt ? `// --- NATIVE ONBOARD GNSS IMU TILT COMPENSATION ---
#define GNSS_HAS_ONBOARD_IMU 1
#define TILT_COMPENSATION_NATIVE 1
#define TILT_POLE_HEIGHT_M ${config.tilt.poleHeightMeters.toFixed(3)}f
#define TILT_LEVER_ARM_X ${config.tilt.leverArmX.toFixed(4)}f
#define TILT_LEVER_ARM_Y ${config.tilt.leverArmY.toFixed(4)}f
#define TILT_LEVER_ARM_Z ${config.tilt.leverArmZ.toFixed(4)}f
#define TILT_MAX_ANGLE_DEG ${config.tilt.maxTiltAngleDeg}
#define TILT_AUTO_ROCK_ALIGN ${config.tilt.autoRockCalibration ? '1' : '0'}
` : `// --- EXTERNAL OR NO TILT COMPENSATION ---
#define GNSS_HAS_ONBOARD_IMU 0
${config.tilt.enabled ? `#define TILT_COMPENSATION_EXTERNAL 1\n#define EXTERNAL_IMU_TYPE_${config.tilt.externalImuType.toUpperCase()}` : '#define TILT_COMPENSATION_DISABLED 1'}
`}

// ==========================================
// 3. HARDWARE PIN MATRIX ASSIGNMENTS
// ==========================================
// GNSS Serial Interconnect (UART)
#define PIN_GNSS_TX ${config.pins.gnssTx}  // ESP Pin sending to GNSS RX
#define PIN_GNSS_RX ${config.pins.gnssRx}  // ESP Pin receiving from GNSS TX
#define PIN_GNSS_RESET ${config.pins.gnssReset}
#define PIN_GNSS_PPS ${config.pins.gnssPps}

// I2C Peripheral Bus
#define PIN_I2C_SDA ${config.pins.i2cSda}
#define PIN_I2C_SCL ${config.pins.i2cScl}
#define PIN_STATUS_LED ${config.pins.statusLed}

${board.hasDisplay && board.displayType === 'tft_spi_touch' ? `// Integrated Board Touchscreen (CYD / ILI9341 + XPT2046)
#define HAS_SPI_TOUCH_DISPLAY 1
#define PIN_TFT_CS ${board.defaultPins.displayCs ?? 15}
#define PIN_TFT_DC ${board.defaultPins.displayDc ?? 2}
#define PIN_TOUCH_CS ${board.defaultPins.touchCs ?? 33}
#define PIN_TOUCH_IRQ ${board.defaultPins.touchIrq ?? 36}
` : ''}

// ==========================================
// 4. ADD-ON DAUGHTER BOARDS & ACCESSORIES
// ==========================================
${screen.enabled && screen.type !== 'none' ? `// --- ADD-ON DISPLAY SCREEN MODULE ---
#define HAS_ADDON_SCREEN 1
#define ADDON_SCREEN_TYPE_${screen.type.toUpperCase()} 1
#define ADDON_SCREEN_I2C_ADDR ${screen.i2cAddress || '0x27'}
#define PIN_SCREEN_SDA ${screen.pins.sda}
#define PIN_SCREEN_SCL ${screen.pins.scl}
#define PIN_SCREEN_CS ${screen.pins.cs}
#define PIN_SCREEN_DC ${screen.pins.dc}
#define PIN_SCREEN_RST ${screen.pins.rst}
#define PIN_SCREEN_BUSY ${screen.pins.busy}
#define PIN_SCREEN_BLK ${screen.pins.blk}
${screen.type === 'lcd1602_i2c' ? `// 1602 Character LCD via I2C PCF8574 Backpack
#define USE_LIQUIDCRYSTAL_I2C 1
#define LCD1602_I2C_ADDR ${screen.i2cAddress || '0x27'}
#define LCD1602_COLS 16
#define LCD1602_ROWS 2
` : screen.type === 'lcd1602_parallel' ? `// 1602 Character LCD via 4-Bit Parallel GPIO
#define USE_LIQUIDCRYSTAL_PARALLEL 1
#define PIN_LCD_RS ${screen.pins.lcdRs ?? 19}
#define PIN_LCD_EN ${screen.pins.lcdEn ?? 23}
#define PIN_LCD_D4 ${screen.pins.lcdD4 ?? 18}
#define PIN_LCD_D5 ${screen.pins.lcdD5 ?? 5}
#define PIN_LCD_D6 ${screen.pins.lcdD6 ?? 17}
#define PIN_LCD_D7 ${screen.pins.lcdD7 ?? 16}
#define LCD1602_COLS 16
#define LCD1602_ROWS 2
` : ''}
${screen.pins.ec11A >= 0 ? `// EC11 Rotary Encoder Dial
#define HAS_EC11_ROTARY_ENCODER 1
#define PIN_EC11_A ${screen.pins.ec11A}
#define PIN_EC11_B ${screen.pins.ec11B}
#define PIN_EC11_BTN ${screen.pins.ec11Btn}
` : ''}
` : '// No Add-on Screen Configured'}

${sd.enabled ? `// --- MICROSD / TF CARD LOGGING MODULE ---
#define HAS_ADDON_SD 1
#define SD_INTERFACE_${sd.mode.toUpperCase()} 1
#define PIN_SD_CS ${sd.pins.cs}
#define PIN_SD_CD ${sd.pins.cd}
#define SD_LOG_RAW_UBX ${sd.logRawUbx ? '1' : '0'}
#define SD_LOG_NMEA ${sd.logNmea ? '1' : '0'}
#define SD_LOG_RINEX ${sd.logRinex ? '1' : '0'}
` : `// Internal or Disabled SD
#define PIN_SD_CS ${config.pins.sdCs}
`}

${lora.enabled ? `// --- EXTERNAL LORA TRANSCEIVER MODULE ---
#define HAS_ADDON_LORA 1
#define LORA_CHIP_${lora.chip.toUpperCase()} 1
#define LORA_FREQUENCY_MHZ ${lora.frequencyMhz}f
#define LORA_TX_POWER_DBM ${lora.powerDbm}
#define PIN_LORA_CS ${lora.pins.cs}
#define PIN_LORA_RST ${lora.pins.rst}
#define PIN_LORA_DIO1 ${lora.pins.dio1}
#define PIN_LORA_BUSY ${lora.pins.busy}
#define PIN_LORA_UART_TX ${lora.pins.tx}
#define PIN_LORA_UART_RX ${lora.pins.rx}
#define PIN_LORA_AUX ${lora.pins.aux}
#define PIN_LORA_M0 ${lora.pins.m0}
#define PIN_LORA_M1 ${lora.pins.m1}
` : `// Internal or Disabled LoRa
#define PIN_LORA_CS ${config.pins.loraCs}
`}

// ==========================================
// 5. HARDWARE SWITCHES & BUTTONS (GPIO WIRED)
// ==========================================
${activeSwitches.map((sw) => `// ${sw.label} (${sw.poleType.toUpperCase()} - ${sw.actionType})
#define PIN_SW_${sw.id.toUpperCase()} ${sw.gpio1}
${sw.gpio2 !== undefined ? `#define PIN_SW_${sw.id.toUpperCase()}_TH2 ${sw.gpio2}` : ''}
${sw.gpio3 !== undefined ? `#define PIN_SW_${sw.id.toUpperCase()}_P2_TH1 ${sw.gpio3}` : ''}
${sw.gpio4 !== undefined ? `#define PIN_SW_${sw.id.toUpperCase()}_P2_TH2 ${sw.gpio4}` : ''}
#define SW_DEBOUNCE_MS_${sw.id.toUpperCase()} ${sw.debounceMs || 50}
#define SW_PULL_${sw.id.toUpperCase()} ${sw.pullMode === 'pullup' ? 'INPUT_PULLUP' : sw.pullMode === 'pulldown' ? 'INPUT_PULLDOWN' : 'INPUT'}
#define SW_FUNCTION_${sw.id.toUpperCase()} FUNCTION_${sw.function.toUpperCase()}
`).join('\n')}

// ==========================================
// 6. STATUS LEDS & ADDRESSABLE LED STRIPS
// ==========================================
${activeLeds.map((led) => `// ${led.label} (${led.type}, ${led.color}, ${led.function})
// Required Resistor: ${led.resistorValue}
#define PIN_LED_${led.id.toUpperCase()} ${led.pin}
${led.type === 'rgb_discrete' && led.rgbPins ? `#define PIN_LED_${led.id.toUpperCase()}_R ${led.rgbPins.r}\n#define PIN_LED_${led.id.toUpperCase()}_G ${led.rgbPins.g}\n#define PIN_LED_${led.id.toUpperCase()}_B ${led.rgbPins.b}\n// RGB Note: Use 3 separate resistors (Red: 220Ω, Green: 150Ω, Blue: 100Ω)` : ''}
${led.type === 'addressable_strip' ? `#define HAS_WS2812B_STRIP 1\n#define WS2812B_DATA_PIN ${led.pin}\n#define WS2812B_NUM_PIXELS ${led.stripPixelCount || 8}\n// NeoPixel Note: 330Ω data resistor + 1000uF capacitor across +5V and GND` : ''}
`).join('\n')}

// ==========================================
// 7. OPERATING ROLE & IN-FIELD SWITCHING
// ==========================================
// Default Power-On Personality (NVS Non-Volatile Storage key "rtkMode"):
#define DEFAULT_RTK_MODE ${
  config.deviceRole === 'rover'
    ? 'RTK_MODE_ROVER'
    : config.baseConfig.mode === 'fixed_llh' || config.baseConfig.mode === 'fixed_ecef'
    ? 'RTK_MODE_BASE_FIXED'
    : 'RTK_MODE_BASE_SURVEY_IN'
}

// In-field dynamic role & protocol switching:
#define ALLOW_IN_FIELD_MODE_SWITCHING ${config.allowDynamicRoleSwitch !== false ? '1' : '0'}
#define NVS_PERSIST_RUNTIME_SETTINGS 1

// Compiles dual-role algorithms (allows field switching without reflashing):
#define COMPILE_ROVER_MODE 1
#define COMPILE_BASE_MODE 1

// Default Communication Protocols (hot-swappable in field via Web Portal / CYD Touch / BLE):
#define DEFAULT_ROVER_CORRECTION_SOURCE_${(config.defaultComms?.roverCorrectionSource || 'ntrip_wifi').toUpperCase()} 1
#define DEFAULT_BASE_BROADCAST_${(config.defaultComms?.baseCorrectionBroadcast || 'ntrip_caster').toUpperCase()} 1
#define DEFAULT_DATA_OUTPUT_${(config.defaultComms?.dataCollectorOutput || 'bluetooth_spp').toUpperCase()} 1
#define DEFAULT_WIFI_MODE_${(config.defaultComms?.wifiMode || 'ap_config').toUpperCase()} 1
#define ALLOW_IN_FIELD_PROTOCOL_SWITCHING ${config.defaultComms?.allowInFieldProtocolSwitching !== false ? '1' : '0'}

${isC3orC6 || config.btMode === 'ble_only' ? `// Pure BLE UART (Nordic UART Service - NUS)
#define COMPILE_BLE_ONLY 1
#undef COMPILE_BT_CLASSIC_SPP
#define BLE_SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define BLE_CHAR_RX_UUID "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define BLE_CHAR_TX_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
` : config.btMode === 'classic_spp' ? `// Classic Bluetooth SPP (High throughput NMEA/RTCM)
#define COMPILE_BT_CLASSIC_SPP 1
#undef COMPILE_BLE_ONLY
` : `// Dual Bluetooth (SPP + BLE)
#define COMPILE_BT_CLASSIC_SPP 1
#define COMPILE_BLE_ONLY 1
`}

// ==========================================
// 6. MEMORY SAFETY & FEATURE COMPILATION
// ==========================================
${board.flashSizeMB <= 4 ? `// 4MB Flash Budget Optimization:
#define COMPILE_MINIMAL_MEMORY 1
#undef COMPILE_CELLULAR
#undef COMPILE_AUTHENTICATION
#undef COMPILE_POINTPERFECT_LIBRARY
` : `// 8MB/16MB Flash Available:
#define COMPILE_FULL_SERVICES 1
`}

${config.features.enableTouchUI && board.hasDisplay ? '#define ENABLE_TOUCH_UI 1' : '#undef ENABLE_TOUCH_UI'}
${(config.features.enableSdLogging && board.hasMicroSD) || sd.enabled ? '#define ENABLE_SD_LOGGING 1' : '#undef ENABLE_SD_LOGGING'}
${(config.features.enableLoRa && board.hasLoRa) || lora.enabled ? '#define ENABLE_LORA_RADIO 1' : '#undef ENABLE_LORA_RADIO'}
${config.features.enableEspNow && board.family !== 'rp2040' ? `// ESP-NOW 2.4GHz Peer-to-Peer RTCM Direct Link
#define COMPILE_ESPNOW 1
#define ESPNOW_CHANNEL ${config.features.espNowChannel || 1}
#define ESPNOW_MAX_PACKET_LEN 250
` : `// ESP-NOW Disabled
#undef COMPILE_ESPNOW
`}

#endif // __MODULAR_RTK_CONFIG_H__
`;
}

export function generatePlatformIoIni(
  board: BoardDefinition,
  gnss: GnssChipDefinition,
  config?: SystemConfiguration
): string {
  let envName = 'esp32dev';
  let platform = 'espressif32';
  let boardTarget = 'esp32dev';

  if (board.family === 'esp32-s3') {
    envName = 'esp32-s3';
    boardTarget = board.psramMB > 0 ? 'esp32-s3-devkitc-1' : 'esp32-s3-devkitc-1';
  } else if (board.family === 'esp32-c3') {
    envName = 'esp32-c3';
    boardTarget = 'esp32-c3-devkitm-1';
  } else if (board.family === 'esp32-c6') {
    envName = 'esp32-c6';
    boardTarget = 'esp32-c6-devkitc-1';
  } else if (board.family === 'rp2040') {
    return `; PlatformIO Configuration for Raspberry Pi Pico
[env:pico]
platform = raspberrypi
board = pico
framework = arduino
monitor_speed = 115200
build_flags =
    -D BOARD_PICO=1
    -D GNSS_MODEL_${gnss.id.toUpperCase()}=1
lib_deps =
    arduino-libraries/SD
`;
  }

  const flashFlags =
    board.flashSizeMB >= 16
      ? `board_build.flash_mode = qio\nboard_build.flash_size = 16MB\nboard_build.partitions = default_16MB.csv`
      : board.flashSizeMB >= 8
      ? `board_build.flash_mode = dio\nboard_build.flash_size = 8MB\nboard_build.partitions = default_8MB.csv`
      : `board_build.flash_mode = dio\nboard_build.flash_size = 4MB\nboard_build.partitions = min_spiffs.csv`;

  const extraLibs: string[] = ['greiman/SdFat@2.1.1'];

  if (config) {
    const screen = config.addons.screen;
    if (screen.enabled) {
      if (screen.type === 'lcd1602_i2c') {
        extraLibs.push('marcoschwartz/LiquidCrystal_I2C@1.1.4');
      } else if (screen.type === 'lcd1602_parallel') {
        extraLibs.push('arduino-libraries/LiquidCrystal');
      } else if (screen.type === 'ssd1306_096_i2c') {
        extraLibs.push('adafruit/Adafruit SSD1306');
        extraLibs.push('adafruit/Adafruit GFX Library');
      } else if (
        screen.type === 'sh1106_13_i2c' ||
        screen.type === 'ssd1315_keypad_i2c' ||
        screen.type === 'oled_ec11_combo'
      ) {
        extraLibs.push('olikraus/U8g2');
      } else if (
        screen.type === 'st7735s_18_spi' ||
        screen.type === 'st7789_24_spi' ||
        screen.type === 'tft_ec11_combo'
      ) {
        extraLibs.push('bodmer/TFT_eSPI');
      } else if (screen.type === 'eink_ssd1680') {
        extraLibs.push('zinggjm/GxEPD2');
      }

      if (screen.pins.ec11A >= 0) {
        extraLibs.push('mathertel/RotaryEncoder');
      }
    }

    if (config.leds && config.leds.some((l) => l.type === 'addressable_strip')) {
      extraLibs.push('adafruit/Adafruit NeoPixel@^1.12.0');
    }

    if (config.addons.lora.enabled || board.hasLoRa) {
      extraLibs.push('jgromes/RadioLib');
    }
  } else {
    if (board.hasDisplay) {
      extraLibs.push('bodmer/TFT_eSPI');
      extraLibs.push('paulstoffregen/XPT2046_Touchscreen');
    }
    if (board.hasLoRa) {
      extraLibs.push('jgromes/RadioLib');
    }
  }

  const libDepsFormatted = extraLibs.map((lib) => `    ${lib}`).join('\n');

  return `[env:${envName}]
platform = ${platform}
board = ${boardTarget}
framework = arduino
monitor_speed = 115200
${flashFlags}
build_flags =
    -D BOARD_${board.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}=1
    -D GNSS_${gnss.id.toUpperCase()}=1
    -D CORE_DEBUG_LEVEL=0
    ${board.family === 'esp32-c3' || board.family === 'esp32-c6' ? '-D COMPILE_BLE_ONLY=1' : ''}
    ${board.psramMB > 0 ? '-D BOARD_HAS_PSRAM=1' : ''}
lib_deps =
${libDepsFormatted}
`;
}

export function estimateMemoryBudget(
  board: BoardDefinition,
  config: SystemConfiguration,
  gnss: GnssChipDefinition
): {
  estimatedFlashKB: number;
  maxFlashKB: number;
  flashPercent: number;
  estimatedRamKB: number;
  maxRamKB: number;
  ramPercent: number;
  status: 'safe' | 'warning' | 'danger';
  issues: string[];
} {
  let flashKB = 920; // Core FreeRTOS + Serial base
  let ramKB = 65; // Base heap required

  const issues: string[] = [];

  // Bluetooth impact
  if (config.btMode === 'classic_spp' || config.btMode === 'ble_and_spp') {
    if (!board.hasBluetoothClassic) {
      issues.push(
        `Critical: ${board.name} has NO Bluetooth Classic hardware. Must use BLE Only.`
      );
    } else {
      flashKB += 650;
      ramKB += 85;
    }
  }

  if (config.btMode === 'ble_only' || config.btMode === 'ble_and_spp') {
    flashKB += 320;
    ramKB += 35;
  }

  // WiFi / WebServer
  if (config.features.enableWebServer) {
    flashKB += 420;
    ramKB += 45;
  }

  // NTRIP Client / Networking TLS
  if (config.features.enableNtripClient) {
    flashKB += 280;
    ramKB += 30;
  }

  // Display / GUI
  if (config.features.enableTouchUI && board.hasDisplay) {
    flashKB += 220;
    ramKB += 40;
  }

  // Add-on Screen
  if (config.addons?.screen?.enabled) {
    const t = config.addons.screen.type;
    if (t.includes('lcd1602')) {
      flashKB += 25;
      ramKB += 1;
    } else if (t.includes('oled') || t.includes('1306') || t.includes('1106') || t.includes('1315')) {
      flashKB += 80;
      ramKB += 12;
    } else if (t.includes('st77') || t.includes('tft')) {
      flashKB += 180;
      ramKB += 32;
    } else if (t.includes('eink')) {
      flashKB += 120;
      ramKB += 20;
    }
    if (config.addons.screen.pins.ec11A >= 0) {
      flashKB += 15;
      ramKB += 4;
    }
  }

  // SD Logging
  if ((config.features.enableSdLogging && board.hasMicroSD) || config.addons?.sd?.enabled) {
    flashKB += 110;
    ramKB += 18;
  }

  // LoRa
  if ((config.features.enableLoRa && board.hasLoRa) || config.addons?.lora?.enabled) {
    flashKB += 95;
    ramKB += 14;
  }

  // GNSS Driver & Tilt Engine
  flashKB += 80;
  ramKB += 16;
  if (config.tilt.enabled && gnss.hasOnboardIMU) {
    flashKB += 35;
    ramKB += 8;
  } else if (config.tilt.enabled) {
    flashKB += 90;
    ramKB += 25;
  }

  const maxFlashKB = board.flashSizeMB <= 4 ? 1900 : board.flashSizeMB * 600;
  const maxRamKB = board.family === 'esp32-c3' ? 240 : board.psramMB > 0 ? 4096 : 300;

  const flashPercent = Math.min(100, Math.round((flashKB / maxFlashKB) * 100));
  const ramPercent = Math.min(100, Math.round((ramKB / maxRamKB) * 100));

  let status: 'safe' | 'warning' | 'danger' = 'safe';

  if (board.flashSizeMB <= 4 && flashKB > 1850) {
    status = 'danger';
    issues.push(
      'Flash Overflow Risk: Target 4MB flash with dual OTA partitions cannot exceed ~1,900 KB. Disable WebServer or Bluetooth Classic.'
    );
  } else if (flashPercent > 85 || ramPercent > 85) {
    status = 'warning';
  }

  if (board.family === 'rp2040' && (config.btMode !== 'wifi_only' || config.features.enableWebServer)) {
    issues.push(
      'Raspberry Pi Pico RP2040 has no native wireless radios. Use external ESP-AT or USB CDC serial bridge.'
    );
  }

  return {
    estimatedFlashKB: flashKB,
    maxFlashKB,
    flashPercent,
    estimatedRamKB: ramKB,
    maxRamKB,
    ramPercent,
    status,
    issues,
  };
}
