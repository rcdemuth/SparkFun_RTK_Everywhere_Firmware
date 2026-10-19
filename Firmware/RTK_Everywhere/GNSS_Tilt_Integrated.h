/*=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  GNSS_Tilt_Integrated.h
  Native Onboard IMU Tilt Correction Driver for SparkFun RTK Everywhere

  Supports GNSS chipsets with integrated 6-axis MEMS IMU:
  - Unicorecomm UM981 (Commands: CONFIG INS ENABLE, CONFIG POLE LEVERARM; Sentences: $KSXT, INSPVA)
  - ComNav SinoGNSS K827 & K922 (Commands: SET IMU ENABLE, SET POLEHEIGHT; Sentence: $GNTLT)
  - Bynav M21 & M22 (Commands: ALIGNMENTMODE AUTOMATIC, SET LEVERARM; Sentence: #INSPVA)
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

#ifndef __GNSS_TILT_INTEGRATED_H__
#define __GNSS_TILT_INTEGRATED_H__

#include <Arduino.h>

enum TiltSensorType {
    TILT_NONE = 0,
    TILT_UM981_ONBOARD,
    TILT_COMMNAV_K827_K922,
    TILT_BYNAV_M21_M22,
    TILT_EXTERNAL_IM19,
};

enum TiltStateStatus {
    TILT_STATUS_UNINITIALIZED = 0,
    TILT_STATUS_ALIGNING,      // Shake/rocking to align
    TILT_STATUS_COMPENSATING,  // Active tilt solution
    TILT_STATUS_DEGRADED,
    TILT_STATUS_ERROR
};

struct TiltData {
    float roll_deg;
    float pitch_deg;
    float heading_deg;
    float total_tilt_deg;
    float pole_height_m;
    double compensated_lat;
    double compensated_lon;
    float compensated_alt;
    TiltStateStatus status;
    uint32_t last_update_ms;
};

class GNSS_Tilt_Integrated {
public:
    GNSS_Tilt_Integrated(TiltSensorType type = TILT_UM981_ONBOARD);

    // Initialize native commands based on chip type
    void begin(Stream * gnssStream, float poleHeightMeters = 1.80f, float lx = 0.0f, float ly = 0.0f, float lz = -0.05f);

    // Feed incoming GNSS characters for tilt sentence parsing
    bool processChar(char c);

    // Check if tilt compensation is currently converged & locked
    bool isTiltCompensated() const { return data.status == TILT_STATUS_COMPENSATING; }

    const TiltData & getData() const { return data; }
    float getTotalTilt() const { return data.total_tilt_deg; }

    void setPoleHeight(Stream * gnssStream, float heightMeters);

private:
    TiltSensorType sensorType;
    TiltData data;
    char buffer[256];
    uint8_t bufIdx;

    void parseSentence(const char * line);
    void parseKSXT(const char * line);     // UM981
    void parseGNTLT(const char * line);    // ComNav
    void parseINSPVA(const char * line);   // Bynav
};

#endif // __GNSS_TILT_INTEGRATED_H__
