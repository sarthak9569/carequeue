import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';

const { width } = Dimensions.get('window');
type AdminTab = 'Overview' | 'Management' | 'Doctors' | 'Queue' | 'QR Codes';

export const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { tokens, stats, resetQueue } = useQueue();
  const [activeTab, setActiveTab] = useState<AdminTab>('Management');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'Doctors') {
      fetchDoctors();
    }
  }, [activeTab]);

  const fetchDoctors = async () => {
    try {
      setLoadingStaff(true);
      const res = await adminService.getDoctors();
      if (res.data && res.data.data) {
        setDoctors(res.data.data);
      }
    } catch (e) {
      console.error('Failed to sync medical personnel:', e);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleReset = async () => {
    Alert.alert('Reset Queue', 'Clear all data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        await resetQueue();
        Alert.alert('Success', 'System reset.');
      }}
    ]);
  };

  const renderTabButton = (tab: AdminTab) => (
    <TouchableOpacity style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]} onPress={() => setActiveTab(tab)}>
      <Typography variant="caption" weight="600" color={activeTab === tab ? colors.primary : colors.textSecondary}>{tab}</Typography>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsGrid}>
        <Card style={styles.statBox}>
          <Typography variant="h2">{stats.waiting || 0}</Typography>
          <Typography variant="caption">Total Waiting</Typography>
        </Card>
        <Card style={styles.statBox}>
          <Typography variant="h2">{stats.serving || 0}</Typography>
          <Typography variant="caption">Now Serving</Typography>
        </Card>
      </View>
      <Typography variant="h4" style={styles.sectionTitle}>Department Traffic</Typography>
      {stats.byDepartment && stats.byDepartment.length > 0 ? stats.byDepartment.map(dept => (
        <Card key={dept.name} variant="flat" style={styles.deptStatRow}>
          <Typography weight="600">{dept.name}</Typography>
          <Badge label={`${dept.count || 0} Waiting`} variant={dept.count > 10 ? 'warning' : 'success'} />
        </Card>
      )) : (
        <Typography align="center" color={colors.muted} style={{ marginTop: 20 }}>No active department traffic recorded.</Typography>
      )}
      <Button 
        title="Refresh Analytics" 
        variant="outline" 
        onPress={() => resetQueue()} 
        style={{ marginTop: spacing.l }} 
        icon={<Ionicons name="refresh" size={18} color={colors.accent} />} 
      />
    </ScrollView>
  );

  const renderQueue = () => (
    <FlatList
      data={tokens}
      keyExtractor={item => item.id}
      ListHeaderComponent={<Typography variant="h4" style={styles.sectionTitle}>Global Queue History</Typography>}
      renderItem={({ item }) => (
        <Card variant="flat" style={styles.historyRow}>
          <View style={styles.historyMain}>
            <Typography variant="body" weight="600">{item.patient_name} ({item.queue_number})</Typography>
            <Typography variant="caption" color={colors.textSecondary}>{item.department.name} • {item.createdAt.toLocaleTimeString()}</Typography>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Badge label={item.status.toUpperCase()} variant={item.status === 'completed' ? 'info' : (item.status === 'current' ? 'success' : 'warning')} />
            <Typography variant="caption" style={{ marginTop: 4 }}>Source: {item.source}</Typography>
          </View>
        </Card>
      )}
    />
  );

  const renderManagement = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Typography variant="h4" style={styles.sectionTitle}>Hospital Administration</Typography>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('HospitalProfile')}>
          <Card style={styles.gridCard}>
            <Ionicons name="business" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Hospital Profile</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('DepartmentManagement')}>
          <Card style={styles.gridCard}>
            <Ionicons name="layers" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Departments</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('DoctorManagement')}>
          <Card style={styles.gridCard}>
            <Ionicons name="people" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Doctors</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('StaffManagement' as any)}>
          <Card style={styles.gridCard}>
            <Ionicons name="people-circle" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Staff</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('LeaveManagement' as any)}>
          <Card style={styles.gridCard}>
            <Ionicons name="calendar-outline" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Leaves</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ScheduleManagement' as any)}>
          <Card style={styles.gridCard}>
            <Ionicons name="time-outline" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Schedules</Typography>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Reports')}>
          <Card style={styles.gridCard}>
            <Ionicons name="bar-chart" size={28} color={colors.accent} />
            <Typography variant="caption" weight="600" style={{ marginTop: 8 }}>Reports</Typography>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const handleRemoveDoctor = async (id: string, name: string) => {
    Alert.alert('Decommission Personnel', `Are you sure you want to remove Dr. ${name} and their clinical access credentials permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await adminService.removeDoctor(id);
          fetchDoctors();
          Alert.alert('Success', 'Medical personnel record removed');
        } catch (e) {
          Alert.alert('Error', 'Failed to remove staff record');
        }
      }}
    ]);
  };

  const renderDoctors = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.actionHeaderInline}>
        <Typography variant="h3">Staff List</Typography>
        <Button title="Onboard" size="small" onPress={() => navigation.navigate('DoctorManagement')} />
      </View>
      <FlatList
        data={doctors}
        keyExtractor={(item: any) => item._id || item.id}
        refreshing={loadingStaff}
        onRefresh={fetchDoctors}
        ListEmptyComponent={<Typography align="center" color={colors.muted} style={{ marginTop: 40 }}>No medical staff are currently onboarded.</Typography>}
        renderItem={({ item }) => (
          <Card style={styles.doctorRowInline} variant="flat">
            <View style={{ flex: 1 }}>
              <Typography weight="700">{item.name}</Typography>
              <Typography variant="caption" color={colors.muted}>{item.department?.name || 'General Unit'}</Typography>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Badge label={item.status || 'Active'} variant={item.status === 'Online' ? 'success' : 'info'} />
              <TouchableOpacity onPress={() => handleRemoveDoctor(item._id || (item as any).id, item.name)} style={{ marginTop: 8 }}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </View>
  );

  return (
    <Layout>
      <Header 
        title="Admin Hub" 
        showBack={false}
        leftIcon="settings-outline"
        onLeftPress={() => navigation.navigate('Settings' as any)}
        rightIcon="log-out-outline"
        onRightPress={() => {
          Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout }
          ]);
        }}
      />
      <View style={styles.tabBar}>
        {renderTabButton('Overview')}{renderTabButton('Management')}{renderTabButton('Doctors')}{renderTabButton('Queue')}
      </View>
      <View style={styles.main}>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Queue' && renderQueue()}
        {activeTab === 'Management' && renderManagement()}
        {activeTab === 'Doctors' && renderDoctors()}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, padding: spacing.m },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: spacing.m, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabBtn: { borderBottomColor: colors.primary },
  sectionTitle: { marginBottom: spacing.m, marginTop: spacing.s },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.m },
  statBox: { width: (width - spacing.m * 3) / 2, alignItems: 'center', padding: spacing.m },
  deptStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s, padding: spacing.m },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.m, marginBottom: spacing.s },
  historyMain: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: (width - spacing.m * 3) / 2, marginBottom: spacing.m },
  gridCard: { padding: spacing.l, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  actionHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  doctorRowInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    marginBottom: spacing.s,
    backgroundColor: colors.surface,
  },
});
