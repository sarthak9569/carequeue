import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';

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
  ForgotPassword: { email?: string } | undefined;
  VerifyOtp: { email: string };
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
const Tab = createMaterialTopTabNavigator<TabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </AuthStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color }: { focused: boolean, color: string }) => {
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

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIndicatorStyle: {
          top: 0,
          backgroundColor: colors.accent,
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 65,
          elevation: 8,
          shadowOpacity: 0.1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarShowIcon: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="JoinQueue" component={JoinQueueScreen} options={{ title: 'Join' }} />
      <Tab.Screen name="History" component={TokenHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="MyStatus" component={MyStatusScreen} options={{ title: 'Status' }} />
      <Tab.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan' }} />
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
