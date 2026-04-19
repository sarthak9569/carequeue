import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Typography } from '../components/Typography';
import { colors, spacing, borderRadius } from '../theme/theme';
import { DEPARTMENTS } from '../data/mockData';
import { useQueue } from '../context/QueueContext';

const { width } = Dimensions.get('window');

type CallState = 'IDLE' | 'CALLING' | 'CONNECTED' | 'ENDED';
type IVRStep = 'LANG' | 'MENU' | 'REG_PHONE' | 'REG_DEPT' | 'REG_CONFIRM' | 'STATUS_INPUT' | 'STATUS_RESULT';

export const IVRScreen: React.FC = () => {
  const { generateToken, tokens } = useQueue();
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [ivrStep, setIvrStep] = useState<IVRStep>('LANG');
  const [typedValue, setTypedValue] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [screenText, setScreenText] = useState('READY TO CALL');
  const [tempPhone, setTempPhone] = useState('');
  const logScrollRef = useRef<ScrollView>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`]);
  };

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const startCall = () => {
    setCallState('CALLING');
    setScreenText('CALLING carequeue...');
    addLog('Initiating call to +1 800 CAREQUEUE');
    
    setTimeout(() => {
      setCallState('CONNECTED');
      setIvrStep('LANG');
      setScreenText('Language: 1-EN, 2-HI');
      addLog('Call connected. IVR: Language selection.');
    }, 2000);
  };

  const endCall = () => {
    setCallState('ENDED');
    setScreenText('CALL ENDED');
    addLog('User disconnected call.');
    setTimeout(() => {
      setCallState('IDLE');
      setTypedValue('');
      setLogs([]);
      setScreenText('READY TO CALL');
    }, 2000);
  };

  const handleKeyPress = async (num: string) => {
    if (callState !== 'CONNECTED') return;
    Vibration.vibrate(50);
    setTypedValue(prev => prev + num);
    
    if (ivrStep === 'LANG') {
      addLog(`User pressed ${num} for language.`);
      setIvrStep('MENU');
      setScreenText('Menu: 1-Reg, 2-Status');
      setTypedValue('');
    } else if (ivrStep === 'MENU') {
      if (num === '1') {
        addLog('User selected Registration.');
        setIvrStep('REG_PHONE');
        setScreenText('Enter Phone Number');
      } else if (num === '2') {
        addLog('User selected Check Status.');
        setIvrStep('STATUS_INPUT');
        setScreenText('Enter Queue Number');
      }
      setTypedValue('');
    } else if (ivrStep === 'REG_PHONE') {
      if (num === '#') {
        addLog(`Phone entered: ${typedValue}`);
        setTempPhone(typedValue);
        setIvrStep('REG_DEPT');
        setScreenText('Select Dept (1-OPD)');
        setTypedValue('');
      }
    } else if (ivrStep === 'REG_DEPT') {
      const deptIdx = parseInt(num) - 1;
      const dept = DEPARTMENTS[deptIdx] || DEPARTMENTS[0];
      
      addLog(`User selected ${dept.name}. Registering...`);
      setScreenText('REGISTERING...');
      
      try {
        const token = await generateToken({
          name: 'IVR Patient',
          phone: tempPhone,
          departmentId: dept.id,
          source: 'ivr'
        });
        addLog(`Registration successful! Token: ${token.queue_number}`);
        setScreenText(`TOKEN: ${token.queue_number}`);
        setIvrStep('REG_CONFIRM');
      } catch (e) {
        addLog('Registration failed.');
        setScreenText('ERROR. PLEASE TRY AGAIN');
      }
    } else if (ivrStep === 'STATUS_INPUT') {
      if (num === '#') {
        addLog(`Checking status for: ${typedValue}`);
        const qNum = typedValue.startsWith('#') ? typedValue : `#${typedValue}`;
        const found = tokens.find(t => t.queue_number === qNum);
        
        if (found) {
          setScreenText(`${qNum}: ${found.status.toUpperCase()}`);
          addLog(`Result: ${found.status}`);
        } else {
          setScreenText('TOKEN NOT FOUND');
          addLog('Result: Not Found');
        }
        setIvrStep('STATUS_RESULT');
      }
    }
  };

  const renderKey = (val: string) => (
    <TouchableOpacity 
      style={styles.key} 
      onPress={() => handleKeyPress(val)}
      disabled={callState !== 'CONNECTED'}
    >
      <Typography variant="h2" color={colors.surface}>{val}</Typography>
    </TouchableOpacity>
  );

  return (
    <Layout backgroundColor="#020617">
      <Header title="CareQueue IVR" showBack />
      
      <View style={styles.main}>
        <View style={styles.phoneHead}>
          <View style={styles.screen}>
            <Typography style={styles.monoText}>{screenText}</Typography>
            <Typography style={[styles.monoText, { color: '#fbbf24' }]}>
              {typedValue || (callState === 'CONNECTED' ? '_' : '')}
            </Typography>
          </View>
        </View>

        <View style={styles.logPanel}>
          <Typography variant="caption" color="#475569" weight="600" style={{ marginBottom: 4 }}>
            LIVE CALL LOG
          </Typography>
          <ScrollView ref={logScrollRef} style={styles.logScroll}>
            {logs.map((log, i) => (
              <Typography key={i} variant="caption" color="#94a3b8" style={{ marginBottom: 2 }}>{log}</Typography>
            ))}
          </ScrollView>
        </View>

        <View style={styles.keypad}>
          {['1', '2', '3'].map(renderKey)}
          {['4', '5', '6'].map(renderKey)}
          {['7', '8', '9'].map(renderKey)}
          {['*', '0', '#'].map(renderKey)}
        </View>

        <View style={styles.actions}>
          {callState === 'IDLE' ? (
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success }]} onPress={startCall}>
              <Ionicons name="call" size={32} color={colors.surface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.danger }]} onPress={endCall}>
              <Ionicons name="call-outline" size={32} color={colors.surface} style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, padding: spacing.l, justifyContent: 'space-between' },
  phoneHead: { padding: spacing.m },
  screen: { backgroundColor: '#064e3b', padding: spacing.l, borderRadius: borderRadius.m, borderWidth: 4, borderColor: '#1e293b', minHeight: 120, justifyContent: 'center' },
  monoText: { fontFamily: 'monospace', color: '#10b981', fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' },
  logPanel: { backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: borderRadius.m, padding: spacing.s, height: 120, borderWidth: 1, borderColor: '#1e293b' },
  logScroll: { flex: 1 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  key: { width: width * 0.22, height: width * 0.22, margin: 8, borderRadius: width * 0.11, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  actions: { alignItems: 'center', paddingVertical: spacing.m },
  callBtn: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
});
