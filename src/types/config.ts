export type ChipFamily =
  | 'esp32'
  | 'esp32-s3'
  | 'esp32-c3'
  | 'esp32-c6'
  | 'rp2040'
  | 'rp2350'
  | 'nrf52840';

export interface BoardDefinition {
  id: string;
  name: string;
  family: ChipFamily;
  flashSizeMB: number;
  psramMB: number;
  hasBluetoothClassic: boolean;
  hasBLE: boolean;
  hasWiFi: boolean;
  hasLoRa: boolean;
  loraChip?: string;
  hasDisplay: boolean;
  displayType?: 'tft_spi_touch' | 'st7789_spi' | 'ssd1306_i2c' | 'eink_spi' | 'none';
  displayResolution?: string;
  hasTouch?: boolean;
  hasMicroSD: boolean;
  hasBatteryMgmt: boolean;
  batteryAdcPin?: number;
  defaultPins: {
    gnssTx: number; // Board TX -> GNSS RX
    gnssRx: number; // Board RX -> GNSS TX
    gnssReset?: number;
    gnssPps?: number;
    i2cSda?: number;
    i2cScl?: number;
    spiMosi?: number;
    spiMiso?: number;
    spiSclk?: number;
    displayCs?: number;
    displayDc?: number;
    displayRst?: number;
    touchCs?: number;
    touchIrq?: number;
    sdCs?: number;
    loraCs?: number;
    loraDio1?: number;
    loraRst?: number;
    ledStatus?: number;
    btnUser?: number;
  };
  notes: string;
  recommendedRole: 'rover' | 'base' | 'both';
  costRangeUSD?: string;
  pros?: string[];
  cons?: string[];
}

export type GnssChipId =
  | 'um980'
  | 'um981'
  | 'zed_f9p'
  | 'lg290p'
  | 'lc29h'
  | 'cm260r'
  | 'bynav_m21_m22'
  | 'commnav_k827_k922'
  | 'comnav_k802'
  | 'skytraq_px1122r'
  | 'skytraq_px1172r'
  | 'quectel_lg69t'
  | 'allystar_tau1308'
  | 'st_teseo_liv4f'
  | 'navspark_nshp';

export interface GnssChipDefinition {
  id: GnssChipId;
  name: string;
  manufacturer: string;
  bands: string;
  hasOnboardIMU: boolean;
  tiltType: 'native_onboard_imu' | 'external_imu_required' | 'not_supported';
  baudRate: number;
  protocol:
    | 'nmea_unicore'
    | 'ubx'
    | 'nmea_quectel'
    | 'nmea_bynav'
    | 'nmea_commnav'
    | 'nmea_skytraq'
    | 'nmea_casic'
    | 'nmea_teseo'
    | 'nmea_standard';
  supportedOutputs: string[];
  tiltCompensationCommands: {
    enable: string[];
    setPoleHeight: (heightMeters: number) => string;
    setLeverArm?: (x: number, y: number, z: number) => string;
    calibrate?: string[];
  };
  tiltSentenceOutput: string;
  notes: string;
  costRangeUSD?: string;
  pros?: string[];
  cons?: string[];
}

// -------------------------------------------------------------
// ADD-ON DAUGHTER BOARDS & ACCESSORIES
// -------------------------------------------------------------

export type AddonScreenType =
  | 'none'
  | 'ssd1306_096_i2c'
  | 'sh1106_13_i2c'
  | 'ssd1315_keypad_i2c'
  | 'oled_ec11_combo'
  | 'st7735s_18_spi'
  | 'st7789_24_spi'
  | 'tft_ec11_combo'
  | 'eink_ssd1680';

export interface AddonScreenConfig {
  enabled: boolean;
  type: AddonScreenType;
  i2cAddress: string;
  pins: {
    sda: number;
    scl: number;
    cs: number;
    dc: number;
    rst: number;
    busy: number;
    blk: number;
    ec11A: number;
    ec11B: number;
    ec11Btn: number;
  };
}

export interface MicroSdConfig {
  enabled: boolean;
  mode: 'spi' | 'sdmmc_1bit' | 'sdmmc_4bit';
  pins: {
    cs: number;
    mosi: number;
    miso: number;
    sck: number;
    cd: number; // Card detect pin (-1 if unassigned)
  };
  logRawUbx: boolean;
  logNmea: boolean;
  logRinex: boolean;
}

export interface ExternalLoraConfig {
  enabled: boolean;
  chip: 'sx1262' | 'sx1276_sx1278' | 'ebyte_e22_uart' | 'ebyte_e32_uart' | 'reyax_rylr998_uart';
  frequencyMhz: number;
  powerDbm: number;
  pins: {
    cs: number;
    rst: number;
    dio1: number;
    busy: number;
    tx: number; // For EBYTE UART modules
    rx: number;
    aux: number;
    m0: number;
    m1: number;
  };
}

export type RoverCorrectionSource =
  | 'ntrip_wifi'
  | 'lora_radio'
  | 'esp_now'
  | 'bt_bridge'
  | 'serial_radio';

export type BaseCorrectionBroadcast =
  | 'ntrip_caster'
  | 'esp_now'
  | 'lora_radio'
  | 'local_tcp';

export type DataCollectorOutput =
  | 'bluetooth_spp'
  | 'ble'
  | 'usb_serial'
  | 'tcp_server';

export type DefaultWifiMode = 'ap_config' | 'station_client' | 'off';

export interface DefaultCommsConfig {
  roverCorrectionSource: RoverCorrectionSource;
  baseCorrectionBroadcast: BaseCorrectionBroadcast;
  dataCollectorOutput: DataCollectorOutput;
  wifiMode: DefaultWifiMode;
  allowInFieldProtocolSwitching: boolean;
}

export interface SystemConfiguration {
  boardId: string;
  gnssId: GnssChipId;
  deviceRole: 'rover' | 'base'; // Default Power-On Mode
  allowDynamicRoleSwitch: boolean; // Enables in-field switching stored in NVS flash
  defaultComms: DefaultCommsConfig;
  btMode: 'ble_only' | 'classic_spp' | 'ble_and_spp' | 'wifi_only';
  pins: {
    gnssTx: number;
    gnssRx: number;
    gnssReset: number;
    gnssPps: number;
    i2cSda: number;
    i2cScl: number;
    sdCs: number;
    loraCs: number;
    statusLed: number;
  };
  tilt: {
    enabled: boolean;
    useOnboardImu: boolean;
    externalImuType: 'none' | 'im19' | 'icm20948' | 'bno085';
    poleHeightMeters: number;
    leverArmX: number;
    leverArmY: number;
    leverArmZ: number;
    autoRockCalibration: boolean;
    maxTiltAngleDeg: number;
  };
  baseConfig: {
    mode: 'survey_in' | 'fixed_ecef' | 'fixed_llh';
    surveyInDurationSec: number;
    surveyInAccuracyMeters: number;
    fixedLat: number;
    fixedLon: number;
    fixedAlt: number;
    ntripServerEnabled: boolean;
    ntripHost: string;
    ntripPort: number;
    ntripMountpoint: string;
    ntripPassword: string;
    loraBroadcastEnabled: boolean;
    loraFrequencyMhz: number;
    espNowBroadcastEnabled: boolean;
  };
  // Add-on Daughter Boards & Accessories
  addons: {
    screen: AddonScreenConfig;
    sd: MicroSdConfig;
    lora: ExternalLoraConfig;
  };
  features: {
    enableTouchUI: boolean;
    enableWebServer: boolean;
    enableSdLogging: boolean;
    enableNtripClient: boolean;
    enableLoRa: boolean;
    enableEspNow: boolean;
    espNowChannel: number;
    enableOta: boolean;
    enablePpl: boolean;
  };
}
