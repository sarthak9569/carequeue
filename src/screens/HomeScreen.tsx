import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { RootStackParamList, TabParamList } from '../navigation/RootNavigator';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Input } from '../components/Input';
import { Badge } from '../components/StatusUI';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & TabParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { tokens, stats } = useQueue();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');

  // Get active tokens for the current user
  const activeTokens = tokens.filter(t => t.status === 'waiting' || t.status === 'current');

  React.useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await apiService.getHospitals();
      if (res.data && res.data.data) {
        setHospitals(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHospitals();
    setRefreshing(false);
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchName = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPincode = pincode ? h.pincode?.includes(pincode) : true;
    return matchName && matchPincode;
  });

  return (
    <Layout>
      <View style={styles.topHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View>
              <Typography variant="caption" color="rgba(255,255,255,0.7)" weight="700">CITY SANCTUARY</Typography>
              <Typography variant="h2" style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}</Typography>
            </View>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile' as any)}
            >
              <Image 
                source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5a0&color=fff` }} 
                style={styles.avatarImg} 
              />
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <Input 
                placeholder="Search hospitals..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchInner}
                style={styles.searchInput}
                hideLabel
              />
            </View>
            <View style={styles.pincodeWrapper}>
              <Ionicons name="location" size={18} color={colors.accent} />
              <Input 
                placeholder="Pincode"
                value={pincode}
                onChangeText={setPincode}
                containerStyle={styles.pincodeInner}
                style={styles.searchInput}
                hideLabel
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {/* Active Tokens Quick View */}
        {activeTokens.length > 0 && (
          <View style={styles.activeSection}>
            <Typography variant="h3" style={styles.sectionTitle}>Your Active Appointments</Typography>
            {activeTokens.map(token => (
              <TouchableOpacity 
                key={token.id} 
                onPress={() => navigation.navigate('MyStatus', { queueNumber: token.queue_number, deptId: token.department.id })}
              >
                <Card variant="premium" style={styles.tokenCard}>
                  <View style={styles.tokenHeader}>
                    <Typography variant="h1" color={colors.surface}>{token.queue_number}</Typography>
                    <Badge label={token.status.toUpperCase()} variant={token.status === 'current' ? 'success' : 'warning'} />
                  </View>
                  <Typography variant="body" color="#cbd5e1" weight="600">{token.department.name}</Typography>
                  <View style={styles.tokenFooter}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">Track live position in queue</Typography>
                    <Ionicons name="chevron-forward" size={16} color={colors.surface} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.listingSection}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Registered Facilities</Typography>
            <TouchableOpacity><Typography variant="caption" color={colors.accent} weight="700">See All</Typography></TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.hospitalScroll}
            contentContainerStyle={styles.hospitalScrollContent}
          >
            {filteredHospitals.length > 0 ? filteredHospitals.map((hosp) => (
              <TouchableOpacity 
                key={hosp._id} 
                onPress={() => navigation.navigate('JoinQueue', { hospitalId: hosp._id })}
              >
                <Card style={styles.hospitalCard}>
                  <View style={styles.hospIconLarge}>
                    <MaterialCommunityIcons name="hospital-building" size={40} color={colors.accent} />
                  </View>
                  <Typography weight="800" numberOfLines={1} style={{ marginTop: spacing.s }}>{hosp.name}</Typography>
                  <Typography variant="caption" color={colors.muted}>{hosp.type || 'Private'}</Typography>
                  <View style={styles.hospBadge}>
                    <Typography variant="caption" color={colors.accent} weight="700">Join Queue</Typography>
                  </View>
                </Card>
              </TouchableOpacity>
            )) : (
              <Typography variant="caption" color={colors.muted} style={{ padding: spacing.m }}>No hospitals found in this area.</Typography>
            )}
          </ScrollView>
        </View>

        {/* Clinical Specialties */}
        <Typography variant="h3" style={[styles.sectionTitle, { marginTop: spacing.l }]}>Browse Specialties</Typography>
        <View style={styles.specialtyContainer}>
          {[
            { name: 'Cardiology', icon: 'heart-pulse', color: '#ef4444' },
            { name: 'Pediatrics', icon: 'baby-face-outline', color: '#3b82f6' },
            { name: 'Orthopedics', icon: 'bone', color: '#8b5cf6' },
            { name: 'General', icon: 'stethoscope', color: '#10b981' }
          ].map((item) => (
            <TouchableOpacity key={item.name} style={styles.specialtyItem} onPress={() => navigation.navigate('JoinQueue' as any)}>
              <Card style={styles.specialtyCard}>
                <MaterialCommunityIcons name={item.icon as any} size={30} color={item.color} />
                <Typography variant="caption" weight="700" style={{ marginTop: 8 }}>{item.name}</Typography>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall System Load */}
        <Card style={styles.statusCard}>
          <Typography variant="h4" color={colors.primary}>Sanctuary Status</Typography>
          <View style={styles.statusStats}>
            <View style={styles.statItem}>
              <Typography variant="h2">{stats.waiting + 24}</Typography>
              <Typography variant="caption" color={colors.muted}>ACTIVE PATIENTS</Typography>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Typography variant="h2">Normal</Typography>
              <Typography variant="caption" color={colors.success} weight="700">SYSTEM LOAD</Typography>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.soft,
  },
  headerContent: {
    padding: spacing.l,
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  searchBarWrapper: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.m,
    height: 56,
    ...shadows.soft,
  },
  pincodeWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.s,
    height: 56,
    ...shadows.soft,
  },
  pincodeInner: {
    flex: 1,
    borderBottomWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  searchInner: {
    flex: 1,
    borderBottomWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  searchInput: {
    fontSize: 14,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  activeSection: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  tokenCard: {
    padding: spacing.l,
    borderRadius: 20,
    marginBottom: spacing.m,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  tokenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  listingSection: {
    marginBottom: spacing.l,
  },
  hospitalScroll: {
    marginHorizontal: -spacing.m,
  },
  hospitalScrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  hospitalCard: {
    width: 180,
    padding: spacing.m,
    marginRight: spacing.m,
    alignItems: 'center',
    borderRadius: 20,
    ...shadows.soft,
  },
  hospIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  hospBadge: {
    marginTop: spacing.m,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 160, 0.1)',
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specialtyItem: {
    width: '48%',
    marginBottom: spacing.m,
  },
  specialtyCard: {
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 16,
  },
  statusCard: {
    padding: spacing.l,
    marginTop: spacing.m,
    borderRadius: 20,
  },
  statusStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
