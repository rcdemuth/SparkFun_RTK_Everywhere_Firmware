/*=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  GNSS_Tilt_Integrated.ino
  Implementation of native onboard IMU tilt engine
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

#include "GNSS_Tilt_Integrated.h"

GNSS_Tilt_Integrated::GNSS_Tilt_Integrated(TiltSensorType type) {
    sensorType = type;
    bufIdx = 0;
    memset(&data, 0, sizeof(data));
    data.status = TILT_STATUS_UNINITIALIZED;
    data.pole_height_m = 1.80f;
}

void GNSS_Tilt_Integrated::begin(Stream * gnssStream, float poleHeightMeters, float lx, float ly, float lz) {
    if (!gnssStream) return;

    data.pole_height_m = poleHeightMeters;

    if (sensorType == TILT_UM981_ONBOARD) {
        // Unicorecomm UM981 INS & Tilt initialization sequence
        gnssStream->println("CONFIG HEADING ENABLE");
        delay(50);
        gnssStream->println("CONFIG INS ENABLE");
        delay(50);
        gnssStream->println("CONFIG ALIGNTYPE HEADING");
        delay(50);
        gnssStream->println("CONFIG TILTCOMPENSATION ENABLE");
        delay(50);
        char poleCmd[64];
        snprintf(poleCmd, sizeof(poleCmd), "CONFIG POLE LEVERARM 0 0 -%.3f", poleHeightMeters);
        gnssStream->println(poleCmd);
        delay(50);
        char antCmd[64];
        snprintf(antCmd, sizeof(antCmd), "CONFIG ANTENNA LEVERARM %.4f %.4f %.4f", lx, ly, lz);
        gnssStream->println(antCmd);
        delay(50);
        gnssStream->println("CONFIG INS OUTPUTPVA KSXT 5");
        delay(50);
        gnssStream->println("SAVECONFIG");
    } else if (sensorType == TILT_COMMNAV_K827_K922) {
        // ComNav SinoGNSS K827 / K922 IMU Tilt sequence
        gnssStream->println("SET IMU ENABLE");
        delay(50);
        gnssStream->println("SET IMUTYPE ONBOARD");
        delay(50);
        gnssStream->println("SET TILT COMPENSATE ON");
        delay(50);
        char poleCmd[64];
        snprintf(poleCmd, sizeof(poleCmd), "SET POLEHEIGHT %.3f", poleHeightMeters);
        gnssStream->println(poleCmd);
        delay(50);
        gnssStream->println("SET NMEA GNTLT COM1 5");
        delay(50);
        gnssStream->println("SAVE CONFIG");
    } else if (sensorType == TILT_BYNAV_M21_M22) {
        // Bynav M21 / M22 INS tilt sequence
        gnssStream->println("ALIGNMENTMODE AUTOMATIC");
        delay(50);
        gnssStream->println("INSCOMMAND ENABLE");
        delay(50);
        char poleCmd[64];
        snprintf(poleCmd, sizeof(poleCmd), "SET POLEOFFSET 0 0 -%.3f", poleHeightMeters);
        gnssStream->println(poleCmd);
        delay(50);
        gnssStream->println("LOG COM1 INSPVA ONTIME 0.2");
        delay(50);
        gnssStream->println("SAVECONFIG");
    }

    data.status = TILT_STATUS_ALIGNING;
}

void GNSS_Tilt_Integrated::setPoleHeight(Stream * gnssStream, float heightMeters) {
    data.pole_height_m = heightMeters;
    if (!gnssStream) return;

    if (sensorType == TILT_UM981_ONBOARD) {
        char cmd[64];
        snprintf(cmd, sizeof(cmd), "CONFIG POLE LEVERARM 0 0 -%.3f", heightMeters);
        gnssStream->println(cmd);
    } else if (sensorType == TILT_COMMNAV_K827_K922) {
        char cmd[64];
        snprintf(cmd, sizeof(cmd), "SET POLEHEIGHT %.3f", heightMeters);
        gnssStream->println(cmd);
    } else if (sensorType == TILT_BYNAV_M21_M22) {
        char cmd[64];
        snprintf(cmd, sizeof(cmd), "SET POLEOFFSET 0 0 -%.3f", heightMeters);
        gnssStream->println(cmd);
    }
}

bool GNSS_Tilt_Integrated::processChar(char c) {
    if (c == '\r') return false;
    if (c == '\n') {
        buffer[bufIdx] = '\0';
        if (bufIdx > 5) {
            parseSentence(buffer);
        }
        bufIdx = 0;
        return true;
    }

    if (bufIdx < sizeof(buffer) - 1) {
        buffer[bufIdx++] = c;
    } else {
        bufIdx = 0; // Overflow protection
    }
    return false;
}

void GNSS_Tilt_Integrated::parseSentence(const char * line) {
    if (strncmp(line, "$KSXT", 5) == 0) {
        parseKSXT(line);
    } else if (strncmp(line, "$GNTLT", 6) == 0) {
        parseGNTLT(line);
    } else if (strncmp(line, "#INSPVA", 7) == 0) {
        parseINSPVA(line);
    }
}

// UM981 sentence: $KSXT,time,lat,N/S,lon,E/W,alt,heading,pitch,roll,quality,siv,hpa*cs
void GNSS_Tilt_Integrated::parseKSXT(const char * line) {
    float heading = 0, pitch = 0, roll = 0;
    int qual = 0;

    // Scan parameters after time, lat, lon, alt
    const char * p = line;
    int commaCount = 0;
    while (*p && commaCount < 7) {
        if (*p == ',') commaCount++;
        p++;
    }

    if (commaCount == 7) {
        sscanf(p, "%f,%f,%f,%d", &heading, &pitch, &roll, &qual);
        data.heading_deg = heading;
        data.pitch_deg = pitch;
        data.roll_deg = roll;
        data.total_tilt_deg = sqrt(pitch * pitch + roll * roll);
        data.status = (qual >= 4) ? TILT_STATUS_COMPENSATING : TILT_STATUS_ALIGNING;
        data.last_update_ms = millis();
    }
}

// ComNav SinoGNSS: $GNTLT,status,heading,pitch,roll,lat,lon,alt*cs
void GNSS_Tilt_Integrated::parseGNTLT(const char * line) {
    int status = 0;
    float heading = 0, pitch = 0, roll = 0;
    double lat = 0, lon = 0;
    float alt = 0;

    if (sscanf(line, "$GNTLT,%d,%f,%f,%f,%lf,%lf,%f", &status, &heading, &pitch, &roll, &lat, &lon, &alt) >= 4) {
        data.heading_deg = heading;
        data.pitch_deg = pitch;
        data.roll_deg = roll;
        data.total_tilt_deg = sqrt(pitch * pitch + roll * roll);
        data.compensated_lat = lat;
        data.compensated_lon = lon;
        data.compensated_alt = alt;
        data.status = (status == 1) ? TILT_STATUS_COMPENSATING : TILT_STATUS_ALIGNING;
        data.last_update_ms = millis();
    }
}

// Bynav: #INSPVA...;lat,lon,alt,vN,vE,vU,roll,pitch,azimuth,status*cs
void GNSS_Tilt_Integrated::parseINSPVA(const char * line) {
    const char * semi = strchr(line, ';');
    if (!semi) return;

    double lat = 0, lon = 0;
    float alt = 0, vN = 0, vE = 0, vU = 0, roll = 0, pitch = 0, heading = 0;
    char statusStr[32];

    if (sscanf(semi + 1, "%lf,%lf,%f,%f,%f,%f,%f,%f,%f,%31[^,*]",
               &lat, &lon, &alt, &vN, &vE, &vU, &roll, &pitch, &heading, statusStr) >= 9) {
        data.heading_deg = heading;
        data.pitch_deg = pitch;
        data.roll_deg = roll;
        data.total_tilt_deg = sqrt(pitch * pitch + roll * roll);
        data.compensated_lat = lat;
        data.compensated_lon = lon;
        data.compensated_alt = alt;
        data.status = (strstr(statusStr, "GOOD") != NULL) ? TILT_STATUS_COMPENSATING : TILT_STATUS_ALIGNING;
        data.last_update_ms = millis();
    }
}
