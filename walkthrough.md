# Walkthrough — CareQueue Real-time Integration

Successfully integrated the CareQueue mobile app with the MERN backend, enabling real-time queue management and a functional IVR simulator.

## Changes Overview

### 1. Backend: Persistent Data & API
- **Seeding**: Created and executed `seed.js`, populating the database with primary hospital departments (OPD, Cardiology, etc.).
- **New API Route**: Added `GET /api/queue/departments` to allow the frontend to fetch the real, unique database IDs for specific departments.
- **Queue Logic**: Ensured the `joinQueue` controller correctly emits socket events to notify all connected clients.

### 2. Frontend: Real-time Communication
- **Socket.io Service**: Replaced the `MockSocket` with a real `socket.io-client` implementation pointing to your local backend server.
- **QueueProvider Sync**:
    - Added automatic data fetching on app launch.
    - Implemented socket listeners that trigger UI refreshes whenever a new patient joins or a status changes.
    - Exposed a live `departments` list derived from the database.

### 3. IVR Simulator: End-to-End Flow
- **Live Data**: The IVR FAB now uses real department data. When you dictate "Cardiology", it correctly matches the ID from your MongoDB.
- **Integration**: Completing an IVR "call" now results in a real document creation in Atlas, which instantly appears on other connected screens.

## How to Test

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend
```bash
npx expo start --web
```

### 3. Verify Real-time Sync
- Open the app in two separate browser tabs.
- In **Tab A**, click the **IVR (Phone) button** and complete a registration (e.g., Name: "Sarthak", Dept: "Pediatrics").
- Observe **Tab B** (home screen or stats) — the "Waiting" count should increment automatically without refreshing.

### 4. Verify Persistence
- Refresh the page; your queue status should remain visible, fetched directly from the MongoDB Atlas database.

> [!TIP]
> **Check Console Logs**: I've added logging in `socketService.ts` and `QueueContext.tsx`. You'll see "Connected to Sanctuary Socket Server" in the browser console if the connection is successful.
