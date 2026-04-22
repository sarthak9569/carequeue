import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Input } from '../components/Input';
import { DEPARTMENTS } from '../data/mockData';
import { RootStackParamList, TabParamList } from '../navigation/RootNavigator';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';

type JoinQueueRouteProp = RouteProp<TabParamList, 'JoinQueue'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEPT_ICONS: Record<string, { icon: any, lib: any }> = {
  'OPD': { icon: 'stethoscope', lib: MaterialCommunityIcons },
  'General Consultation': { icon: 'doctor', lib: MaterialCommunityIcons },
  'Emergency': { icon: 'alert-circle-outline', lib: Ionicons },
  'Cardiology': { icon: 'heart-pulse', lib: MaterialCommunityIcons },
  'Orthopedics': { icon: 'bone', lib: MaterialCommunityIcons },
  'Pediatrics': { icon: 'baby-face-outline', lib: MaterialCommunityIcons },
  'General Medicine': { icon: 'medical-bag', lib: MaterialCommunityIcons },
  'Dermatology': { icon: 'image-filter-vintage', lib: MaterialCommunityIcons },
  'ENT': { icon: 'ear-hearing', lib: MaterialCommunityIcons },
  'Gynecology': { icon: 'human-female', lib: MaterialCommunityIcons },
};

export const JoinQueueScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<JoinQueueRouteProp>();
  const { generateToken, stats, departments } = useQueue();
  const { user } = useAuth();
  
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [queueToken, setQueueToken] = useState<any>(null);
  const hasLiveDepartments = departments.length > 0;
  const selectedDepartmentExists = !!selectedDeptId && departments.some((d) => d.id === selectedDeptId);

  useEffect(() => {
    if (route.params?.departmentId) {
      setSelectedDeptId(route.params.departmentId);
    }
  }, [route.params]);

  const handleJoinQueue = async () => {
    if (!hasLiveDepartments) {
      Alert.alert('Please wait', 'Departments are still loading from the server. Try again in a moment.');
      return;
    }

    if (!selectedDeptId) {
      Alert.alert('Error', 'Please select a clinical department');
      return;
    }

    if (!selectedDepartmentExists) {
      Alert.alert('Error', 'Please select a valid department from the live list.');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number for turn alerts');
      return;
    }

    setLoading(true);
    try {
      const result = await generateToken({
        name: user?.name || 'Anonymous Patient',
        phone: phoneNumber,
        departmentId: selectedDeptId,
        source: 'mobile',
        userId: user?.id
      });
      
      setQueueToken({
        queueNumber: result.queue_number,
        patientName: result.patient_name,
        departmentName: result.department.name,
      });
      
      setShowSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', 'Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDeptCard = (dept: { id: string; name: string }) => {
    const isSelected = selectedDeptId === dept.id;
    const iconData = DEPT_ICONS[dept.name] || { icon: 'help-circle-outline', lib: Ionicons };
    const IconLib = iconData.lib;
    const deptStat = stats.byDepartment.find(s => s.name === dept.name);

    return (
      <TouchableOpacity 
        key={dept.id} 
        style={styles.deptCardWrapper}
        onPress={() => setSelectedDeptId(dept.id)}
      >
        <Card style={[styles.deptCard, isSelected && styles.selectedDeptCard]}>
          <View style={styles.deptCardTop}>
            <View style={[styles.waitBadge, isSelected && styles.selectedWaitBadge]}>
              <Typography variant="caption" weight="700" color={isSelected ? colors.surface : colors.muted}>
                {deptStat?.count || 0} WAITING
              </Typography>
            </View>
            <IconLib 
              name={iconData.icon} 
              size={32} 
              color={isSelected ? colors.accent : colors.muted} 
              style={styles.deptIcon}
            />
          </View>
          <View>
            <Typography variant="h4" weight="800" color={isSelected ? colors.primary : colors.text}>{dept.name}</Typography>
            <Typography variant="caption" color={colors.muted}>Standard checkups</Typography>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Layout>
      <View style={styles.headerArea}>
        <Typography variant="h2" weight="800" color={colors.primary}>Request Medical Token</Typography>
        <Typography variant="body" color={colors.muted}>Select a clinical department to join the live sanctuary flow.</Typography>
      </View>

      {loading && <LoadingSpinner fullScreen />}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {departments.length > 0 
            ? departments.map(renderDeptCard)
            : DEPARTMENTS.map(renderDeptCard) // UI-only placeholder cards until API data arrives
          }
        </View>

        <Card style={styles.contactCard}>
          <Typography variant="h4" style={{ marginBottom: spacing.s }}>Notification Details</Typography>
          <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.m }}>
            We will send a local SMS alert to this number when you are next in line.
          </Typography>
          <Input 
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            icon="call-outline"
          />
        </Card>

        <Button 
          title="Generate My Token" 
          onPress={handleJoinQueue} 
          style={styles.submitButton}
          disabled={!selectedDeptId || !hasLiveDepartments || !selectedDepartmentExists}
          icon="arrow-forward"
          iconPosition="right"
        />
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={80} color={colors.success} /></View>
            <Typography variant="h2" align="center" style={styles.successTitle}>Registration Successful!</Typography>
            <Typography variant="body" align="center" color={colors.textSecondary}>Hello, {queueToken?.patientName}</Typography>

            <View style={styles.tokenContainer}>
              <Typography variant="h1" align="center" color={colors.primary} style={styles.tokenNumber}>{queueToken?.queueNumber}</Typography>
              <Typography variant="caption" align="center" color={colors.textSecondary}>YOUR CLINICAL TOKEN</Typography>
            </View>

            <Typography variant="body" align="center" style={{ marginBottom: spacing.l }}>
              You are now in the virtual queue for {queueToken?.departmentName}.
            </Typography>

            <Button 
              title="Track My Status" 
              style={styles.modalBtn} 
              onPress={() => { setShowSuccess(false); navigation.navigate('MyStatus' as any, { queueNumber: queueToken?.queueNumber, deptId: selectedDeptId }); }} 
            />
          </Card>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerArea: {
    padding: spacing.m,
    paddingTop: spacing.l,
    backgroundColor: colors.surface,
  },
  contactCard: {
    marginBottom: spacing.l,
    padding: spacing.l,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
  },
  container: { padding: spacing.m, paddingBottom: spacing.xxl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  deptCardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  deptCard: {
    height: 160,
    justifyContent: 'space-between',
    padding: spacing.m,
    borderColor: 'transparent',
    borderWidth: 2,
  },
  selectedDeptCard: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  deptCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  waitBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
  },
  selectedWaitBadge: {
    backgroundColor: colors.accent,
  },
  deptIcon: {
    opacity: 0.8,
  },
  submitButton: { 
    height: 60,
    marginBottom: spacing.xl,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 39, 68, 0.8)', justifyContent: 'center', alignItems: 'center', padding: spacing.l },
  successCard: { width: '100%', padding: spacing.xl, alignItems: 'center', borderRadius: borderRadius.xl },
  successIcon: { marginBottom: spacing.m },
  successTitle: { marginBottom: spacing.xs, color: colors.success },
  tokenContainer: { marginVertical: spacing.xl, padding: spacing.l, backgroundColor: colors.background, borderRadius: borderRadius.l, width: '100%' },
  tokenNumber: { fontSize: 48, marginBottom: 4, fontWeight: '800' },
  modalBtn: { width: '100%' },
});
