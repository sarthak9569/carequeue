import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList,
  Alert
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

export const LeaveManagementScreen: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLeaves();
      if (res.data && res.data.data) setLeaves(res.data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await adminService.updateLeaveStatus(id, status);
      fetchLeaves();
      Alert.alert('Success', `Leave ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    }
  };

  return (
    <Layout>
      <Header title="Leave Requests" showBack />
      <View style={styles.container}>
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          refreshing={loading}
          onRefresh={fetchLeaves}
          renderItem={({ item }) => (
            <Card style={styles.leaveCard}>
              <View style={styles.leaveHeader}>
                <Typography weight="700">{item.applicant?.name || 'Medical Staff'}</Typography>
                <Badge label={item.status} variant={item.status === 'Approved' ? 'success' : (item.status === 'Rejected' ? 'danger' : 'warning')} />
              </View>
              <Typography variant="body" style={{ marginVertical: 8 }}>{item.reason}</Typography>
              <Typography variant="caption" color={colors.textSecondary}>Requested for: {new Date(item.leaveDate).toLocaleDateString()}</Typography>
              
              {item.status === 'Pending' && (
                <View style={styles.actions}>
                  <Button 
                    title="Reject" 
                    variant="outline" 
                    size="small" 
                    onPress={() => updateStatus(item._id, 'Rejected')}
                    style={{ flex: 1, marginRight: 8, borderColor: colors.danger }} 
                  />
                  <Button 
                    title="Approve" 
                    size="small" 
                    onPress={() => updateStatus(item._id, 'Approved')}
                    style={{ flex: 1, backgroundColor: colors.success }} 
                  />
                </View>
              )}
            </Card>
          )}
          ListEmptyComponent={<Typography align="center" style={{ marginTop: 40 }}>No leave applications found.</Typography>}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.m },
  leaveCard: { padding: spacing.m, marginBottom: spacing.m, ...shadows.soft },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', marginTop: spacing.m },
});
