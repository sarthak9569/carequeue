# CareQueue — Hospital Virtual Queue Management System

This document outlines the implementation plan for building the CareQueue mobile app using React Native and Expo. 

The app connects to a MERN backend to manage hospital virtual queues, allowing patients to join queues and track their status in real time.

## Proposed Changes

We will build the application dynamically from scratch using Expo. 

### 1. Initial Setup & Configuration
- Create a new project via `npx create-expo-app@latest . -t expo-template-blank-typescript` in the current directory `c:\Users\me\OneDrive\Desktop\android app`.
- Install necessary dependencies:
  - Navigation: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`.
  - Networking & Realtime: `axios`, `socket.io-client`.
  - Device/Hardware integration: `expo-camera`, `expo-notifications`, `expo-haptics`, `expo-constants`.
  - Icons & UI elements: `@expo/vector-icons`.

### 2. Theming and UI System
- Setup global style configuration defining the dark, accent, success, warning, and danger colors specified in the prompt.
- Create reusable custom UI components:
  - `Card`
  - `Button`
  - `Typography` components
  - `LoadingSpinner`
  - `Toast` notifications component.

### 3. Navigation Structure
- **RootStack**: 
  - `MainTabs` (Bottom Tabs Navigation)
  - `JoinQueue` (Stack Screen)
  - `DoctorDashboard` (Stack Screen)
  - `AdminDashboard` (Stack Screen)
  - `IVRScreen` (Stack Screen)
- **MainTabs**:
  - Home (Icon: home)
  - Join Queue (Icon: add-circle)
  - My Status (Icon: time)
  - Scan QR (Icon: qr-code)

### 4. Screen Implementations

- **Home Screen**: 
  - Real-time fetching of stats (waiting, serving, completed).
  - Quick action buttons.
  - Interactive grid of departments.
- **Join Queue Screen**: 
  - Full Name, Phone (Optional), and Department selection form.
  - QR scanning shortcut.
  - Animated modal upon successful registration (Confetti / Haptic).
- **Scanner/QR Screen**: 
  - Using `expo-camera` to read QR Codes containing department information. 
  - Prompt user to confirm registration on scan.
- **My Status Screen**:
  - Input form for Queue Number + Department selection.
  - Live socket subscription for position/time tracking.
  - Pulsing animation for active turn.
- **IVR Simulation Screen**: 
  - Recreating a phone dialer UI with sample interactions mirroring the voice IVR flow.
- **Doctor/Admin Dashboards**:
  - Connected views managing queue states via API (`/queue/next`, `/queue/complete/:id`).

### 5. API & Real-time Integration
- Centralized Axios instance with a configurable `BASE_URL`.
- Socket.io Context/Provider:
  - Connect to socket server on mount.
  - Emitting `join_department`.
  - Listeners for `queue_updated` and `stats_updated`.

### 6. Background Push/Local Notifications
- Register for local notifications using `expo-notifications`.
- Monitor current position; trigger a local push notification when the user's turn is ≤ 5.

## Open Questions

> [!WARNING]
> Please confirm if I should mock the backend (Node.js/Express MERN stack) for the initial implementation, or if you already have the backend running? If the backend is running, what is its base URL? (e.g., `http://192.168.1.100:5000/api`). If not, mock APIs/data can be initially built in the frontend to demonstrate functionality.

> [!NOTE]
> Since we are running in an environment where we would test the UI locally, I will implement mock handlers or configuration toggles if a backend isn't provided right away. Is this acceptable?

## Verification Plan

### Automated/Manual Verification
- I will run `npm start` (or `npx expo start --web`) to verify the React native UI implementation in a browser where possible.
- Visual inspection of the 7 separate screens to ensure colors and layout requirements match your descriptions.
- Ensure transitions between tabs and stacked screens work properly.
- Verify simulated network calls handles loading, success, and error gracefully.
