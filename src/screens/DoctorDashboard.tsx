import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
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
    callNextInDepartment, 
    skipPatient 
  } = useQueue();
  const { logout, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Doctors are strictly locked to their assigned department from AuthContext
  const deptId = user?.doctorInfo?.departmentId;
  const deptName = user?.doctorInfo?.departmentName || 'General Unit';
  const hospitalName = user?.doctorInfo?.hospitalName || 'Clinical Facility';
  const docId = user?.doctorInfo?.docId || 'ID-PENDING';

  const queueList = useMemo(() => 
    tokens.filter(t => t.department.id === deptId && (t.status === 'waiting' || t.status === 'current')),
    [tokens, deptId]
  );

  const currentPatient = useMemo(() => 
    queueList.find(t => t.status === 'current'),
    [queueList]
  );

  const handleNext = async () => {
    try {
      if (!deptId) return;
      setRefreshing(true);
      const next = await callNextInDepartment(deptId);
      if (!next) {
        Alert.alert('Queue Empty', 'All patients in your department have been served.');
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

  const handleRecall = () => {
    if (!currentPatient) return;
    Alert.alert('Recalling Patient', `Re-announcing Token ${currentPatient.queue_number} for ${currentPatient.patient_name}.`);
    // In a real system, this might trigger a specific socket event for a voice announcement system
  };

  const renderQueueItem = ({ item }: { item: any }) => (
    <View style={[styles.queueItem, item.status === 'current' && styles.activeItem]}>
      <Typography variant="h3" color={item.status === 'current' ? colors.primary : colors.muted} style={styles.tokenNo}>
        #{item.queue_number}
      </Typography>
      <View style={styles.itemInfo}>
        <Typography variant="body" weight="600">{item.patient_name}</Typography>
        {item.status === 'current' ? (
          <Typography variant="caption" color={colors.primary} weight="700">CURRENTLY IN ROOM</Typography>
        ) : (
          <Typography variant="caption" color={colors.muted}>Waiting in Hallway</Typography>
        )}
      </View>
      {item.status === 'current' && <Badge label="SERVING" variant="success" />}
    </View>
  );

  return (
    <Layout>
      <View style={styles.header}>
        <View>
          <Typography variant="h2" weight="800" color={colors.surface}>{user?.name}</Typography>
          <Typography variant="caption" weight="600" color="rgba(255,255,255,0.7)">
            {hospitalName.toUpperCase()} • ID: {docId}
          </Typography>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.main}>
        {/* Department Lock Indicator */}
        <View style={styles.deptLock}>
          <Ionicons name="lock-closed" size={12} color={colors.primary} />
          <Typography variant="caption" weight="800" color={colors.primary} style={{ marginLeft: 6 }}>
            LOCKED TO: {deptName.toUpperCase()} QUEUE
          </Typography>
        </View>

        {/* Status Section */}
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Typography variant="h2" color={colors.primary}>{queueList.filter(t => t.status === 'waiting').length}</Typography>
            <Typography variant="caption">Total Waiting</Typography>
          </Card>
          <Card style={styles.statBox}>
            <Typography variant="h2" color={colors.accent}>{currentPatient ? '1' : '0'}</Typography>
            <Typography variant="caption">Active Patient</Typography>
          </Card>
        </View>

        {/* Current Active Patient Card */}
        <Card variant="premium" style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">NOW SERVING</Typography>
            <TouchableOpacity onPress={handleRecall} disabled={!currentPatient}>
              <View style={styles.recallTag}>
                <Ionicons name="volume-high" size={14} color="#fff" />
                <Typography variant="caption" weight="700" color="#fff" style={{ marginLeft: 4 }}>RECALL</Typography>
              </View>
            </TouchableOpacity>
          </View>
          <Typography variant="h1" color={colors.surface} align="center" style={styles.currentToken}>
            {currentPatient?.queue_number || '---'}
          </Typography>
          <Typography variant="h3" color={colors.surface} align="center" style={styles.currentName}>
            {currentPatient?.patient_name || 'No Patient Active'}
          </Typography>
        </Card>

        {/* Main Controls - THE ENGINE */}
        <View style={styles.controls}>
          <Button 
            title="NEXT PATIENT" 
            onPress={handleNext} 
            variant="primary" 
            style={styles.nextBtn}
            size="large"
            icon="arrow-forward-circle"
            iconPosition="right"
            loading={refreshing}
          />
          <Button 
            title="SKIP" 
            onPress={handleSkip} 
            variant="outline" 
            style={styles.skipBtn}
            icon="play-skip-forward"
            disabled={!currentPatient}
          />
        </View>

        {/* Simplified Queue List */}
        <View style={styles.listHeader}>
          <Typography variant="h4" weight="700">Upcoming Sequence</Typography>
          <Typography variant="caption" color={colors.muted}>{queueList.length} total tokens</Typography>
        </View>

        <FlatList
          data={queueList}
          renderItem={renderQueueItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="medical-outline" size={48} color={colors.border} />
              <Typography color={colors.muted} style={{ marginTop: spacing.s }}>
                Clinical queue is clear
              </Typography>
            </View>
          }
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadows.medium
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12
  },
  main: { flex: 1, padding: spacing.m },
  deptLock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightAccent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.s,
    marginBottom: spacing.m
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 20
  },
  currentCard: { 
    padding: spacing.l, 
    borderRadius: 24, 
    marginBottom: spacing.m,
    ...shadows.medium,
  },
  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  currentToken: { fontSize: 80, fontWeight: '900', marginVertical: -10 },
  currentName: { opacity: 0.9 },
  controls: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  nextBtn: { 
    flex: 2.5,
    height: 70, 
    borderRadius: 18, 
    backgroundColor: colors.primary,
  },
  skipBtn: {
    flex: 1,
    height: 70,
    borderRadius: 18,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  list: { paddingBottom: spacing.xl },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.s,
    ...shadows.soft
  },
  activeItem: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.lightAccent
  },
  tokenNo: { width: 70, fontSize: 20, fontWeight: '800' },
  itemInfo: { flex: 1 },
  empty: { alignItems: 'center', marginTop: spacing.xxl, opacity: 0.4 },
});

