import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getPatientInfo, saveCaregiverCode, getCaregiverCode, savePatientInfo } from '../services/storage';
import { PatientInfo } from '../types';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [caregiverCode, setCaregiverCode] = useState('');
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [patientInfo, setPatientInfoState] = useState<PatientInfo | null>(null);
  const [editingPatientName, setEditingPatientName] = useState(false);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const info = await getPatientInfo();
    setPatientInfoState(info);
    setPatientName(info.name);
    const code = await getCaregiverCode();
    setSavedCode(code);
  };

  const handleSaveCode = async () => {
    if (!caregiverCode.trim()) {
      Alert.alert('Error', 'Please enter a caregiver code');
      return;
    }
    await saveCaregiverCode(caregiverCode.trim());
    setSavedCode(caregiverCode.trim());
    Alert.alert('Success', 'Caregiver code saved!');
    setCaregiverCode('');
  };

  const handleSaveName = async () => {
    if (!patientName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (patientInfo) {
      await savePatientInfo({
        ...patientInfo,
        name: patientName.trim(),
      });
      setPatientInfoState({ ...patientInfo, name: patientName.trim() });
    }
    setEditingPatientName(false);
    Alert.alert('Success', 'Name updated!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#5C6BC0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Patient Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Name</Text>
            {editingPatientName ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Enter your name"
                  placeholderTextColor="#BDBDBD"
                  autoFocus
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => setEditingPatientName(true)}
              >
                <Text style={styles.infoText}>{patientInfo?.name || 'Set your name'}</Text>
                <Ionicons name="pencil" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            )}
          </View>

          {/* Caregiver Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link to Caregiver</Text>
            <Text style={styles.sectionDesc}>
              Enter the code provided by your family caregiver to connect.
            </Text>
            {savedCode ? (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.infoText, styles.linkedText]}>
                  Linked (Code: {savedCode})
                </Text>
              </View>
            ) : (
              <Text style={styles.notLinkedText}>Not yet linked</Text>
            )}
            <View style={styles.codeInputRow}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={caregiverCode}
                onChangeText={setCaregiverCode}
                placeholder="Enter caregiver code"
                placeholderTextColor="#BDBDBD"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCode}>
                <Text style={styles.saveButtonText}>
                  {savedCode ? 'Update' : 'Link'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              MemoryBridge helps you stay connected with your loved ones.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C6BC0',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 18,
    color: '#212121',
    fontWeight: '500',
    flex: 1,
  },
  linkedText: {
    color: '#4CAF50',
    fontSize: 15,
  },
  notLinkedText: {
    fontSize: 15,
    color: '#FF5722',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  codeInput: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#5C6BC0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#BDBDBD',
  },
});

export default SettingsScreen;