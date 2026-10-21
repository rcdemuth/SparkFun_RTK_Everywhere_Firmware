import {
  AddonScreenType,
  SwitchFunction,
  SwitchStyle,
  SwitchPoleType,
  SwitchItemConfig,
  LedFunction,
  LedColor,
  LedType,
  LedItemConfig,
} from '../types/config';

export interface ScreenOption {
  type: AddonScreenType;
  name: string;
  driver: 'U8g2' | 'Adafruit_SSD1306' | 'TFT_eSPI' | 'GxEPD2' | 'LiquidCrystal_I2C' | 'LiquidCrystal';
  interface: 'I2C' | 'SPI' | 'Parallel';
  resolution: string;
  hasEncoder: boolean;
  hasKeypad: boolean;
  costRangeUSD: string;
  defaultPins: {
    sda?: number;
    scl?: number;
    cs?: number;
    dc?: number;
    rst?: number;
    busy?: number;
    blk?: number;
    ec11A?: number;
    ec11B?: number;
    ec11Btn?: number;
    lcdRs?: number;
    lcdEn?: number;
    lcdD4?: number;
    lcdD5?: number;
    lcdD6?: number;
    lcdD7?: number;
  };
  description: string;
  recommendedUse: string;
}

export const ADDON_SCREENS: ScreenOption[] = [
  {
    type: 'none',
    name: 'None / Headless / Using Onboard Display',
    driver: 'Adafruit_SSD1306',
    interface: 'I2C',
    resolution: 'N/A',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$0',
    defaultPins: {},
    description: 'No external add-on screen attached. Communicates purely over Bluetooth / Serial, or uses the development board’s built-in screen.',
    recommendedUse: 'Stealth headless nodes or boards with built-in screens (CYD, M5Stack, Waveshare, etc.)',
  },
  {
    type: 'lcd1602_i2c',
    name: '1602 Character LCD with I2C Backpack (PCF8574)',
    driver: 'LiquidCrystal_I2C',
    interface: 'I2C',
    resolution: '16x2 Character Matrix (32 chars)',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$2.00 - $3.50',
    defaultPins: {
      sda: 21,
      scl: 22,
    },
    description: 'Classic 16-character by 2-line alphanumeric LCD with PCF8574 I2C adapter backpack (address 0x27 or 0x3F). Near zero RAM overhead (under 250 bytes), immune to sunlight washout with high contrast backlight.',
    recommendedUse: 'Budget rugged survey base stations, field rovers, and solar battery monitoring stations.',
  },
  {
    type: 'lcd1602_parallel',
    name: '1602 Character LCD (Standard 4-Bit Parallel GPIO)',
    driver: 'LiquidCrystal',
    interface: 'Parallel',
    resolution: '16x2 Character Matrix (32 chars)',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$1.50 - $2.50',
    defaultPins: {
      lcdRs: 19,
      lcdEn: 23,
      lcdD4: 18,
      lcdD5: 5,
      lcdD6: 17,
      lcdD7: 16,
    },
    description: 'Direct 4-bit parallel GPIO driven HD44780 LCD without I2C backpack. Requires 6 digital GPIOs (RS, EN, D4-D7). Supported natively by standard Arduino LiquidCrystal library.',
    recommendedUse: 'Ultra-low cost builds utilizing surplus GPIOs on ESP32 or RP2040 Pico without requiring I2C backpack chips.',
  },
  {
    type: 'ssd1306_096_i2c',
    name: '0.96" OLED I2C 128x64 (SSD1306)',
    driver: 'Adafruit_SSD1306',
    interface: 'I2C',
    resolution: '128x64 Monochrome',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$2.00 - $3.50',
    defaultPins: {
      sda: 21,
      scl: 22,
      rst: -1,
    },
    description: 'The standard ubiquitous 4-pin I2C OLED display (VCC, GND, SCL, SDA). Very low power, high contrast in low light.',
    recommendedUse: 'Minimalist field rover or base station for displaying SIV, RTK Fix, and battery voltage.',
  },
  {
    type: 'sh1106_13_i2c',
    name: '1.3" OLED I2C 128x64 (SH1106)',
    driver: 'U8g2',
    interface: 'I2C',
    resolution: '128x64 Monochrome (Larger Pixels)',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$3.00 - $4.50',
    defaultPins: {
      sda: 21,
      scl: 22,
      rst: -1,
    },
    description: 'Slightly larger 1.3-inch diagonal format using the SH1106 controller with 132x64 memory window. Much easier to read outdoors than 0.96".',
    recommendedUse: 'Handheld surveyor wand with clearer coordinate text.',
  },
  {
    type: 'ssd1315_keypad_i2c',
    name: 'SSD1315 0.96" OLED + 4x4 Keypad Board',
    driver: 'U8g2',
    interface: 'I2C',
    resolution: '128x64 OLED + 16 Pushbuttons',
    hasEncoder: false,
    hasKeypad: true,
    costRangeUSD: '$5.50 - $8.00',
    defaultPins: {
      sda: 21,
      scl: 22,
      rst: -1,
    },
    description: 'Compact daughterboard combining a 0.96" SSD1315 low-voltage OLED with a 4x4 tactile matrix keypad (16 keys). Allows manual numeric coordinate entry and field menu navigation without a phone.',
    recommendedUse: 'Base station for typing fixed antenna coordinates (ECEF/LLH) or entering Wi-Fi / NTRIP passwords.',
  },
  {
    type: 'oled_ec11_combo',
    name: '0.96" / 1.3" OLED + EC11 Rotary Encoder Module',
    driver: 'U8g2',
    interface: 'I2C',
    resolution: '128x64 OLED + Rotary Encoder',
    hasEncoder: true,
    hasKeypad: false,
    costRangeUSD: '$4.50 - $7.00',
    defaultPins: {
      sda: 21,
      scl: 22,
      ec11A: 32,
      ec11B: 33,
      ec11Btn: 25,
    },
    description: 'Integrated daughterboard with an I2C OLED display paired directly with an EC11 360-degree digital rotary encoder knob and push-switch. Ideal for scroll-and-click menu navigation.',
    recommendedUse: 'Scroll through profiles, adjust pole height (0.50m to 2.50m) in 1cm steps, toggle base/rover, calibrate IMU.',
  },
  {
    type: 'st7735s_18_spi',
    name: '1.8" Color TFT LCD SPI (ST7735S 128x160)',
    driver: 'TFT_eSPI',
    interface: 'SPI',
    resolution: '128x160 18-bit Color',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$3.50 - $5.50',
    defaultPins: {
      cs: 15,
      dc: 2,
      rst: 4,
      blk: 27,
    },
    description: 'Full color 1.8-inch SPI TFT display with ST7735S controller. Capable of displaying color status icons, constellation sky plots, and signal-to-noise ratio (C/N0) bar graphs.',
    recommendedUse: 'Budget color display rover showing satellite constellation sky view and RTK status.',
  },
  {
    type: 'st7789_24_spi',
    name: '2.4" IPS Color TFT LCD SPI (ST7789 240x320)',
    driver: 'TFT_eSPI',
    interface: 'SPI',
    resolution: '240x320 High-Res IPS Color',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$6.00 - $9.00',
    defaultPins: {
      cs: 15,
      dc: 2,
      rst: 4,
      blk: 27,
    },
    description: 'Crisp, high-density IPS color screen with wide viewing angles. Fits well on modular enclosure faceplates.',
    recommendedUse: 'Detailed surveying GUI, map views, and live tilt spirit bubble level.',
  },
  {
    type: 'tft_ec11_combo',
    name: '1.8" / 2.4" TFT LCD + EC11 Rotary Encoder Module',
    driver: 'TFT_eSPI',
    interface: 'SPI',
    resolution: 'Color TFT + Rotary Encoder Knob',
    hasEncoder: true,
    hasKeypad: false,
    costRangeUSD: '$8.00 - $13.00',
    defaultPins: {
      cs: 15,
      dc: 2,
      rst: 4,
      blk: 27,
      ec11A: 32,
      ec11B: 33,
      ec11Btn: 25,
    },
    description: 'Complete front-panel module combining a high-resolution color TFT screen and an EC11 digital encoder knob. Gives a professional instrument feel like high-end total stations.',
    recommendedUse: 'Professional standalone survey pole controller with dial-based coordinate and menu navigation.',
  },
  {
    type: 'eink_ssd1680',
    name: '1.54" / 2.9" E-Ink Paper Display (SSD1680 Driver)',
    driver: 'GxEPD2',
    interface: 'SPI',
    resolution: '200x200 or 296x128 E-Paper',
    hasEncoder: false,
    hasKeypad: false,
    costRangeUSD: '$9.00 - $15.00',
    defaultPins: {
      cs: 5,
      dc: 17,
      rst: 16,
      busy: 4,
    },
    description: 'Ultra-low-power electronic paper display powered by the SSD1680 controller. Reflective display readable in direct blinding sunlight with zero backlight glare. Keeps image even with power disconnected.',
    recommendedUse: 'Outdoor bright-sunlight rovers and remote solar-powered RTK base stations.',
  },
];

export interface LoraOption {
  chip: 'sx1262' | 'sx1276_sx1278' | 'ebyte_e22_uart' | 'ebyte_e32_uart' | 'reyax_rylr998_uart';
  name: string;
  interface: 'SPI' | 'UART';
  frequency: string;
  maxPower: string;
  rangeKm: string;
  costRangeUSD: string;
  description: string;
  defaultPins: {
    cs?: number;
    rst?: number;
    dio1?: number;
    busy?: number;
    tx?: number;
    rx?: number;
    aux?: number;
    m0?: number;
    m1?: number;
  };
}

export const LORA_MODULES: LoraOption[] = [
  {
    chip: 'sx1262',
    name: 'Semtech SX1262 SPI Transceiver (Waveshare / EBYTE E22-SPI)',
    interface: 'SPI',
    frequency: '868 / 915 MHz',
    maxPower: '+22 dBm (160mW)',
    rangeKm: 'Up to 12 - 15 km Line-of-Sight',
    costRangeUSD: '$5.50 - $9.00',
    description: 'Modern Semtech LoRa radio with superior link budget, lower RX current, and TCXO frequency stability.',
    defaultPins: {
      cs: 5,
      rst: 14,
      dio1: 26,
      busy: 27,
    },
  },
  {
    chip: 'sx1276_sx1278',
    name: 'Semtech SX1276 / SX1278 (HopeRF RFM95W / Ra-02)',
    interface: 'SPI',
    frequency: '433 / 868 / 915 MHz',
    maxPower: '+20 dBm (100mW)',
    rangeKm: 'Up to 8 - 10 km Line-of-Sight',
    costRangeUSD: '$3.50 - $6.00',
    description: 'The classic battle-tested LoRa SPI transceiver module. Widely available on red/blue breakout boards.',
    defaultPins: {
      cs: 18,
      rst: 23,
      dio1: 26,
    },
  },
  {
    chip: 'ebyte_e22_uart',
    name: 'EBYTE E22 UART Wireless Data Transceiver',
    interface: 'UART',
    frequency: '433 / 868 / 915 MHz',
    maxPower: '+22 dBm to +30 dBm (1 Watt)',
    rangeKm: 'Up to 10 - 20 km',
    costRangeUSD: '$8.00 - $14.00',
    description: 'Transparent serial UART LoRa module. Handles packets, air-rate, and encryption on its onboard MCU. Zero SPI overhead on the ESP32.',
    defaultPins: {
      tx: 17,
      rx: 16,
      aux: 4,
      m0: 2,
      m1: 15,
    },
  },
  {
    chip: 'ebyte_e32_uart',
    name: 'EBYTE E32 UART 100mW / 1W Module',
    interface: 'UART',
    frequency: '433 / 868 / 915 MHz',
    maxPower: '+20 dBm to +30 dBm (1 Watt)',
    rangeKm: 'Up to 8 - 15 km',
    costRangeUSD: '$6.50 - $12.00',
    description: 'Popular high-power transparent UART LoRa radio for long-range point-to-point RTCM correction broadcasting.',
    defaultPins: {
      tx: 17,
      rx: 16,
      aux: 4,
      m0: 2,
      m1: 15,
    },
  },
  {
    chip: 'reyax_rylr998_uart',
    name: 'REYAX RYLR998 / RYLR896 UART LoRa Module',
    interface: 'UART',
    frequency: '868 / 915 MHz',
    maxPower: '+20 dBm (100mW)',
    rangeKm: 'Up to 10 - 15 km Line-of-Sight',
    costRangeUSD: '$12.00 - $18.00',
    description: 'AT-command-driven Semtech SX1262 transceiver. Ultra-simple UART integration with AT+SEND and AT+ADDRESS. High sensitivity (-148 dBm), no SPI drivers required.',
    defaultPins: {
      tx: 17,
      rx: 16,
      rst: 4,
    },
  },
];

// -------------------------------------------------------------
// SWITCHES & BUTTONS METADATA & PREDEFINED FUNCTIONS
// -------------------------------------------------------------

export interface SwitchFunctionDef {
  id: SwitchFunction;
  name: string;
  category: 'System' | 'Navigation' | 'GNSS & Comms' | 'Surveying';
  defaultAction: 'momentary' | 'latching';
  description: string;
  sparkfunRef: string;
}

export const SWITCH_FUNCTIONS: SwitchFunctionDef[] = [
  {
    id: 'power_sleep',
    name: 'Power / Deep-Sleep Toggle',
    category: 'System',
    defaultAction: 'momentary',
    description: 'Press & hold 500ms to power on; press & hold 2s to safe shutdown & unmount SD card. Wakes ESP32 from deep sleep.',
    sparkfunRef: 'RTK_Surveyor Buttons.ino: powerOnCheck() / powerDown()',
  },
  {
    id: 'gnss_mode_switch',
    name: 'Switch GNSS Mode (Rover ↔ Base)',
    category: 'GNSS & Comms',
    defaultAction: 'momentary',
    description: 'Toggles between RTK Rover (receiving corrections) and RTK Base Station (survey-in & broadcasting RTCM3).',
    sparkfunRef: 'RTK_Surveyor Buttons.ino: pin_modeButton handler',
  },
  {
    id: 'comms_mode_switch',
    name: 'Cycle Comms Mode (WiFi → LoRa → ESP-NOW → BT)',
    category: 'GNSS & Comms',
    defaultAction: 'momentary',
    description: 'Cycles active wireless correction protocol in real-time in the field without needing a phone app.',
    sparkfunRef: 'RTK Everywhere States.ino: cycleCorrectionSource()',
  },
  {
    id: 'bt_pairing',
    name: 'Enter Bluetooth Pairing Mode',
    category: 'GNSS & Comms',
    defaultAction: 'momentary',
    description: 'Forces Bluetooth Classic / BLE into discoverable pairing mode with fast-blinking LED indicator.',
    sparkfunRef: 'RTK_Surveyor Bluetooth.ino: startPairing()',
  },
  {
    id: 'firmware_update_mode',
    name: 'Enter Firmware Update Mode (ESP32 / GNSS)',
    category: 'System',
    defaultAction: 'momentary',
    description: 'Boots ESP32 into Web OTA hotspot or bridges USB-UART directly into GNSS module for vendor firmware updates.',
    sparkfunRef: 'RTK Everywhere Device_Firmware_Update.ino',
  },
  {
    id: 'menu_next',
    name: 'Menu Navigation: Next / Down',
    category: 'Navigation',
    defaultAction: 'momentary',
    description: 'Advances cursor to the next menu item on 1602 LCD, OLED, or TFT displays.',
    sparkfunRef: 'RTK_Surveyor menuMain.ino',
  },
  {
    id: 'menu_prev',
    name: 'Menu Navigation: Previous / Up',
    category: 'Navigation',
    defaultAction: 'momentary',
    description: 'Moves cursor to the previous menu item on the attached display.',
    sparkfunRef: 'RTK_Surveyor menuMain.ino',
  },
  {
    id: 'menu_select',
    name: 'Menu Navigation: Select / Enter',
    category: 'Navigation',
    defaultAction: 'momentary',
    description: 'Enters sub-menu or toggles highlighted setting option.',
    sparkfunRef: 'RTK_Surveyor menuCommands.ino',
  },
  {
    id: 'menu_back',
    name: 'Menu Navigation: Back / Exit',
    category: 'Navigation',
    defaultAction: 'momentary',
    description: 'Exits current sub-menu or returns to live survey status screen.',
    sparkfunRef: 'RTK_Surveyor menuMain.ino',
  },
  {
    id: 'mark_waypoint',
    name: 'Log / Mark Waypoint (Survey Stakeout)',
    category: 'Surveying',
    defaultAction: 'momentary',
    description: 'Instantly records current high-precision RTK coordinate timestamp to MicroSD CSV point list with beep.',
    sparkfunRef: 'RTK_Surveyor Logging.ino: logCurrentPosition()',
  },
  {
    id: 'zero_tilt_imu',
    name: 'Zero IMU / Calibrate Tilt Sensor',
    category: 'Surveying',
    defaultAction: 'momentary',
    description: 'Zeroes IMU tilt offset or initiates 3-point pole rocking calibration for survey pole tilt compensation.',
    sparkfunRef: 'RTK Everywhere Tilt.ino: zeroTiltOffset()',
  },
  {
    id: 'toggle_wifi_ap',
    name: 'Toggle Wi-Fi AP Hotspot (Web GUI)',
    category: 'GNSS & Comms',
    defaultAction: 'momentary',
    description: 'Turns ESP32 Access Point Wi-Fi on or off to conserve battery when field survey app is connected over Bluetooth.',
    sparkfunRef: 'RTK Everywhere AP-Config',
  },
  {
    id: 'display_backlight',
    name: 'Display Backlight On/Off (Power Save)',
    category: 'System',
    defaultAction: 'momentary',
    description: 'Toggles LCD 1602 / TFT backlight on/off to extend field battery runtime in overnight base station mode.',
    sparkfunRef: 'RTK Everywhere Display.ino',
  },
  {
    id: 'base_restart_survey',
    name: 'Base Station: Restart Survey-In',
    category: 'Surveying',
    defaultAction: 'momentary',
    description: 'Aborts current base convergence and restarts high-accuracy GNSS survey-in accumulation.',
    sparkfunRef: 'RTK_Surveyor Base.ino: startSurveyIn()',
  },
];

export interface SwitchStyleDef {
  id: SwitchStyle;
  label: string;
  description: string;
  commonActuation: string;
}

export const SWITCH_STYLES: SwitchStyleDef[] = [
  {
    id: 'push_button',
    label: 'Push Button (Panel Mount)',
    description: 'Round or square 12mm/16mm metal or plastic button mounted on instrument housing.',
    commonActuation: 'Momentary or Latching',
  },
  {
    id: 'tactile',
    label: 'Tactile Micro-Switch',
    description: 'Standard 6x6mm or 12x12mm PCB tactile button with sharp physical click feedback.',
    commonActuation: 'Momentary',
  },
  {
    id: 'toggle',
    label: 'Toggle Switch (Bat Handle)',
    description: 'Rugged miniature bat-handle toggle switch for positive physical state indication.',
    commonActuation: 'Latching / Maintained (or 2-way momentary)',
  },
  {
    id: 'rocker',
    label: 'Rocker Switch',
    description: 'Sealed IP67 rocker switch commonly used for master power or Rover/Base selector.',
    commonActuation: 'Latching / Maintained',
  },
  {
    id: 'slide',
    label: 'Slide Switch',
    description: 'Miniature sliding switch for low-profile enclosures.',
    commonActuation: 'Latching / Maintained',
  },
  {
    id: 'rotary',
    label: 'Rotary Selector Switch',
    description: 'Multi-position rotary selector switch or stepped switch.',
    commonActuation: 'Maintained positions',
  },
  {
    id: 'reed',
    label: 'Magnetic Reed Switch',
    description: 'Hermetically sealed glass reed switch actuated by external magnet without case penetrations.',
    commonActuation: 'Momentary (NO contact)',
  },
  {
    id: 'key',
    label: 'Key Lock Switch',
    description: 'Security key-operated switch to prevent unauthorized tampering on unattended base stations.',
    commonActuation: 'Latching / Maintained',
  },
];

// -------------------------------------------------------------
// STATUS LEDS & ADDRESSABLE METADATA
// -------------------------------------------------------------

export interface LedFunctionDef {
  id: LedFunction;
  name: string;
  defaultColor: LedColor;
  description: string;
  patterns: {
    idle: string;
    active: string;
    alert: string;
  };
  sparkfunRef: string;
}

export const LED_FUNCTIONS: LedFunctionDef[] = [
  {
    id: 'power_battery',
    name: 'Power & Battery / Charging Status',
    defaultColor: 'yellow',
    description: 'Indicates device power, charging state (blinking while charging), and low battery warning.',
    patterns: {
      idle: 'Solid ON: Battery > 20%',
      active: 'Slow Blink (1 Hz): Charging in progress',
      alert: 'Fast Blink (4 Hz): Low Battery (< 15%)',
    },
    sparkfunRef: 'RTK_Surveyor LED.ino: pin_batteryStatusLED',
  },
  {
    id: 'bt_status',
    name: 'Bluetooth Connection Status',
    defaultColor: 'blue',
    description: 'Communicates phone/tablet Bluetooth Classic SPP or BLE paired link status.',
    patterns: {
      idle: 'Slow Blink (1 Hz): Waiting for connection / Discoverable',
      active: 'Solid ON: Client Connected & Streaming NMEA',
      alert: 'Fast Blink (5 Hz): Pairing Mode active',
    },
    sparkfunRef: 'RTK_Surveyor LED.ino: pin_bluetoothStatusLED',
  },
  {
    id: 'rtk_fix_status',
    name: 'RTK Fix Precision Status',
    defaultColor: 'green',
    description: 'Highest-priority status indicator. Communicates whether GNSS has standalone, float, or millimeter RTK fix.',
    patterns: {
      idle: 'Single Blink: 3D Fix (No differential corrections)',
      active: 'Solid ON: Millimeter RTK FIXED (Sub-centimeter accuracy)',
      alert: 'Slow Blink (1 Hz): RTK FLOAT (Searching carrier phase ambiguities)',
    },
    sparkfunRef: 'RTK_Surveyor LED.ino: pin_gnssStatusLED',
  },
  {
    id: 'ntrip_corr_status',
    name: 'NTRIP / Correction Data Status',
    defaultColor: 'amber',
    description: 'Flickers on incoming RTCM3 packets received over Wi-Fi NTRIP, LoRa, or ESP-NOW.',
    patterns: {
      idle: 'OFF: No correction stream received',
      active: 'Rapid Flicker: RTCM3 data packets arriving successfully',
      alert: 'Double Blink: NTRIP caster connection lost / timeout',
    },
    sparkfunRef: 'RTK Everywhere States.ino',
  },
  {
    id: 'gnss_mode',
    name: 'GNSS Mode (Rover vs Base Indicator)',
    defaultColor: 'red',
    description: 'Shows current operating role. Helps prevent surveying with a base station in rover mode.',
    patterns: {
      idle: 'OFF: Rover Mode',
      active: 'Solid ON: Base Station Mode (Broadcasting corrections)',
      alert: 'Slow Blink (1 Hz): Base Survey-In accumulating (not converged)',
    },
    sparkfunRef: 'RTK_Surveyor LED.ino: pin_baseStatusLED',
  },
  {
    id: 'base_caster_status',
    name: 'Base Correction Server / Radio TX',
    defaultColor: 'red',
    description: 'Flashes whenever base station transmits an RTCM packet via LoRa, ESP-NOW, or NTRIP Caster.',
    patterns: {
      idle: 'OFF: Base idle',
      active: 'Short Flash (100ms) every 1s: RTCM message 1005/1077/1087 broadcast',
      alert: 'Fast Blink: Wi-Fi or LoRa hardware fault',
    },
    sparkfunRef: 'RTK Everywhere Base.ino',
  },
  {
    id: 'sd_logging',
    name: 'MicroSD Raw Logging Active',
    defaultColor: 'white',
    description: 'Flashes whenever raw UBX / RINEX data blocks are committed to the MicroSD card.',
    patterns: {
      idle: 'OFF: Logging disabled / card idle',
      active: 'Periodic Flash: Writing bytes to SD card',
      alert: 'Fast Blink: SD card missing or write error',
    },
    sparkfunRef: 'RTK Everywhere Logging.ino',
  },
  {
    id: 'wifi_status',
    name: 'Wi-Fi AP / Station Link Status',
    defaultColor: 'blue',
    description: 'Communicates Wi-Fi station connectivity or Access Point hotspot status.',
    patterns: {
      idle: 'OFF: Wi-Fi radio powered down',
      active: 'Solid ON: Wi-Fi connected to local AP / Hotspot client connected',
      alert: 'Slow Blink (1 Hz): Searching / Connecting to Wi-Fi SSID',
    },
    sparkfunRef: 'RTK Everywhere WiFi.ino',
  },
];

// -------------------------------------------------------------
// RESISTOR & ELECTRICAL WIRING GUIDELINES
// -------------------------------------------------------------

export interface ResistorGuide {
  ledType: string;
  forwardVoltage: string;
  forwardCurrent: string;
  resistorAt3V3: string;
  resistorAt5V: string;
  recommendation: string;
  powerRating: string;
  specialNotes: string;
}

export const RESISTOR_GUIDELINES: Record<string, ResistorGuide> = {
  red: {
    ledType: 'Red / Amber / Yellow Discrete LED',
    forwardVoltage: '1.8V - 2.1V',
    forwardCurrent: '10mA - 15mA',
    resistorAt3V3: '150Ω - 330Ω (Recommended: 220Ω, 1/4W)',
    resistorAt5V: '270Ω - 470Ω (Recommended: 330Ω, 1/4W)',
    recommendation: '220Ω in series with Anode or Cathode',
    powerRating: '0.25 Watt (1/4W) standard carbon or metal film',
    specialNotes: 'Never connect directly to 3.3V GPIO without a resistor! An unresisted red LED will draw >50mA and burn out the ESP32 GPIO pin.',
  },
  green: {
    ledType: 'Green Discrete LED',
    forwardVoltage: '2.8V - 3.2V',
    forwardCurrent: '10mA - 15mA',
    resistorAt3V3: '100Ω - 220Ω (Recommended: 150Ω, 1/4W)',
    resistorAt5V: '220Ω - 390Ω (Recommended: 270Ω, 1/4W)',
    recommendation: '150Ω in series',
    powerRating: '1/4 Watt',
    specialNotes: 'Pure green LEDs have higher Vf (~3.0V) than older yellow-green LEDs (~2.1V). 150Ω provides brilliant visibility outdoors.',
  },
  blue: {
    ledType: 'Blue / White Discrete LED',
    forwardVoltage: '3.0V - 3.3V',
    forwardCurrent: '10mA - 15mA',
    resistorAt3V3: '68Ω - 150Ω (Recommended: 100Ω, 1/4W)',
    resistorAt5V: '180Ω - 330Ω (Recommended: 220Ω, 1/4W)',
    recommendation: '100Ω in series',
    powerRating: '1/4 Watt',
    specialNotes: 'High-efficiency blue/white LEDs are extremely bright. 100Ω to 220Ω keeps brightness comfortable while staying under 12mA.',
  },
  rgb_discrete: {
    ledType: 'RGB 4-Pin LED (Common Cathode or Anode)',
    forwardVoltage: 'R: 2.0V, G: 3.1V, B: 3.1V',
    forwardCurrent: '10mA per channel',
    resistorAt3V3: 'Red: 220Ω, Green: 150Ω, Blue: 100Ω',
    resistorAt5V: 'Red: 330Ω, Green: 220Ω, Blue: 220Ω',
    recommendation: 'Individual resistor on EACH color channel (3 resistors total)!',
    powerRating: '1/4 Watt each',
    specialNotes: 'CRITICAL: Never use a single shared resistor on the common pin! Red has a lower forward voltage and will steal all current, causing color imbalance and flickering.',
  },
  ws2812b: {
    ledType: 'WS2812B / NeoPixel / SK6812 Addressable Strip',
    forwardVoltage: '5.0V Logic & Power bus',
    forwardCurrent: 'Up to 50mA per pixel (Full white)',
    resistorAt3V3: 'Data Line: 330Ω - 470Ω in series at DIN pin',
    resistorAt5V: 'Power: 1000 µF capacitor across +5V and GND',
    recommendation: '330Ω series data resistor + 1000µF 6.3V electrolytic cap across power rails',
    powerRating: 'Resistor: 1/4W. Capacitor: 1000µF, 6.3V to 16V rated',
    specialNotes: 'The 330Ω - 470Ω resistor dampens impedance reflections and protects the first pixel’s input stage. Keep data wire under 20cm or use 74AHCT125 level shifter for 3.3V to 5V.',
  },
  single_color_strip: {
    ledType: '12V / 5V High-Power LED Strip',
    forwardVoltage: '12V DC (External power supply)',
    forwardCurrent: '0.5A - 2A',
    resistorAt3V3: 'Gate: 100Ω series + 10kΩ pull-down to GND',
    resistorAt5V: 'Gate: 100Ω series + 10kΩ pull-down to GND',
    recommendation: 'N-Channel Logic-Level MOSFET (IRLZ44N or AO3400) + 10kΩ pull-down resistor on gate',
    powerRating: '10kΩ 1/8W; 100Ω 1/4W',
    specialNotes: 'Never wire 12V LED strips directly to MCU pins! Use a logic-level MOSFET switched via PWM.',
  },
  onboard_led: {
    ledType: 'Onboard Development Board LED (e.g. CYD RGB, ESP32 GPIO 2)',
    forwardVoltage: 'Integrated on PCB',
    forwardCurrent: 'Integrated',
    resistorAt3V3: 'NO EXTERNAL RESISTOR NEEDED (Pre-soldered SMD resistor)',
    resistorAt5V: 'N/A',
    recommendation: 'Zero external components required',
    powerRating: 'SMD onboard',
    specialNotes: 'The built-in LEDs on ESP32 NodeMCU, CYD (GPIO 4, 16, 17), M5Stack, etc. already have SMD resistors built into the printed circuit board.',
  },
};


