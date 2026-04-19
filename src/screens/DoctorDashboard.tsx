import React, { useState, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { Toast, ToastHandle } from '../components/Toast';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { useQueue } from '../context/QueueContext';

export const DoctorDashboard: React.FC = () => {
  const { tokens, updateTokenStatus, callNextInDepartment } = useQueue();
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const toastRef = useRef<ToastHandle>(null);

  const waitingList = useMemo(() => 
    tokens.filter(t => t.department.id === selectedDept.id && t.status === 'waiting'),
    [tokens, selectedDept]
  );

  const nowServing = useMemo(() => 
    tokens.find(t => t.department.id === selectedDept.id && t.status === 'current'),
    [tokens, selectedDept]
  );

  const handleMarkComplete = async () => {
    if (!nowServing) return;
    try {
      await updateTokenStatus(nowServing.id, 'completed');
      toastRef.current?.show(`${nowServing.patient_name} marked as complete`);
    } catch (e) { Alert.alert('Error', 'Failed to mark complete'); }
  };

  const handleCallNext = async () => {
    try {
      const next = await callNextInDepartment(selectedDept.id);
      if (next) {
        toastRef.current?.show(`Calling patient ${next.queue_number}: ${next.patient_name}`);
      } else {
        Alert.alert('Queue Empty', `No waiting patients for ${selectedDept.name}`);
      }
    } catch (e) { Alert.alert('Error', 'Failed to call next'); }
  };

  const renderWaitingItem = ({ item }: { item: any }) => (
    <Card variant="flat" style={styles.patientRow}>
      <View style={styles.patientHeader}>
        <View>
          <Typography variant="body" weight="600">{item.patient_name}</Typography>
          <Typography variant="h3" color={colors.primary}>{item.queue_number}</Typography>
        </View>
        <Badge label={item.source.toUpperCase()} variant="info" />
      </View>
      <View style={styles.patientFooter}>
        <Typography variant="caption" color={colors.textSecondary}>
          <Ionicons name="time-outline" size={12} /> {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>{item.department.name}</Typography>
      </View>
    </Card>
  );

  return (
    <Layout>
      <Header title="Doctor Console" showBack
        rightElement={
          <TouchableOpacity onPress={() => setShowDeptModal(true)} style={styles.deptSelector}>
            <Typography variant="caption" weight="600" color={colors.surface}>{selectedDept.name}</Typography>
            <Ionicons name="chevron-down" size={16} color={colors.surface} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.main}>
        <Typography variant="h4" style={styles.sectionTitle}>Currently Serving</Typography>
        {nowServing ? (
          <Card style={styles.servingCard}>
            <View style={styles.servingHeader}>
              <View>
                <Typography variant="h1" color={colors.primary}>{nowServing.queue_number}</Typography>
                <Typography variant="h3">{nowServing.patient_name}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{nowServing.department.name}</Typography>
              </View>
              <Badge label="IN PROGRESS" variant="success" />
            </View>
            <Button title="Mark Complete" onPress={handleMarkComplete} variant="primary" style={styles.actionBtn} />
          </Card>
        ) : (
          <Card style={styles.emptyServing}>
            <Ionicons name="person-outline" size={48} color={colors.border} />
            <Typography color={colors.textSecondary} style={{ marginVertical: spacing.s }}>No patient currently being served</Typography>
            <Button title="Call Next Patient" onPress={handleCallNext} variant="secondary" icon={<Ionicons name="play-circle" size={20} color={colors.surface} />} />
          </Card>
        )}

        <View style={styles.listHeader}>
          <Typography variant="h4">Waiting Queue</Typography>
          <Typography variant="caption" color={colors.textSecondary}>{waitingList.length} patients</Typography>
        </View>

        <FlatList
          data={waitingList}
          renderItem={renderWaitingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<View style={styles.emptyList}><Typography color={colors.textSecondary}>All clear for {selectedDept.name}</Typography></View>}
        />
      </View>
      <Toast ref={toastRef} />
      <Modal visible={showDeptModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Typography variant="h3" style={{ marginBottom: spacing.m }}>Select Department</Typography>
            <ScrollView style={{ maxHeight: 300 }}>
              {DEPARTMENTS.map(dept => (
                <TouchableOpacity key={dept.id} style={styles.deptOption} onPress={() => { setSelectedDept(dept); setShowDeptModal(false); }}>
                  <Typography weight={selectedDept.id === dept.id ? 'bold' : 'normal'}>{dept.name}</Typography>
                  {selectedDept.id === dept.id && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Cancel" variant="ghost" onPress={() => setShowDeptModal(false)} />
          </Card>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, padding: spacing.m },
  deptSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 4 },
  sectionTitle: { marginBottom: spacing.m },
  servingCard: { marginBottom: spacing.l, padding: spacing.l, borderLeftWidth: 5, borderLeftColor: colors.success },
  servingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.l },
  emptyServing: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, marginBottom: spacing.l, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.m },
  listContainer: { paddingBottom: spacing.xl },
  patientRow: { marginBottom: spacing.s, padding: spacing.m },
  patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  patientFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.s, paddingTop: spacing.s, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { width: '100%' },
  emptyList: { alignItems: 'center', marginTop: spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { maxHeight: '70%' },
  deptOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.m, borderBottomWidth: 1, borderBottomColor: colors.border },
});
