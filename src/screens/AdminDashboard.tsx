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
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { useQueue } from '../context/QueueContext';

const { width } = Dimensions.get('window');
type AdminTab = 'Overview' | 'Doctors' | 'Queue' | 'QR Codes';

export const AdminDashboard: React.FC = () => {
  const { tokens, stats, resetQueue } = useQueue();
  const [activeTab, setActiveTab] = useState<AdminTab>('Overview');

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
        <Card style={styles.statBox}><Typography variant="h2">{stats.waiting}</Typography><Typography variant="caption">Total Waiting</Typography></Card>
        <Card style={styles.statBox}><Typography variant="h2">{stats.serving}</Typography><Typography variant="caption">Now Serving</Typography></Card>
      </View>
      <Typography variant="h4" style={styles.sectionTitle}>Department Breakdown</Typography>
      {stats.byDepartment.map(dept => (
        <Card key={dept.name} variant="flat" style={styles.deptStatRow}>
          <Typography weight="600">{dept.name}</Typography>
          <Badge label={`${dept.count} Waiting`} />
        </Card>
      ))}
      <Button title="Reset Entire Queue" variant="danger" onPress={handleReset} style={{ marginTop: spacing.l }} icon={<Ionicons name="refresh" size={18} color={colors.surface} />} />
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

  return (
    <Layout>
      <Header title="Admin Dashboard" showBack />
      <View style={styles.tabBar}>
        {renderTabButton('Overview')}{renderTabButton('Doctors')}{renderTabButton('Queue')}{renderTabButton('QR Codes')}
      </View>
      <View style={styles.main}>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Queue' && renderQueue()}
        {activeTab === 'Doctors' && <Typography align="center" style={{marginTop: 50}}>Doctor Management Panel</Typography>}
        {activeTab === 'QR Codes' && <Typography align="center" style={{marginTop: 50}}>QR Generation Panel</Typography>}
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
});
