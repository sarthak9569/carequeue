import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useQueue } from '../context/QueueContext';

export const TokenHistoryScreen: React.FC = () => {
  const { tokens } = useQueue();
  
  // Filter for completed or past tokens
  const history = tokens.filter(t => t.status === 'completed' || t.status === 'waiting');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'waiting': return colors.warning;
      case 'current': return colors.accent;
      default: return colors.muted;
    }
  };

  const renderTokenItem = ({ item }: { item: any }) => (
    <Card style={styles.tokenCard}>
      <View style={styles.tokenHeader}>
        <View style={styles.tokenNumberArea}>
          <Typography variant="h3" color={colors.primary}>{item.queue_number}</Typography>
          <Typography variant="caption" color={colors.muted}>{item.department.name}</Typography>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Typography variant="caption" weight="700" color={getStatusColor(item.status)}>
            {item.status.toUpperCase()}
          </Typography>
        </View>
      </View>
      
      <View style={styles.tokenFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.muted} />
          <Typography variant="caption" color={colors.muted} style={{ marginLeft: 4 }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </View>
        <TouchableOpacity>
          <Typography variant="caption" weight="700" color={colors.accent}>VIEW DETAILS</Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <Layout>
      <View style={styles.header}>
        <Typography variant="h2" weight="800" color={colors.primary}>Token History</Typography>
        <Typography variant="body" color={colors.muted}>Review your past clinical visits and status updates.</Typography>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderTokenItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="time-outline" size={48} color={colors.muted} />
            </View>
            <Typography variant="h3" color={colors.muted}>No History Found</Typography>
            <Typography variant="body" align="center" color={colors.muted} style={{ marginTop: spacing.s }}>
              Once you complete a clinical visit, your records will appear here.
            </Typography>
          </View>
        }
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing.m,
    paddingTop: spacing.l,
    backgroundColor: colors.surface,
  },
  list: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  tokenCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  tokenNumberArea: {
    gap: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
  },
  tokenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
});
