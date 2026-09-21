# SOCForge Mobile Incident Response App

Cross-platform security operations application (iOS & Android) designed for on-call SOC analysts and Incident Commanders.

## Key Features

- **Live Triage Queue**: Stream real-time alerts with severity categorization (Critical, High, Medium), MITRE ATT&CK technique tags, and evidence summaries.
- **Four-Eyes Containment Approval**: Authorize or reject containment actions (`isolate_host`, `disable_user`, `block_ip`) from anywhere with instant confirmation.
- **DEFCON Tactical Health**: Real-time cluster status, MTTR metrics, and intrusion density gauges.
- **Configurable Gateway**: Point to any SOCForge instance (Localhost, LAN IP, or Cloud API Gateway) with automatic health probes and offline resilience.

---

## Quick Start with Expo

### Prerequisites
- Node.js 18+ & npm
- [Expo Go app](https://expo.dev/client) installed on your physical iPhone or Android device (optional, for physical device preview).

### Installation & Run

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. **Open on Physical Device**:
   - Scan the QR code displayed in the terminal with your phone camera (iOS) or Expo Go app (Android).
   - In the Settings tab within the app, change the API Gateway URL from `http://localhost:8000` to your computer's local Wi-Fi IP (e.g. `http://192.168.1.100:8000`).

4. **Run in Web Browser**:
   ```bash
   npm run web
   ```
