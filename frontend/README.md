# Digital Donor - HopeCardRN

A modern React Native application for Digital Donor.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.11.0
- Android Studio & SDK (API 36 recommended for compilation)
- Gradle 8.13

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexandraamicics-cpu/HopeCardRN.git
   cd HopeCardRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Peer Dependencies**
   This project uses Reanimated v4 which requires:
   ```bash
   npm install react-native-worklets
   ```

## 📱 Running on a Physical Phone

Testing on a real device is faster and more accurate than an emulator.

### 1. Enable Developer Mode
- On your phone, go to **Settings > About Phone**.
- Tap **Build Number** 7 times until you see "You are now a developer."
- Go to **Settings > Developer Options** and enable **USB Debugging**.

### 2. Connect via USB
- Plug your phone into your computer.
- Accept the "Allow USB Debugging?" prompt on the phone screen.
- Verify connection by running: `adb devices`

### 3. Tunnel the Custom Port
Since this project uses port **8082**, run this command to link your phone to the Metro server:
```bash
adb reverse tcp:8081 tcp:8082
```

### 4. Launch the App
1. **Start Metro (Terminal 1):**
   ```bash
   npx react-native start --port 8082
   ```
2. **Install on Phone (Terminal 2):**
   ```bash
   npx react-native run-android --port 8082
   ```

---

## 🛠 Project Configuration Details

This project has been optimized with the following specific configurations:

- **GitHub Repository**: [alexandraamicics-cpu/HopeCardRN](https://github.com/alexandraamicics-cpu/HopeCardRN)
- **Gradle Version**: `8.13` (maintained for plugin compatibility).
- **Android SDK**: `compileSdkVersion` set to `36`.
- **Port**: Configured to run on port `8082` by default.
- **Babel**: Includes `react-native-reanimated/plugin`.

## 🔧 Troubleshooting

### "Unable to load script" on Phone
If the app fails to connect to Metro:
1. **Shake the phone** to open the Developer Menu.
2. Tap **Settings > Debug server host & port for device**.
3. Enter your computer's IP address and port (e.g., `192.168.1.5:8082`).
4. Select **Reload**.


