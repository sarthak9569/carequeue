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
  const [discoveryData, setDiscoveryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setRefreshing(true);
      const [hospRes, discRes] = await Promise.all([
        apiService.getHospitals(),
        apiService.getDiscoveryData()
      ]);
      
      if (hospRes.data && hospRes.data.data) setHospitals(hospRes.data.data);
      if (discRes.data && discRes.data.data) setDiscoveryData(discRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await apiService.getHospitals({
        search: searchQuery,
        pincode: pincode,
        city: selectedCity || undefined,
        department: selectedSpecialty || undefined
      });
      if (res.data && res.data.data) {
        setHospitals(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pincode, selectedCity, selectedSpecialty]);

  const onRefresh = async () => {
    setSelectedCity(null);
    setSelectedSpecialty(null);
    setSearchQuery('');
    setPincode('');
    await fetchInitialData();
  };

  const SPECIALTIES = [
    { name: 'Cardiology', icon: 'heart-pulse', color: '#ef4444' },
    { name: 'Pediatrics', icon: 'baby-face-outline', color: '#3b82f6' },
    { name: 'Orthopedics', icon: 'bone', color: '#8b5cf6' },
    { name: 'Dentist', icon: 'tooth-outline', color: '#f59e0b' },
    { name: 'ENT', icon: 'ear-hearing', color: '#10b981' },
    { name: 'Neurology', icon: 'brain', color: '#8b5cf6' }
  ];

  return (
    <Layout>
      <View style={styles.topHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View>
              <Typography variant="caption" color="rgba(255,255,255,0.7)" weight="700">CLINICAL DISCOVERY</Typography>
              <Typography variant="h2" style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}</Typography>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerIconBtn}
                onPress={() => navigation.navigate('Settings' as any)}
              >
                <Ionicons name="settings-outline" size={22} color={colors.surface} />
              </TouchableOpacity>
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
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <Input 
                placeholder="Name or specialty..."
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
        {/* City Discovery Tiles */}
        <View style={styles.discoverySection}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Discover by City</Typography>
            {selectedCity && (
              <TouchableOpacity onPress={() => setSelectedCity(null)}>
                <Typography variant="caption" color={colors.accent} weight="700">Clear City</Typography>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {discoveryData.map(item => (
              <TouchableOpacity 
                key={item._id} 
                style={[styles.cityTile, selectedCity === item._id && styles.cityTileActive]}
                onPress={() => setSelectedCity(selectedCity === item._id ? null : item._id)}
              >
                <Card style={[styles.cityCard, selectedCity === item._id && { backgroundColor: colors.accent }]}>
                  <MaterialCommunityIcons 
                    name="city-variant-outline" 
                    size={24} 
                    color={selectedCity === item._id ? colors.surface : colors.accent} 
                  />
                  <Typography 
                    variant="body" 
                    weight="700" 
                    color={selectedCity === item._id ? colors.surface : colors.text}
                    style={{ marginTop: 8 }}
                  >
                    {item._id}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={selectedCity === item._id ? 'rgba(255,255,255,0.8)' : colors.muted}
                  >
                    {item.count} Hospitals
                  </Typography>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Clinical Specialties Filter */}
        <View style={styles.specialtySection}>
          <Typography variant="h3" style={styles.sectionTitle}>Browse Specialties</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
            {SPECIALTIES.map((item) => (
              <TouchableOpacity 
                key={item.name} 
                style={styles.specialtyItemH} 
                onPress={() => setSelectedSpecialty(selectedSpecialty === item.name ? null : item.name)}
              >
                <Card style={[styles.specialtyCardH, selectedSpecialty === item.name && styles.specialtyCardActive]}>
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={26} 
                    color={selectedSpecialty === item.name ? colors.surface : item.color} 
                  />
                  <Typography 
                    variant="caption" 
                    weight="700" 
                    color={selectedSpecialty === item.name ? colors.surface : colors.text}
                    style={{ marginTop: 4 }}
                  >
                    {item.name}
                  </Typography>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hospital Listings */}
        <View style={styles.listingSection}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              {selectedCity || selectedSpecialty ? 'Filtered Results' : 'Registered Facilities'}
            </Typography>
            <Badge label={`${hospitals.length} FOUND`} variant="info" />
          </View>
          
          <View style={styles.hospitalGrid}>
            {hospitals.length > 0 ? hospitals.map((hosp) => (
              <TouchableOpacity 
                key={hosp._id} 
                style={styles.hospitalGridItem}
                onPress={() => navigation.navigate('JoinQueue', { hospitalId: hosp._id })}
              >
                <Card style={styles.hospitalGridCard}>
                  <View style={styles.hospIconLarge}>
                    <MaterialCommunityIcons name="hospital-building" size={32} color={colors.accent} />
                  </View>
                  <View style={styles.hospInfo}>
                    <Typography weight="800" numberOfLines={1}>{hosp.name}</Typography>
                    <Typography variant="caption" color={colors.muted} numberOfLines={1}>
                      <Ionicons name="location-outline" size={12} /> {hosp.city}, {hosp.pincode}
                    </Typography>
                    <View style={styles.hospBadge}>
                      <Typography variant="caption" color={colors.accent} weight="700">VIEW QUEUE</Typography>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="hospital-marker" size={60} color={colors.border} />
                <Typography variant="body" color={colors.muted} style={{ marginTop: spacing.m }}>
                  No hospitals match your search criteria.
                </Typography>
              </View>
            )}
          </View>
        </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
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
  discoverySection: {
    marginBottom: spacing.l,
  },
  cityScroll: {
    marginHorizontal: -spacing.m,
    paddingHorizontal: spacing.m,
  },
  cityTile: {
    marginRight: spacing.m,
  },
  cityTileActive: {
    transform: [{ scale: 1.05 }],
  },
  cityCard: {
    width: 140,
    padding: spacing.m,
    borderRadius: 20,
    alignItems: 'center',
    ...shadows.soft,
  },
  specialtySection: {
    marginBottom: spacing.l,
  },
  specialtyScroll: {
    marginHorizontal: -spacing.m,
    paddingHorizontal: spacing.m,
  },
  specialtyItemH: {
    marginRight: spacing.s,
  },
  specialtyCardH: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
    flexDirection: 'column',
    ...shadows.soft,
  },
  specialtyCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  hospitalGrid: {
    marginTop: spacing.s,
  },
  hospitalGridItem: {
    marginBottom: spacing.m,
  },
  hospitalGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 20,
    ...shadows.soft,
  },
  hospIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.lightAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  hospInfo: {
    flex: 1,
  },
  hospBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(14, 165, 160, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  listingSection: {
    marginBottom: spacing.l,
  },
});
