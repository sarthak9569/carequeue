import React, { useMemo, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { 
    tokens, 
    updateTokenStatus, 
    departments, 
    callNextInDepartment, 
    skipPatient 
  } = useQueue();
  const { logout } = useAuth();
  
  // Assume doctor is assigned to a specific department (mocked as ID '1' for now)
  const [deptId] = useState('1'); 
  const [refreshing, setRefreshing] = useState(false);
  const currentDept = departments.find(d => d.id === deptId) || { name: 'Clinical Unit' };

  const queueList = useMemo(() => 
    tokens.filter(t => t.department.id === deptId && (t.status === 'waiting' || t.status === 'current')),
    [tokens, deptId]
  );

  const currentPatient = useMemo(() => 
    queueList.find(t => t.status === 'current'),
    [queueList]
  );

  const waitingQueue = useMemo(() => 
    queueList.filter(t => t.status === 'waiting'),
    [queueList]
  );

  const handleNext = async () => {
    try {
      setRefreshing(true);
      const next = await callNextInDepartment(deptId);
      if (!next) {
        Alert.alert('Queue Empty', 'No more patients waiting in your unit.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to advance queue');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSkip = async () => {
    if (!currentPatient) return;
    try {
      setRefreshing(true);
      await skipPatient(currentPatient.id);
    } catch (e) {
      Alert.alert('Error', 'Failed to skip patient');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // QueueContext automatically re-fetches if fetchInitialData is called
    // For now, we'll assume the socket handles it, but manual refresh is good
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderQueueItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.queueItem, item.status === 'current' && styles.activeItem]}>
      <Typography variant="h3" color={item.status === 'current' ? colors.primary : colors.muted} style={styles.tokenNo}>
        {item.queue_number}
      </Typography>
      <View style={styles.itemInfo}>
        <Typography variant="body" weight="600">{item.patient_name}</Typography>
        {item.status === 'current' && <Typography variant="caption" color={colors.accent}>← Current Patient</Typography>}
      </View>
      {item.status === 'current' && <Badge label="SERVING" variant="success" />}
    </View>
  );

  return (
    <Layout>
      <Header 
        title="Doctor Dashboard" 
        rightElement={
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.main}>
        {/* Unit Info */}
        <Typography variant="caption" weight="800" color={colors.muted} style={styles.unitLabel}>
          ASSIGNED UNIT: {currentDept.name.toUpperCase()}
        </Typography>

        {/* Current Serving Card */}
        <Card variant="premium" style={styles.currentCard}>
          <Typography variant="caption" color="rgba(255,255,255,0.7)" align="center">NOW SERVING TOKEN</Typography>
          <Typography variant="h1" color={colors.surface} align="center" style={styles.currentToken}>
            {currentPatient?.queue_number || '---'}
          </Typography>
          {currentPatient && (
            <Typography variant="h3" color={colors.surface} align="center" style={{ marginTop: -10 }}>
              {currentPatient.patient_name}
            </Typography>
          )}
        </Card>

        {/* Restricted Actions */}
        <View style={styles.actionRow}>
          <Button 
            title="NEXT" 
            onPress={handleNext} 
            variant="primary" 
            style={styles.nextBtn}
            icon="arrow-forward-circle"
            iconPosition="right"
          />
          <Button 
            title="SKIP" 
            onPress={handleSkip} 
            variant="secondary" 
            style={styles.skipBtn}
            icon="play-skip-forward"
            disabled={!currentPatient}
          />
        </View>

        {/* Queue List */}
        <Typography variant="h4" style={styles.listTitle}>Upcoming Appointments</Typography>
        <FlatList
          data={queueList}
          renderItem={renderQueueItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.border} />
              <Typography color={colors.muted}>No patients in queue</Typography>
            </View>
          }
        />

        {/* Footer info showing restriction */}
        <View style={styles.restrictionInfo}>
          <Ionicons name="lock-closed" size={14} color={colors.muted} />
          <Typography variant="caption" color={colors.muted} style={{ marginLeft: 6 }}>
            Read-only clinical view. Admin privileges restricted.
          </Typography>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, padding: spacing.m },
  unitLabel: { marginBottom: spacing.m, letterSpacing: 1 },
  currentCard: { 
    padding: spacing.xl, 
    borderRadius: 24, 
    marginBottom: spacing.l,
    ...shadows.medium,
  },
  currentToken: { fontSize: 64, fontWeight: '800' },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  nextBtn: { 
    flex: 2,
    height: 60, 
    borderRadius: 14, 
    backgroundColor: colors.accent,
  },
  skipBtn: {
    flex: 1,
    height: 60,
    borderRadius: 14,
  },
  listTitle: { marginBottom: spacing.m },
  list: { paddingBottom: spacing.xxl },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: '#fff',
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeItem: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(14, 165, 160, 0.05)',
    borderWidth: 2,
  },
  tokenNo: { width: 80, fontSize: 22 },
  itemInfo: { flex: 1 },
  empty: { alignItems: 'center', marginTop: spacing.xl, opacity: 0.5 },
  restrictionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
});
