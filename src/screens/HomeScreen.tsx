import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ClockWidget from '../components/ClockWidget';
import IdentityCard from '../components/IdentityCard';
import BigButton from '../components/BigButton';
import { loadAppData } from '../services/storage';
import { AppData, ScheduleEvent, Medication } from '../types';

type RootStackParamList = {
  Home: undefined;
  Schedule: undefined;
  Call: undefined;
  Medications: undefined;
  Settings: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [nextEvent, setNextEvent] = useState<ScheduleEvent | null>(null);
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);

  useEffect(() => {
    loadAppData().then(setAppData);
  }, []);

  useEffect(() => {
    if (appData) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find next upcoming event
      const upcomingEvents = appData.schedule.events
        .map((e) => ({
          ...e,
          minutes: parseInt(e.time.split(':')[0]) * 60 + parseInt(e.time.split(':')[1]),
        }))
        .filter((e) => e.minutes > currentMinutes)
        .sort((a, b) => a.minutes - b.minutes);

      setNextEvent(upcomingEvents[0] || null);

      // Find next medication
      const upcomingMeds = appData.medications
        .map((m) => ({
          ...m,
          minutes: parseInt(m.time.split(':')[0]) * 60 + parseInt(m.time.split(':')[1]),
        }))
        .filter((m) => m.minutes > currentMinutes)
        .sort((a, b) => a.minutes - b.minutes);

      setNextMedication(upcomingMeds[0] || null);
    }
  }, [appData]);

  const handleCall = () => {
    navigation.navigate('Call');
  };

  const handleSchedule = () => {
    navigation.navigate('Schedule');
  };

  const handleMedications = () => {
    navigation.navigate('Medications');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  if (!appData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with settings gear */}
        <View style={styles.header}>
          <Text style={styles.appName}>MemoryBridge</Text>
          <View style={styles.headerRight}>
            <Text style={styles.upcomingLabel}>
              {nextEvent ? `Next: ${nextEvent.title}` : ''}
            </Text>
            <Ionicons
              name="settings-outline"
              size={28}
              color="#5C6BC0"
              onPress={handleSettings}
            />
          </View>
        </View>

        {/* Clock & Date */}
        <ClockWidget large />

        {/* Identity Card */}
        <IdentityCard patient={appData.patient} />

        {/* Next Medication Alert */}
        {nextMedication && (
          <View style={styles.alertBanner}>
            <Ionicons name="medkit" size={20} color="#FFFFFF" />
            <Text style={styles.alertText}>
              💊 {nextMedication.name} at {nextMedication.time}
            </Text>
          </View>
        )}

        {/* Big Action Buttons */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <BigButton
          title="Call Someone"
          icon="call"
          color="#4CAF50"
          onPress={handleCall}
          subtitle="Talk to family & friends"
        />

        <BigButton
          title="My Schedule"
          icon="calendar"
          color="#2196F3"
          onPress={handleSchedule}
          subtitle="See today's activities"
        />

        <BigButton
          title="Medications"
          icon="medkit"
          color="#FF5722"
          onPress={handleMedications}
          subtitle="Check my medicines"
        />

        {/* Version info */}
        <Text style={styles.versionText}>MemoryBridge v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C6BC0',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingLabel: {
    fontSize: 13,
    color: '#FF6F00',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#757575',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
    marginBottom: 12,
    marginTop: 4,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 20,
  },
});

export default HomeScreen;