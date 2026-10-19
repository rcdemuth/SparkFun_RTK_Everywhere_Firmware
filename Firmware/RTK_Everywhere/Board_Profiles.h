/*=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  Board_Profiles.h
  Universal Hardware Abstraction Layer (HAL) for SparkFun RTK Everywhere

  Provides static pin maps and hardware feature declarations for 16 target development boards:
  - AI-S3 ESP32-S3 N16R8 DevKit C Dual Type-C
  - YD-ESP32-C3 2022-V1.3 (Mini-1 4MB)
  - ESP32-C6-DevKit C N4R2 / nancESP32-C6 v1.0
  - ESP32 Lite V1.0.0 (1A Lipo Charger)
  - ESP32-S3 Super Mini
  - ESP32-DevKitC-32 (ESP-WROOM-32)
  - Cheap Yellow Display (CYD) ESP32-2432S028 (2.8" TFT + Touch + SD)
  - Waveshare ESP32-C6-LCD-1.47 (172x320 ST7789 + SD)
  - Lolin S3 Pro V1.0.0 (16MB Flash, 8MB PSRAM, SD)
  - ESP32-C3 0.96" OLED (ESP32C3FN4 / FH4)
  - LILYGO LoRa32 V2.1 & T3 V1.6.1 (LoRa SX1276 + OLED + SD)
  - Heltec Wireless Paper (HT-VME213/290 E-Ink + SX1262 LoRa)
  - Heltec WiFi LoRa 32 V3 (HTIT-WB32LA SX1262 LoRa + OLED)
  - ES3C28P (CYD S3 2.8" Touch Display)
  - TENSTAR T-Display ESP32-D0WD (1.14" ST7789 IPS LCD)
  - Raspberry Pi Pico (RP2040 Dual ARM Cortex-M0+)
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

#ifndef __BOARD_PROFILES_H__
#define __BOARD_PROFILES_H__

#include <Arduino.h>

struct BoardHardwareConfig {
    const char * name;
    int pin_gnss_tx; // MCU TX to GNSS RX
    int pin_gnss_rx; // MCU RX to GNSS TX
    int pin_gnss_reset;
    int pin_gnss_pps;
    int pin_i2c_sda;
    int pin_i2c_scl;
    int pin_sd_cs;
    int pin_lora_cs;
    int pin_status_led;
    int pin_power_button;
    int pin_battery_adc;
    bool has_psram;
    bool has_ble_only;
    bool has_touch_display;
};

// Add-on Daughter Board Screens
enum AddonScreenType_e {
    ADDON_SCREEN_NONE = 0,
    ADDON_SCREEN_SSD1306_096_I2C,  // 0.96" OLED I2C
    ADDON_SCREEN_SH1106_13_I2C,    // 1.3" OLED I2C
    ADDON_SCREEN_SSD1315_KEYPAD,   // SSD1315 0.96" OLED + 4x4 Keypad
    ADDON_SCREEN_OLED_EC11,        // OLED + EC11 Rotary Encoder Dial
    ADDON_SCREEN_ST7735S_18_SPI,   // 1.8" Color TFT LCD SPI
    ADDON_SCREEN_ST7789_24_SPI,    // 2.4" Color TFT LCD SPI
    ADDON_SCREEN_TFT_EC11,         // TFT + EC11 Rotary Encoder Dial
    ADDON_SCREEN_EINK_SSD1680,     // 1.54"/2.9" Sunlight E-Ink SPI
};

// Add-on External LoRa Transceiver
enum AddonLoraChip_e {
    ADDON_LORA_NONE = 0,
    ADDON_LORA_SX1262_SPI,
    ADDON_LORA_SX1276_SX1278_SPI,
    ADDON_LORA_EBYTE_E22_UART,
    ADDON_LORA_EBYTE_E32_UART,
    ADDON_LORA_REYAX_RYLR998_UART,
};

// ----------------------------------------------------
// 1. Cheap Yellow Display (CYD) ESP32-2432S028
// ----------------------------------------------------
#if defined(BOARD_CYD_ESP32_2432S028)
#define BOARD_DETECTED_NAME "CYD ESP32-2432S028"
#define PIN_GNSS_TX_DEFAULT 27
#define PIN_GNSS_RX_DEFAULT 22
#define PIN_GNSS_RESET_DEFAULT 35
#define PIN_GNSS_PPS_DEFAULT 21
#define PIN_I2C_SDA_DEFAULT 27
#define PIN_I2C_SCL_DEFAULT 22
#define PIN_TFT_CS_DEFAULT 15
#define PIN_TFT_DC_DEFAULT 2
#define PIN_TOUCH_CS_DEFAULT 33
#define PIN_TOUCH_IRQ_DEFAULT 36
#define PIN_SD_CS_DEFAULT 5
#define PIN_STATUS_LED_DEFAULT 16
#define HAS_SPI_TOUCH_SCREEN 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 2. AI-S3 ESP32-S3 N16R8 Dual Type-C
// ----------------------------------------------------
#elif defined(BOARD_AI_S3_N16R8)
#define BOARD_DETECTED_NAME "AI-S3 N16R8 Dual Type-C"
#define PIN_GNSS_TX_DEFAULT 17
#define PIN_GNSS_RX_DEFAULT 18
#define PIN_GNSS_RESET_DEFAULT 21
#define PIN_GNSS_PPS_DEFAULT 16
#define PIN_I2C_SDA_DEFAULT 8
#define PIN_I2C_SCL_DEFAULT 9
#define PIN_STATUS_LED_DEFAULT 38
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 16

// ----------------------------------------------------
// 3. YD-ESP32-C3 Mini 4MB
// ----------------------------------------------------
#elif defined(BOARD_YD_ESP32_C3)
#define BOARD_DETECTED_NAME "YD-ESP32-C3 Mini"
#define PIN_GNSS_TX_DEFAULT 7
#define PIN_GNSS_RX_DEFAULT 6
#define PIN_GNSS_RESET_DEFAULT 10
#define PIN_GNSS_PPS_DEFAULT 3
#define PIN_I2C_SDA_DEFAULT 8
#define PIN_I2C_SCL_DEFAULT 9
#define PIN_STATUS_LED_DEFAULT 8
#define COMPILE_BLE_ONLY 1
#define NO_PSRAM_AVAILABLE 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 4. ESP32-C6-DevKit C N4R2
// ----------------------------------------------------
#elif defined(BOARD_ESP32_C6_DEVKIT)
#define BOARD_DETECTED_NAME "ESP32-C6 DevKit C"
#define PIN_GNSS_TX_DEFAULT 16
#define PIN_GNSS_RX_DEFAULT 17
#define PIN_GNSS_RESET_DEFAULT 15
#define PIN_GNSS_PPS_DEFAULT 21
#define PIN_I2C_SDA_DEFAULT 6
#define PIN_I2C_SCL_DEFAULT 7
#define PIN_STATUS_LED_DEFAULT 8
#define COMPILE_BLE_ONLY 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 5. ESP32 Lite V1.0.0
// ----------------------------------------------------
#elif defined(BOARD_ESP32_LITE)
#define BOARD_DETECTED_NAME "ESP32 Lite V1.0"
#define PIN_GNSS_TX_DEFAULT 17
#define PIN_GNSS_RX_DEFAULT 16
#define PIN_GNSS_RESET_DEFAULT 23
#define PIN_GNSS_PPS_DEFAULT 35
#define PIN_I2C_SDA_DEFAULT 21
#define PIN_I2C_SCL_DEFAULT 22
#define PIN_STATUS_LED_DEFAULT 22
#define PIN_BATTERY_ADC_DEFAULT 34
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 6. ESP32-S3 Super Mini
// ----------------------------------------------------
#elif defined(BOARD_ESP32_S3_SUPERMINI)
#define BOARD_DETECTED_NAME "ESP32-S3 Super Mini"
#define PIN_GNSS_TX_DEFAULT 43
#define PIN_GNSS_RX_DEFAULT 44
#define PIN_GNSS_RESET_DEFAULT 5
#define PIN_GNSS_PPS_DEFAULT 6
#define PIN_I2C_SDA_DEFAULT 8
#define PIN_I2C_SCL_DEFAULT 9
#define PIN_STATUS_LED_DEFAULT 8
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 7. LILYGO LoRa32 V2.1 / T3 V1.6.1
// ----------------------------------------------------
#elif defined(BOARD_LILYGO_LORA32_V21)
#define BOARD_DETECTED_NAME "LILYGO LoRa32 V2.1"
#define PIN_GNSS_TX_DEFAULT 12
#define PIN_GNSS_RX_DEFAULT 15
#define PIN_GNSS_RESET_DEFAULT 25
#define PIN_GNSS_PPS_DEFAULT 34
#define PIN_I2C_SDA_DEFAULT 21
#define PIN_I2C_SCL_DEFAULT 22
#define PIN_SD_CS_DEFAULT 13
#define PIN_LORA_CS_DEFAULT 18
#define PIN_STATUS_LED_DEFAULT 25
#define BOARD_HAS_LORA 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 8. Waveshare ESP32-C6-LCD-1.47
// ----------------------------------------------------
#elif defined(BOARD_WAVESHARE_C6_LCD_147)
#define BOARD_DETECTED_NAME "Waveshare C6-LCD-1.47"
#define PIN_GNSS_TX_DEFAULT 16
#define PIN_GNSS_RX_DEFAULT 17
#define PIN_GNSS_RESET_DEFAULT 15
#define PIN_GNSS_PPS_DEFAULT 21
#define PIN_I2C_SDA_DEFAULT 6
#define PIN_I2C_SCL_DEFAULT 7
#define PIN_TFT_CS_DEFAULT 14
#define PIN_TFT_DC_DEFAULT 15
#define PIN_SD_CS_DEFAULT 10
#define PIN_STATUS_LED_DEFAULT 8
#define COMPILE_BLE_ONLY 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 9. Lolin S3 Pro V1.0.0
// ----------------------------------------------------
#elif defined(BOARD_LOLIN_S3_PRO)
#define BOARD_DETECTED_NAME "Lolin S3 Pro"
#define PIN_GNSS_TX_DEFAULT 17
#define PIN_GNSS_RX_DEFAULT 18
#define PIN_GNSS_RESET_DEFAULT 21
#define PIN_GNSS_PPS_DEFAULT 16
#define PIN_I2C_SDA_DEFAULT 11
#define PIN_I2C_SCL_DEFAULT 12
#define PIN_SD_CS_DEFAULT 10
#define PIN_STATUS_LED_DEFAULT 38
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 16

// ----------------------------------------------------
// 10. ES3C28P (CYD S3 2.8" Touch Display)
// ----------------------------------------------------
#elif defined(BOARD_ES3C28P_CYD_S3)
#define BOARD_DETECTED_NAME "ES3C28P CYD S3"
#define PIN_GNSS_TX_DEFAULT 43
#define PIN_GNSS_RX_DEFAULT 44
#define PIN_GNSS_RESET_DEFAULT 17
#define PIN_GNSS_PPS_DEFAULT 18
#define PIN_I2C_SDA_DEFAULT 1
#define PIN_I2C_SCL_DEFAULT 2
#define PIN_TFT_CS_DEFAULT 15
#define PIN_TFT_DC_DEFAULT 2
#define PIN_TOUCH_CS_DEFAULT 33
#define PIN_TOUCH_IRQ_DEFAULT 36
#define PIN_SD_CS_DEFAULT 10
#define PIN_STATUS_LED_DEFAULT 38
#define HAS_SPI_TOUCH_SCREEN 1
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 16

// ----------------------------------------------------
// 11. LILYGO T-Beam Supreme (ESP32-S3 + SX1262 + 18650)
// ----------------------------------------------------
#elif defined(BOARD_LILYGO_T_BEAM_SUPREME)
#define BOARD_DETECTED_NAME "LILYGO T-Beam Supreme"
#define PIN_GNSS_TX_DEFAULT 8
#define PIN_GNSS_RX_DEFAULT 9
#define PIN_GNSS_RESET_DEFAULT 7
#define PIN_GNSS_PPS_DEFAULT 6
#define PIN_I2C_SDA_DEFAULT 17
#define PIN_I2C_SCL_DEFAULT 18
#define PIN_SD_CS_DEFAULT 12
#define PIN_LORA_CS_DEFAULT 10
#define PIN_STATUS_LED_DEFAULT 37
#define BOARD_HAS_LORA 1
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 8

// ----------------------------------------------------
// 12. Seeed Studio XIAO ESP32-S3
// ----------------------------------------------------
#elif defined(BOARD_SEEED_XIAO_ESP32_S3)
#define BOARD_DETECTED_NAME "Seeed XIAO ESP32-S3"
#define PIN_GNSS_TX_DEFAULT 43
#define PIN_GNSS_RX_DEFAULT 44
#define PIN_GNSS_RESET_DEFAULT 1
#define PIN_GNSS_PPS_DEFAULT 2
#define PIN_I2C_SDA_DEFAULT 5
#define PIN_I2C_SCL_DEFAULT 6
#define PIN_STATUS_LED_DEFAULT 21
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 8

// ----------------------------------------------------
// 13. Seeed Studio XIAO ESP32-C6
// ----------------------------------------------------
#elif defined(BOARD_SEEED_XIAO_ESP32_C6)
#define BOARD_DETECTED_NAME "Seeed XIAO ESP32-C6"
#define PIN_GNSS_TX_DEFAULT 16
#define PIN_GNSS_RX_DEFAULT 17
#define PIN_GNSS_RESET_DEFAULT 2
#define PIN_GNSS_PPS_DEFAULT 21
#define PIN_I2C_SDA_DEFAULT 22
#define PIN_I2C_SCL_DEFAULT 23
#define PIN_STATUS_LED_DEFAULT 15
#define COMPILE_BLE_ONLY 1
#define BOARD_FLASH_SIZE 4

// ----------------------------------------------------
// 14. M5Stack CoreS3 / Core2 (Rugged Touch Enclosure)
// ----------------------------------------------------
#elif defined(BOARD_M5STACK_CORES3)
#define BOARD_DETECTED_NAME "M5Stack CoreS3"
#define PIN_GNSS_TX_DEFAULT 13
#define PIN_GNSS_RX_DEFAULT 14
#define PIN_GNSS_RESET_DEFAULT 7
#define PIN_GNSS_PPS_DEFAULT 8
#define PIN_I2C_SDA_DEFAULT 2
#define PIN_I2C_SCL_DEFAULT 1
#define PIN_SD_CS_DEFAULT 4
#define PIN_STATUS_LED_DEFAULT 35
#define HAS_SPI_TOUCH_SCREEN 1
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 16

// ----------------------------------------------------
// 15. Adafruit Feather ESP32-S3 (Stemma QT)
// ----------------------------------------------------
#elif defined(BOARD_ADAFRUIT_FEATHER_ESP32_S3)
#define BOARD_DETECTED_NAME "Adafruit Feather ESP32-S3"
#define PIN_GNSS_TX_DEFAULT 14
#define PIN_GNSS_RX_DEFAULT 13
#define PIN_GNSS_RESET_DEFAULT 12
#define PIN_GNSS_PPS_DEFAULT 11
#define PIN_I2C_SDA_DEFAULT 3
#define PIN_I2C_SCL_DEFAULT 4
#define PIN_STATUS_LED_DEFAULT 13
#define HAS_EXTERNAL_PSRAM 1
#define BOARD_FLASH_SIZE 8

// ----------------------------------------------------
// Default fallback (ESP-WROOM-32 DevKit)
// ----------------------------------------------------
#else
#define BOARD_DETECTED_NAME "Generic ESP-WROOM-32"
#define PIN_GNSS_TX_DEFAULT 17
#define PIN_GNSS_RX_DEFAULT 16
#define PIN_GNSS_RESET_DEFAULT 4
#define PIN_GNSS_PPS_DEFAULT 15
#define PIN_I2C_SDA_DEFAULT 21
#define PIN_I2C_SCL_DEFAULT 22
#define PIN_STATUS_LED_DEFAULT 2
#define BOARD_FLASH_SIZE 4
#endif

#endif // __BOARD_PROFILES_H__
