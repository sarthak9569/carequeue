import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { JoinQueueScreen } from '../screens/JoinQueueScreen';
import { MyStatusScreen } from '../screens/MyStatusScreen';
import { ScanQRScreen } from '../screens/ScanQRScreen';
import { IVRScreen } from '../screens/IVRScreen';
import { DoctorDashboard } from '../screens/DoctorDashboard';
import { AdminDashboard } from '../screens/AdminDashboard';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';

import { TokenHistoryScreen } from '../screens/TokenHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Context
import { useAuth } from '../context/AuthContext';

// Theme
import { colors } from '../theme/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  IVR: undefined;
  DoctorDashboard: undefined;
  AdminDashboard: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type TabParamList = {
  Home: undefined;
  JoinQueue: { departmentId?: string } | undefined;
  History: undefined;
  MyStatus: { queueNumber?: string; deptId?: string } | undefined;
  ScanQR: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (focused) {
            if (route.name === 'Home') iconName = 'grid';
            else if (route.name === 'JoinQueue') iconName = 'add-circle';
            else if (route.name === 'History') iconName = 'list';
            else if (route.name === 'MyStatus') iconName = 'time';
            else if (route.name === 'ScanQR') iconName = 'qr-code';
          } else {
            if (route.name === 'Home') iconName = 'grid-outline';
            else if (route.name === 'JoinQueue') iconName = 'add-circle-outline';
            else if (route.name === 'History') iconName = 'list-outline';
            else if (route.name === 'MyStatus') iconName = 'time-outline';
            else if (route.name === 'ScanQR') iconName = 'qr-code-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="JoinQueue" component={JoinQueueScreen} options={{ tabBarLabel: 'Join' }} />
      <Tab.Screen name="History" component={TokenHistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="MyStatus" component={MyStatusScreen} options={{ tabBarLabel: 'Status' } } />
      <Tab.Screen name="ScanQR" component={ScanQRScreen} options={{ tabBarLabel: 'Scan' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={user?.role === 'doctor' ? 'DoctorDashboard' : 'MainTabs'}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="IVR" component={IVRScreen} />
          <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
