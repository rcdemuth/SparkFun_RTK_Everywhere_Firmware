/*=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  BLE_UART_Bridge.h
  Nordic UART Service (NUS) BLE Bridge for ESP32 / C3 / C6 / S3
  Bypasses the Bluetooth Classic requirement to run on single-core RISC-V and 4MB Flash chips.
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

#ifndef __BLE_UART_BRIDGE_H__
#define __BLE_UART_BRIDGE_H__

#include <Arduino.h>

#if defined(COMPILE_BLE_ONLY) || defined(COMPILE_BT)
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define BLE_UART_SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define BLE_UART_CHAR_RX_UUID           "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // Client writes to MCU (RTCM/Commands)
#define BLE_UART_CHAR_TX_UUID           "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // MCU notifies Client (NMEA)

class BLE_UART_Bridge : public BLEServerCallbacks, public BLECharacteristicCallbacks {
public:
    BLE_UART_Bridge();
    void begin(const char * deviceName = "RTK-Everywhere-BLE");
    void write(const uint8_t * data, size_t length);
    void print(const char * str);
    void println(const char * str);
    bool isConnected() const { return deviceConnected; }

    // Stream callback for feeding received RTCM into GNSS stream
    void setGnssStream(Stream * stream) { gnssSerial = stream; }

    void onConnect(BLEServer* pServer) override;
    void onDisconnect(BLEServer* pServer) override;
    void onWrite(BLECharacteristic *pCharacteristic) override;

private:
    BLEServer *pServer;
    BLECharacteristic *pTxCharacteristic;
    BLECharacteristic *pRxCharacteristic;
    bool deviceConnected;
    bool oldDeviceConnected;
    Stream * gnssSerial;
};

#endif // COMPILE_BLE_ONLY || COMPILE_BT
#endif // __BLE_UART_BRIDGE_H__
