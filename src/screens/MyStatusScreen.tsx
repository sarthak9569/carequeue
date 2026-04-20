import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { Layout } from '../components/Layout';
import { Typography } from '../components/Typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/StatusUI';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { RootStackParamList, TabParamList } from '../navigation/RootNavigator';
import { useQueue } from '../context/QueueContext';

type MyStatusRouteProp = RouteProp<TabParamList, 'MyStatus'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyStatusScreen: React.FC = () => {
  const route = useRoute<MyStatusRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { tokens } = useQueue();
  
  const [queueNum, setQueueNum] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const notifiedTurn = useRef(false);

  useEffect(() => {
    if (route.params?.queueNumber) setQueueNum(route.params.queueNumber.replace('#', ''));
    if (route.params?.deptId) setSelectedDeptId(route.params.deptId);
  }, [route.params]);

  // Sync with global tokens
  useEffect(() => {
    if (queueNum && selectedDeptId) {
      const qNum = queueNum.startsWith('#') ? queueNum : `#${queueNum}`;
      const foundToken = tokens.find(t => t.queue_number === qNum && t.department.id === selectedDeptId);
      
      if (foundToken) {
        const deptQueue = tokens.filter(t => t.department.id === selectedDeptId && t.status === 'waiting');
        const pos = deptQueue.findIndex(t => t.id === foundToken.id) + 1;
        
        const data = {
          ...foundToken,
          position: pos > 0 ? pos : 0,
          estimated_wait: (pos > 0 ? pos : 0) * 10
        };
        
        setStatusData(data);

        if (data.status === 'current') {
           Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
          ).start();
        }

        if (data.position > 0 && data.position <= 5 && !notifiedTurn.current) {
          sendLocalNotification(data.position, data.queue_number);
          notifiedTurn.current = true;
        } else if (data.position > 5) {
          notifiedTurn.current = false;
        }
      } else {
        setStatusData(null);
      }
    }
  }, [tokens, queueNum, selectedDeptId]);

  const sendLocalNotification = async (pos: number, num: string) => {
    // expo-notifications push was removed from Expo Go in SDK 53.
    // Only schedule local notifications in a real development/production build.
    if (Constants.appOwnership === 'expo') {
      console.log(`[Notification suppressed in Expo Go] Queue ${num} is ${pos} ahead.`);
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Almost Your Turn — CareQueue",
        body: `Only ${pos} patients before you! Queue ${num}. Please be ready.`,
      },
      trigger: null,
    });
  };

  const handleCheck = () => { 
    setLoading(true); 
    setTimeout(() => {
      setLoading(false);
      if (!statusData) {
        Alert.alert('Not Found', 'Queue token not found for this department.');
      }
    }, 500);
  };
  
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const getStatusBadge = () => {
    if (!statusData) return null;
    switch (statusData.status) {
      case 'current': return <Badge label="BEING CALLED" variant="success" />;
      case 'completed': return <Badge label="COMPLETED" variant="info" />;
      default: return <Badge label="WAITING" variant="warning" />;
    }
  };

  return (
    <Layout>
      <View style={styles.headerArea}>
        <Typography variant="h2" weight="800" color={colors.primary}>Clinical Status</Typography>
        <Typography variant="body" color={colors.muted}>Track your real-time position in the sanctuary flow.</Typography>
      </View>

      {loading && <LoadingSpinner fullScreen />}
      
      <ScrollView 
        contentContainerStyle={styles.container} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {!statusData ? (
          <Card style={styles.inputCard}>
            <Typography variant="h3" style={{ marginBottom: spacing.m }}>Identify Token</Typography>
            <Typography variant="caption" weight="600" color={colors.muted} style={styles.label}>Select Department</Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {DEPARTMENTS.map(dept => (
                <TouchableOpacity key={dept.id} style={[styles.chip, selectedDeptId === dept.id && styles.selectedChip]} onPress={() => setSelectedDeptId(dept.id)}>
                  <Typography variant="caption" weight="600" color={selectedDeptId === dept.id ? colors.surface : colors.text}>{dept.name}</Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Input label="Queue Number" placeholder="e.g. 101" keyboardType="numeric" value={queueNum} onChangeText={setQueueNum} icon="search-outline" />
            <Button title="Analyze Status" onPress={handleCheck} style={{ height: 56 }} />
          </Card>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Card style={[styles.resultCard, statusData.status === 'current' && styles.currentCard]}>
              <View style={styles.resultHeader}>
                <View>
                  <Typography variant="h1" color={colors.primary} weight="800">{statusData.queue_number}</Typography>
                  <Typography variant="body" color={colors.muted} weight="600">{statusData.department.name}</Typography>
                </View>
                {getStatusBadge()}
              </View>
              
              <View style={styles.patientInfo}>
                <Typography variant="caption" weight="600" color={colors.muted}>PATIENT IDENTITY</Typography>
                <Typography variant="h4" weight="700">{statusData.patient_name}</Typography>
              </View>

              {statusData.status === 'waiting' && (
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Typography variant="h2">{statusData.position}</Typography>
                    <Typography variant="caption" color={colors.muted} weight="600">PEOPLE AHEAD</Typography>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statBox}>
                    <Typography variant="h2">{statusData.estimated_wait}<Typography variant="body">m</Typography></Typography>
                    <Typography variant="caption" color={colors.muted} weight="600">EST. WAIT</Typography>
                  </View>
                </View>
              )}

              {statusData.status === 'current' && (
                <View style={styles.callToAction}>
                  <View style={styles.pulseIconTitle}>
                    <Ionicons name="notifications" size={24} color={colors.success} />
                    <Typography variant="h3" color={colors.success} weight="800">BEING CALLED NOW</Typography>
                  </View>
                  <Typography variant="body" align="center" color={colors.textSecondary}>
                    Your sanctuary session is starting. Please proceed to the {statusData.department.name} station immediately.
                  </Typography>
                </View>
              )}

              <Button 
                title="Disconnect from Token" 
                variant="outline" 
                onPress={() => { setStatusData(null); setQueueNum(''); }} 
                style={styles.resetBtn}
              />
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerArea: {
    padding: spacing.m,
    paddingTop: spacing.l,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: { padding: spacing.m, paddingBottom: spacing.xxl },
  inputCard: { padding: spacing.l, marginBottom: spacing.l },
  label: { marginBottom: spacing.s, textTransform: 'uppercase', letterSpacing: 1 },
  chipScroll: { marginBottom: spacing.l, marginHorizontal: -spacing.m, paddingHorizontal: spacing.m },
  chip: { paddingHorizontal: spacing.m, paddingVertical: spacing.s, borderRadius: borderRadius.round, backgroundColor: colors.background, marginRight: spacing.s, borderWidth: 1, borderColor: colors.border },
  selectedChip: { backgroundColor: colors.accent, borderColor: colors.accent },
  resultCard: { padding: spacing.xl, borderLeftWidth: 6, borderLeftColor: colors.accent },
  currentCard: { borderLeftColor: colors.success, shadowColor: colors.success, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  patientInfo: { marginBottom: spacing.xl, padding: spacing.m, backgroundColor: colors.background, borderRadius: borderRadius.m },
  statsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
  callToAction: { alignItems: 'center', padding: spacing.xl, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: borderRadius.l, marginBottom: spacing.xl },
  pulseIconTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, marginBottom: spacing.s },
  resetBtn: { marginTop: spacing.s },
});
