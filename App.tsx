import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

import { AuthProvider } from './src/context/AuthContext';
import { QueueProvider } from './src/context/QueueContext';
import { IVRSimulator } from './src/components/IVRSimulator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueueProvider>
          <RootNavigator />
          <IVRSimulator />
        </QueueProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
