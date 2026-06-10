import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList,
  Modal,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/StatusUI';
import { colors, spacing, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

import { adminService } from '../services/adminService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ScheduleManagementScreen: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    doctor: '', 
    workingDays: [] as string[],
    startTime: '09:00',
    endTime: '17:00'
  });

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSchedules();
      if (res.data && res.data.data) setSchedules(res.data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const updated = form.workingDays.includes(day) 
      ? form.workingDays.filter(d => d !== day)
      : [...form.workingDays, day];
    setForm({...form, workingDays: updated});
  };

  return (
    <Layout>
      <Header title="Staff Schedules" showBack />
      <View style={styles.container}>
        <View style={styles.actionHeader}>
          <Typography variant="h3">Active Rosters</Typography>
          <Button title="Set Schedule" size="small" onPress={() => setShowModal(true)} />
        </View>

        <FlatList
          data={schedules}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.schedCard}>
              <View style={{ flex: 1 }}>
                <Typography weight="700">{item.doctor?.name || 'Assigned Staff'}</Typography>
                <View style={styles.dayGrid}>
                  {DAYS.map(d => (
                    <Typography key={d} variant="caption" color={item.workingDays?.includes(d) ? colors.accent : colors.muted} style={{ marginRight: 4 }}>{d}</Typography>
                  ))}
                </View>
              </View>
              <Typography variant="caption" weight="600">{item.startTime} - {item.endTime}</Typography>
            </Card>
          )}
        />

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Typography variant="h3" style={{ marginBottom: spacing.l }}>Define Roster</Typography>
              <Typography variant="caption" weight="600" style={{ marginBottom: 8 }}>SELECT WORKING DAYS</Typography>
              <View style={styles.dayPicker}>
                {DAYS.map(day => (
                  <TouchableOpacity key={day} style={[styles.dayItem, form.workingDays.includes(day) && styles.dayActive]} onPress={() => toggleDay(day)}>
                    <Typography variant="caption" color={form.workingDays.includes(day) ? colors.surface : colors.text}>{day}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <Button title="Cancel" variant="outline" style={{ flex: 1, marginRight: spacing.s }} onPress={() => setShowModal(false)} />
                <Button title="Confirm" style={{ flex: 1 }} onPress={() => { setShowModal(false); Alert.alert('Success', 'Schedule updated'); }} />
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.m },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.l },
  schedCard: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.m, marginBottom: spacing.s, alignItems: 'center' },
  dayGrid: { flexDirection: 'row', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.m },
  modalContent: { padding: spacing.xl, borderRadius: 24 },
  modalButtons: { flexDirection: 'row', marginTop: spacing.l },
  dayPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.m },
  dayItem: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  dayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
});
