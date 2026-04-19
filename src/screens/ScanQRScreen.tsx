import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Alert, 
  Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width } = Dimensions.get('window');
const scannerSize = width * 0.7;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScanQRScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulated URL parsing: http://yourapp.com/join?dept=DEPT_ID
    // For testing, we'll try to find any department ID in the string if not a full URL
    let deptId = '';
    try {
      const url = new URL(data);
      deptId = url.searchParams.get('dept') || '';
    } catch {
      // If not a URL, check if the data itself matches a department name/id
      deptId = data;
    }

    const department = DEPARTMENTS.find(d => d.id === deptId || d.name.toLowerCase() === data.toLowerCase());

    if (department) {
      Alert.alert(
        'Department Found',
        `Register for ${department.name}?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' },
          { 
            text: 'Proceed', 
            onPress: () => navigation.navigate('JoinQueue' as any, { departmentId: department.id }) 
          },
        ]
      );
    } else {
      Alert.alert(
        'Invalid QR',
        'This QR code does not belong to a valid department.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (!permission) {
    return (
      <Layout>
        <View style={styles.center}>
          <Typography>Requesting camera permission...</Typography>
        </View>
      </Layout>
    );
  }

  if (!permission.granted) {
    return (
      <Layout>
        <View style={styles.center}>
          <Typography align="center" style={{ marginBottom: spacing.m }}>
            We need your permission to show the camera
          </Typography>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </Layout>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={32} color={colors.surface} />
            </TouchableOpacity>
            <Typography variant="h3" color={colors.surface}>Scan QR Code</Typography>
            <View style={{ width: 32 }} />
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerWrapper}>
            <View style={styles.scannerFrame}>
              {/* Corner Guides */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Typography color={colors.surface} align="center" style={styles.hintText}>
              Align QR code within the frame
            </Typography>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button 
              title="Cancel" 
              variant="outline" 
              style={styles.cancelBtn} 
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  backButton: {
    padding: spacing.s,
  },
  scannerWrapper: {
    alignItems: 'center',
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize,
    borderWidth: 0,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 15,
  },
  hintText: {
    marginTop: spacing.l,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  cancelBtn: {
    borderColor: colors.surface,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
