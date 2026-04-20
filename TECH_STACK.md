# CareQueue: Clinical Tech Stack & Architecture

This document provides a detailed breakdown of the internal technologies used to build the **CareQueue Hospital Virtual Queue System**.

## 📱 Frontend (Mobile & Web)

| Technology | Usage & Detail |
| :--- | :--- |
| **React Native (Expo)** | The core framework used to build cross-platform mobile applications (Android/iOS) and web views from a single codebase. |
| **TypeScript** | Ensures type safety throughout the application, reducing runtime crashes and improving developer productivity in large clinical systems. |
| **React Navigation** | Handles the complex routing between patient dashboards, doctor portals, and the IVR simulation screens. |
| **Socket.io Client** | Provides a real-time connection to the backend, allowing the doctor's dashboard to update instantly when a patient joins via IVR or mobile. |
| **Axios** | Used for all asynchronous communication with the REST API (e.g., login, profile updates, and token generation). |
| **Expo Camera** | Powers the QR Code scanning feature in the `ScanQRScreen` for instant "at-hospital" check-ins. |
| **Expo Notifications** | Manages push notifications and local alerts to inform patients when their turn is approaching. |
| **Expo Speech** | Used in the IVR Simulator to provide high-quality text-to-speech for clinical instructions. |

## ⚙️ Backend (API & Real-time Engine)

| Technology | Usage & Detail |
| :--- | :--- |
| **Node.js & Express** | The high-performance server environment and API framework that manages clinical logic and data flow. |
| **MongoDB & Mongoose** | A NoSQL database used to store patient profiles, token history, and clinical department configurations. |
| **Socket.io (Server)** | The primary real-time engine. It broadcasts clinical updates to doctors and syncs wait times across all connected devices. |
| **JsonWebToken (JWT)** | Provides secure, stateless authentication for both patients and doctors. |
| **Bcryptjs** | Used for the strong hashing of passwords before they are stored in the database. |
| **Twilio SDK** | Integrates real-world phone calls. It uses TwiML (XML) to process incoming calls and automate patient registration via Voice. |

## 🛠️ Infrastructure & Deployment

| Technology | Usage & Detail |
| :--- | :--- |
| **ngrok** | A secure tunneling service used to expose the local development server (localhost:5000) to the public internet for Twilio webhooks. |
| **Expo Go** | Used for rapid prototyping and live-testing of the mobile interface on real physical devices. |
| **Git & GitHub** | Used for version control, ensuring all clinical logic and database schemas are tracked and backed up. |

## 🧬 Architectural Patterns

1.  **MERN Stack**: MongoDB, Express, React Native, Node.js.
2.  **IVR (Interactive Voice Response)**: A specialized voice-first interface for non-digital patients.
3.  **Real-time Event-Driven Architecture**: Uses Socket.io to eliminate polling and ensure zero-delay in clinical notifications.
4.  **Premium Medical Aesthetics**: Uses a custom styling system based on **HSL colors** for a state-of-the-art clinical user experience.

---
© 2026 CareQueue Clinical Systems. This document is part of the internal developer documentation.
