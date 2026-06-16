import React from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Badge } from '../components/StatusUI';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.l * 2 - spacing.m) / 2;

const MODULES = [
  { id: 'patients', title: 'Patient Records', icon: 'people', color: '#3b82f6', desc: 'Medical history & reports' },
  { id: 'admissions', title: 'Admissions', icon: 'bed', color: '#8b5cf6', desc: 'Ward & bed management' },
  { id: 'emergency', title: 'Emergency', icon: 'pulse', color: '#ef4444', desc: 'Triage & critical logs' },
  { id: 'opd', title: 'OPD Records', icon: 'calendar', color: '#10b981', desc: 'Consultations & follow-ups' },
  { id: 'pharmacy', title: 'Pharmacy', icon: 'medical', color: '#f59e0b', desc: 'Inventory & stock logs' },
  { id: 'finance', title: 'Financials', icon: 'card', color: '#6366f1', desc: 'Billing & audit reports' },
  { id: 'legal', title: 'Compliance', icon: 'shield-checkmark', color: '#6b7280', desc: 'Licenses & legal cases' },
  { id: 'staff', title: 'Staff Roster', icon: 'briefcase', color: '#ec4899', desc: 'Duty & attendance' },
];

export const HospitalModulesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <Layout>
      <Header title="Clinical Management" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.trafficOverview}>
          <Typography variant="h3" style={{ color: colors.surface }}>Real-time Statistics</Typography>
          <View style={styles.trafficGrid}>
            <View style={styles.trafficItem}>
              <Typography variant="h2" color={colors.surface}>24</Typography>
              <Typography variant="caption" color={colors.surface} opacity={0.8}>ACTIVE DEPTS</Typography>
            </View>
            <View style={styles.trafficItem}>
              <Typography variant="h2" color={colors.surface}>High</Typography>
              <Typography variant="caption" color={colors.surface} opacity={0.8}>TRAFFIC LEVEL</Typography>
            </View>
          </View>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>Mandatory Data Modules</Typography>
        
        <Card style={styles.recentDepts}>
          <Typography variant="caption" weight="800" color={colors.primary}>RECENTLY SYNCHRONIZED DEPTS</Typography>
          <View style={styles.ticker}>
            <View style={styles.tickerItem}>
              <Badge label="NEW" variant="success" size="small" />
              <Typography variant="caption" weight="600" style={{ marginLeft: 8 }}>Pediatrics - Dr. Usha</Typography>
            </View>
            <View style={styles.tickerItem}>
              <Badge label="NEW" variant="success" size="small" />
              <Typography variant="caption" weight="600" style={{ marginLeft: 8 }}>Gynocology - Unit 1</Typography>
            </View>
          </View>
        </Card>

        <View style={styles.moduleGrid}>
          {MODULES.map((module) => (
            <TouchableOpacity 
              key={module.id} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ModuleDetail', { type: module.id, title: module.title })}
            >
              <Card style={styles.moduleCard}>
                <View style={[styles.iconCircle, { backgroundColor: module.color + '15' }]}>
                  <Ionicons name={module.icon as any} size={28} color={module.color} />
                </View>
                <Typography weight="700" style={{ marginTop: spacing.m }}>{module.title}</Typography>
                <Typography variant="caption" color={colors.muted} style={{ marginTop: 2 }}>{module.desc}</Typography>
                <View style={styles.arrowContainer}>
                   <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.l, paddingBottom: spacing.xl * 2 },
  trafficOverview: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.l,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  trafficGrid: {
    flexDirection: 'row',
    marginTop: spacing.l,
    justifyContent: 'space-between',
  },
  trafficItem: {
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing.l,
    color: colors.primary,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  moduleCard: {
    width: COLUMN_WIDTH,
    padding: spacing.l,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    height: 160,
    justifyContent: 'center',
    ...shadows.soft,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    right: spacing.m,
    top: spacing.m,
  },
  recentDepts: {
    marginBottom: spacing.l,
    padding: spacing.m,
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  ticker: {
    marginTop: spacing.s,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  }
});
