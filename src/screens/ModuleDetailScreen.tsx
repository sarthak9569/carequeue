import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/StatusUI';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';

type ModuleDetailRouteProp = RouteProp<RootStackParamList, 'ModuleDetail'>;

export const ModuleDetailScreen: React.FC = () => {
  const route = useRoute<ModuleDetailRouteProp>();
  const { type, title } = route.params;
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data generator for each module
  useEffect(() => {
    generateMockData();
  }, [type]);

  const generateMockData = () => {
    let mock: any[] = [];
    switch(type) {
      case 'patients':
        mock = [
          { id: '1', name: 'Rahul Sharma', age: 34, diagnosis: 'Post-op Recovery', status: 'Follow-up' },
          { id: '2', name: 'Simran Jeet', age: 29, diagnosis: 'Acute Lymphoma', status: 'In-treatment' },
        ];
        break;
      case 'pharmacy':
        mock = [
          { id: '1', name: 'Paracetamol 500mg', qty: 450, expiry: '12/2026', status: 'In-Stock' },
          { id: '2', name: 'Amoxicillin', qty: 20, expiry: '08/2026', status: 'Low-Stock' },
        ];
        break;
      case 'finance':
        mock = [
            { id: '1', patient: 'Rahul Sharma', amount: '₹12,400', status: 'Paid', date: '15 June' },
            { id: '2', patient: 'Simran Jeet', amount: '₹45,000', status: 'Pending', date: 'Yesterday' },
        ];
        break;
      default:
        mock = [{ id: '1', name: `Recent ${title} Update`, date: 'Today' }];
    }
    setData(mock);
  };

  const renderContent = () => {
    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.entryCard}>
            <View style={styles.entryInfo}>
              <Typography weight="700">{item.name || item.patient}</Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {item.diagnosis || item.qty ? `Info: ${item.diagnosis || item.qty + ' units'}` : item.date}
              </Typography>
            </View>
            <Badge label={item.status || 'Active'} variant={item.status === 'Paid' || item.status === 'In-Stock' ? 'success' : 'warning'} />
          </Card>
        )}
      />
    );
  };

  return (
    <Layout>
      <Header title={title} showBack />
      <View style={styles.container}>
        <View style={styles.searchBar}>
            <Input placeholder={`Search ${title}...`} icon="search" style={{ marginBottom: 0 }} />
        </View>
        
        {renderContent()}

        <View style={styles.floatingAction}>
            <Button 
                title={`New ${title.slice(0, -1)} Entry`} 
                onPress={() => Alert.alert('Action', `Opening creation form for ${title}`)} 
                icon="add-circle"
                variant="primary"
            />
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { padding: spacing.m, borderBottomWidth: 1, borderBottomColor: colors.border },
  list: { padding: spacing.m },
  entryCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.m, 
    marginBottom: spacing.m,
    ...shadows.soft 
  },
  entryInfo: { flex: 1 },
  floatingAction: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.l,
    right: spacing.l,
  }
});
