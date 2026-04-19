# Twilio + ngrok Local Integration Guide

To connect your real phone number to your local CareQueue backend, follow these steps:

### 1. Account Configuration
1. Log in to [Twilio Console](https://www.twilio.com/console).
2. Grab your **Account SID** and **Auth Token**.
3. Update your `backend/.env` file with these keys.

### 2. Expose your Local Server
Since Twilio is on the internet, it can't see `localhost:5000`. You must create a tunnel:
1. Install **ngrok** (if not already installed).
2. Run command: `ngrok http 5000`
3. Copy the **Forwarding** URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).

### 3. Configure the Webhook
1. Go to **Phone Numbers** > **Manage** > **Active Numbers** in Twilio.
2. Click on your phone number.
3. Scroll down to **Voice & Fax**.
4. Set "A CALL COMES IN" to **Webhook**.
5. Paste your ngrok URL + `/api/ivr/voice`
   * Example: `https://a1b2-c3d4.ngrok-free.app/api/ivr/voice`
6. Click **Save Configuration**.

### 4. Test it!
1. Start your backend: `npm run dev` inside `backend/`.
2. Grab your phone and dial the number!
3. The registration will appear in real-time on your Laptop (Doctor Dashboard).

> [!TIP]
> Always check the **live logs** in the terminal to see if Twilio is hitting your backend routes successfully!
