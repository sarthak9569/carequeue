import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { stats } = useQueue();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <Layout>
      <View style={styles.topHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View>
              <Typography variant="h2" style={styles.welcomeText}>Welcome back,</Typography>
              <Typography variant="h3" color={colors.surface}>{user?.name}</Typography>
            </View>
            <TouchableOpacity 
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings' as any)}
            >
              <Ionicons name="settings-outline" size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Typography variant="body" color="#cbd5e1" style={styles.subtext}>The clinical sanctuary is prepared. Manage your patient flow with precision and tranquility today.</Typography>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {/* Main Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="premium" style={styles.mainStatCard}>
            <View style={styles.statIconBadge}>
              <Ionicons name="people" size={20} color={colors.accent} />
            </View>
            <View>
              <Typography variant="caption" weight="600" color="#94a3b8">LIVE QUEUE</Typography>
              <View style={styles.statValueRow}>
                <Typography variant="h2" color={colors.surface}>{stats.waiting}</Typography>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.mainStatCard}>
            <View style={styles.statIconBadgeAccent}>
              <Ionicons name="checkmark-done" size={20} color={colors.success} />
            </View>
            <View>
              <Typography variant="caption" weight="600" color={colors.muted}>COMPLETED</Typography>
              <View style={styles.statValueRow}>
                <Typography variant="h2" color={colors.primary}>{stats.completed}</Typography>
              </View>
            </View>
          </Card>
        </View>

        {/* Analytics Card */}
        <Card style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Typography variant="h3" color={colors.primary}>Real-time Analytics</Typography>
            <Ionicons name="analytics-outline" size={20} color={colors.muted} />
          </View>
          
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Typography variant="caption" weight="600" color={colors.muted}>AVG CONSULTATION TIME</Typography>
              <Typography variant="h2">14<Typography variant="body" color={colors.muted}>m</Typography></Typography>
              <Typography variant="caption" color={colors.muted}>Optimal Range</Typography>
            </View>
            <View style={styles.analyticsDivider} />
            <View style={styles.analyticsItem}>
              <Typography variant="caption" weight="600" color={colors.muted}>CURRENT SYSTEM LOAD</Typography>
              <Typography variant="h2" color={colors.danger}>High</Typography>
              <Typography variant="caption" color={colors.muted}>8 departments active</Typography>
            </View>
          </View>

          <View style={styles.resourceUsageRow}>
            <Typography variant="caption" weight="600" color={colors.muted}>RESOURCE USAGE</Typography>
            <Typography variant="caption" weight="700" color={colors.primary}>82%</Typography>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '82%' }]} />
          </View>
        </Card>

        {/* Action Card */}
        <Card variant="premium" style={styles.actionCard}>
          <View style={styles.actionIconCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={40} color={colors.accent} />
          </View>
          <Typography variant="h2" align="center" color={colors.surface} style={styles.actionTitle}>Begin Your Consultation</Typography>
          <Typography variant="body" align="center" color="#94a3b8" style={styles.actionSubtitle}>
            Step into the live clinical flow. Select your specialty and receive your medical token instantly.
          </Typography>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => navigation.navigate('JoinQueue' as any)}
          >
            <Typography variant="button" color={colors.surface}>Get Medical Token</Typography>
            <Ionicons name="arrow-forward" size={18} color={colors.surface} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Card>

        {/* Patient Satisfaction */}
        <Card style={styles.satisfactionCard}>
          <View style={styles.satisfactionHeader}>
            <View style={styles.satisfactionIcon}>
              <Ionicons name="trending-up" size={20} color={colors.accent} />
            </View>
            <View>
              <Typography variant="caption" weight="600" color={colors.muted}>PATIENT SATISFACTION</Typography>
              <Typography variant="h2">98% <Typography variant="caption" color={colors.success}>Record High</Typography></Typography>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xxl },
  topHeader: {
    paddingTop: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    padding: spacing.l,
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  subtext: {
    lineHeight: 20,
    maxWidth: '85%',
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: spacing.m,
  },
  mainStatCard: {
    width: '48%',
    padding: spacing.m,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: spacing.s,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconBadgeAccent: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  percentChange: {
    fontSize: 10,
    fontWeight: '700',
  },
  analyticsCard: {
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  analyticsItem: {
    flex: 1,
  },
  analyticsDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.m,
  },
  resourceUsageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  actionCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.m,
    borderRadius: 24,
  },
  actionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(14, 165, 160, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 160, 0.3)',
  },
  actionTitle: {
    marginBottom: spacing.s,
    fontWeight: '800',
  },
  actionSubtitle: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    lineHeight: 22,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 14,
    ...shadows.accent,
  },
  satisfactionCard: {
    padding: spacing.m,
  },
  satisfactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  satisfactionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.m,
    backgroundColor: colors.lightAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
