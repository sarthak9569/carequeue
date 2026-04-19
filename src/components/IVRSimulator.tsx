import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useQueue } from '../context/QueueContext';

type IVRState = 'idle' | 'calling' | 'language' | 'name' | 'department' | 'confirming' | 'success';

export const IVRSimulator: React.FC = () => {
  const [ivrState, setIvrState] = useState<IVRState>('idle');
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Collected data
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [patientName, setPatientName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  
  const { generateToken, departments } = useQueue();
  const inputRef = useRef<TextInput>(null);

  // Pan Responder for Movable Button
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger pan if user moves finger significantly (so taps still work)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Stop talking if component unmounts or we close
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const closeAndReset = () => {
    Speech.stop();
    setIvrState('idle');
    setModalVisible(false);
    setInputText('');
    setPatientName('');
    setSelectedDeptId('');
  };

  const startCall = async () => {
    setModalVisible(true);
    setIvrState('calling');
    
    // Simulate ring delay
    await new Promise(r => setTimeout(r, 1500));
    
    setIvrState('language');
    Speech.speak("Welcome to Care Queue. For English, type 1. Hindi ke liye, do dabayein.", {
      language: 'en-IN',
      onDone: () => {
        // Focus the input so the keyboard pops up automatically
        inputRef.current?.focus();
      }
    });
  };

  const handleInputSubmit = async () => {
    const text = inputText.trim();
    setInputText('');
    Speech.stop(); // Stop any pending speech
    
    if (!text) return;

    if (ivrState === 'language') {
      if (text.includes('1') || text.toLowerCase() === 'english') {
        setLanguage('english');
        setIvrState('name');
        Speech.speak("Please tell me your full name using the dictation microphone.", {
          language: 'en-IN',
          onDone: () => inputRef.current?.focus(),
        });
      } else {
        // Assume Hindi for simplicity but speak in english for now as a placeholder
        setLanguage('hindi');
        setIvrState('name');
        Speech.speak("Kripya apna poora naam batayein.", {
          language: 'hi-IN',
          onDone: () => inputRef.current?.focus(),
        });
      }
    } 
    else if (ivrState === 'name') {
      setPatientName(text);
      setIvrState('department');
      const msg = language === 'english' 
        ? "Which department do you want to visit? For example, Cardiology or General."
        : "Aap kis department mein jana chahte hain? Jaise Cardiology ya General.";
        
      Speech.speak(msg, {
        language: language === 'english' ? 'en-IN' : 'hi-IN',
        onDone: () => inputRef.current?.focus(),
      });
    }
    else if (ivrState === 'department') {
      const lowerText = text.toLowerCase();
      // Simple string matching against real departments
      const foundDept = departments.find(d => lowerText.includes(d.name.toLowerCase()));
      
      if (foundDept) {
        setSelectedDeptId(foundDept.id);
        submitQueue(foundDept.id);
      } else {
        // Try again
        const msg = language === 'english'
          ? "I didn't catch that. Please state the department name again, like Cardiology or E.N.T."
          : "Mujhe samajh nahi aaya. Kripya department ka naam fir se batayein.";
        Speech.speak(msg, {
           language: language === 'english' ? 'en-IN' : 'hi-IN',
           onDone: () => inputRef.current?.focus(),
        });
      }
    }
  };

  const submitQueue = async (deptId: string) => {
    setIvrState('confirming');
    try {
      const entry = await generateToken({
        name: patientName,
        phone: '123-456-7890', // specific mocked phone for IVR test
        departmentId: deptId,
        source: 'ivr',
      });
      
      setIvrState('success');
      const msg = language === 'english'
        ? `You are in line. Your Queue Number is ${entry.queue_number}. We will send you an SMS shortly. Goodbye.`
        : `Aapki booking ho gayi hai. Aapka number ${entry.queue_number} hai. Hum jald hi SMS bhejenge. Dhanyawad.`;
        
      Speech.speak(msg, {
        language: language === 'english' ? 'en-IN' : 'hi-IN',
        onDone: () => {
          setTimeout(() => closeAndReset(), 2000);
        }
      });
    } catch (error) {
      Speech.speak("Sorry, there was a system error. Please try again later.");
      setTimeout(() => closeAndReset(), 3000);
    }
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.fabWrapper,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
        ]}
      >
        <TouchableOpacity style={styles.fab} onPress={startCall} activeOpacity={0.8}>
          <Ionicons name="call" size={24} color={colors.surface} />
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeAndReset}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.callIconBox}>
                <Ionicons name="call" size={24} color={colors.primary} />
              </View>
              <Text style={styles.callTitle}>CareQueue IVR System</Text>
              <TouchableOpacity onPress={closeAndReset} style={styles.hangupBtn}>
                 <Ionicons name="close-circle" size={32} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Status Display */}
            <View style={styles.statusDisplay}>
              {ivrState === 'calling' && (
                <>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={styles.statusText}>Calling...</Text>
                </>
              )}
              {ivrState === 'language' && (
                <View style={styles.avatarContainer}>
                  <Ionicons name="volume-high" size={48} color={colors.primary} />
                  <Text style={styles.statusText}>Say "1" or type "1" for English</Text>
                </View>
              )}
               {ivrState === 'name' && (
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-circle" size={48} color={colors.primary} />
                  <Text style={styles.statusText}>Dictate your Name</Text>
                </View>
              )}
               {ivrState === 'department' && (
                <View style={styles.avatarContainer}>
                   <Ionicons name="medical" size={48} color={colors.primary} />
                  <Text style={styles.statusText}>Dictate your Department</Text>
                </View>
              )}
               {ivrState === 'confirming' && (
                <>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={styles.statusText}>Joining Queue...</Text>
                </>
              )}
              {ivrState === 'success' && (
                <View style={styles.avatarContainer}>
                  <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                  <Text style={styles.statusText}>Queue Confirmed!</Text>
                </View>
              )}
            </View>

            {/* Input Area */}
            {['language', 'name', 'department'].includes(ivrState) && (
              <View style={styles.inputArea}>
                <Text style={styles.hintText}>
                  Use your keyboard's microphone to dictate, then press Enter
                </Text>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleInputSubmit}
                  returnKeyType="send"
                  placeholder="Type or dictate response..."
                  placeholderTextColor={colors.muted}
                />
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  fab: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.l,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  callIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginLeft: spacing.m,
  },
  hangupBtn: {
    padding: spacing.xs,
  },
  statusDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  statusText: {
    marginTop: spacing.m,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  inputArea: {
    marginTop: spacing.l,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  }
});
