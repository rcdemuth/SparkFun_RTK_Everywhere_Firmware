import { AddonScreenType } from '../types/config';

export interface ScreenOption {
  type: AddonScreenType;
  name: string;
  driver: 'U8g2' | 'Adafruit_SSD1306' | 'TFT_eSPI' | 'GxEPD2';
  interface: 'I2C' | 'SPI';
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

