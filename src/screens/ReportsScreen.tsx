import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { adminService } from '../services/adminService';

export const ReportsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: { totalPatients: 0, waitingTime: '0m', activeDepartments: 0 },
    deptWise: [] as any[]
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      if (res.data && res.data.data) {
        const statsData = res.data.data;
        setStats({
          today: {
            totalPatients: statsData.today?.totalPatients || 0,
            waitingTime: statsData.today?.avgWaitTime || '0m',
            activeDepartments: statsData.today?.activeDepartments || 0
          },
          deptWise: statsData.deptWise || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Reports & Analytics" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.summaryRow}>
          <Card style={styles.summaryBox}>
            <Typography variant="h2" color={colors.accent}>{stats.today.totalPatients}</Typography>
            <Typography variant="caption">Total Patients (Today)</Typography>
          </Card>
          <Card style={styles.summaryBox}>
            <Typography variant="h2" color={colors.success}>{stats.today.waitingTime}</Typography>
            <Typography variant="caption">Avg. Waiting Time</Typography>
          </Card>
        </View>

        <Typography variant="h4" style={styles.sectionTitle}>Department Traffic</Typography>
        <Card style={styles.chartPlaceholder}>
          <View style={{ height: 150, backgroundColor: colors.lightAccent, borderRadius: borderRadius.m, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="bar-chart" size={48} color={colors.accent} />
            <Typography variant="caption" color={colors.textSecondary}>[ Analytics Visualization Placeholder ]</Typography>
          </View>
          <View style={styles.chartDetails}>
            <View style={styles.chartLegend}><View style={[styles.dot, {backgroundColor: colors.accent}]} /><Typography variant="caption">Cardiology (45%)</Typography></View>
            <View style={styles.chartLegend}><View style={[styles.dot, {backgroundColor: colors.success}]} /><Typography variant="caption">Pediatrics (30%)</Typography></View>
            <View style={styles.chartLegend}><View style={[styles.dot, {backgroundColor: colors.warning}]} /><Typography variant="caption">Others (25%)</Typography></View>
          </View>
        </Card>

        <Typography variant="h4" style={styles.sectionTitle}>Doctor Workload</Typography>
        {stats.deptWise.length > 0 ? stats.deptWise.map((item, i) => (
          <Card key={i} variant="flat" style={styles.workloadRow}>
            <View style={{ flex: 1 }}>
              <Typography weight="600">{item.name}</Typography>
              <Typography variant="caption" color={colors.textSecondary}>{item.count} Patients Served</Typography>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '60%', backgroundColor: colors.accent }]} />
            </View>
          </Card>
        )) : (
          <Typography align="center" color={colors.muted} style={{ marginTop: 20 }}>No clinical data available for today</Typography>
        )}

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.m },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.l },
  summaryBox: { width: (width - spacing.m * 3) / 2, padding: spacing.m, alignItems: 'center' },
  sectionTitle: { marginBottom: spacing.m, marginTop: spacing.s },
  chartPlaceholder: { padding: spacing.m, ...shadows.soft },
  chartDetails: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.m },
  chartLegend: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  workloadRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, marginBottom: spacing.s },
  progressTrack: { width: 100, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%' }
});
