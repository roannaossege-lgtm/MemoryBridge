import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mockAppData from '../data/mockData';
import { Medication } from '../types';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [takenMeds, setTakenMeds] = useState<Set<string>>(new Set());

  const sortedMeds = useMemo(() => {
    return [...mockAppData.medications].sort((a, b) => {
      const aMin = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
      const bMin = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
      return aMin - bMin;
    });
  }, []);

  const toggleTaken = (medId: string) => {
    setTakenMeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(medId)) {
        newSet.delete(medId);
      } else {
        newSet.add(medId);
      }
      return newSet;
    });
  };

  const today = new Date();
  const todayLabel = DAY_LABELS[today.getDay() === 0 ? 6 : today.getDay() - 1];

  const getTimePeriod = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return '🌅 Morning';
    if (hour < 17) return '☀️ Afternoon';
    return '🌙 Evening';
  };

  const handleCheck = (med: Medication) => {
    toggleTaken(med.id);
    if (!takenMeds.has(med.id)) {
      Alert.alert('💊 Marked as Taken', `${med.name} (${med.dosage}) recorded as taken.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.instructionText}>
          Tap ✓ to mark a medication as taken
        </Text>

        {sortedMeds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>No medications scheduled</Text>
          </View>
        ) : (
          <>
            {/* Group by time period */}
            {['🌅 Morning', '☀️ Afternoon', '🌙 Evening'].map((period) => {
              const periodMeds = sortedMeds.filter((med) => {
                const hour = parseInt(med.time.split(':')[0]);
                if (period === '🌅 Morning') return hour < 12;
                if (period === '☀️ Afternoon') return hour >= 12 && hour < 17;
                return hour >= 17;
              });

              if (periodMeds.length === 0) return null;

              return (
                <View key={period} style={styles.periodSection}>
                  <Text style={styles.periodTitle}>{period}</Text>

                  {periodMeds.map((med) => {
                    const isTaken = takenMeds.has(med.id);
                    const isScheduledToday = med.days.includes(todayLabel as any);

                    return (
                      <TouchableOpacity
                        key={med.id}
                        style={[
                          styles.medCard,
                          isTaken && styles.medCardTaken,
                          !isScheduledToday && styles.medCardSkipped,
                        ]}
                        onPress={() => isScheduledToday && handleCheck(med)}
                        activeOpacity={isScheduledToday ? 0.7 : 1}
                        disabled={!isScheduledToday}
                      >
                        <View style={styles.medLeft}>
                          <TouchableOpacity
                            style={[
                              styles.checkbox,
                              isTaken && styles.checkboxChecked,
                              !isScheduledToday && styles.checkboxDisabled,
                            ]}
                            onPress={() => isScheduledToday && handleCheck(med)}
                            disabled={!isScheduledToday}
                          >
                            {isTaken && (
                              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                            )}
                          </TouchableOpacity>
                        </View>

                        <View style={styles.medInfo}>
                          <View style={styles.medNameRow}>
                            <Text
                              style={[
                                styles.medName,
                                isTaken && styles.medTextTaken,
                              ]}
                            >
                              {med.name}
                            </Text>
                            {!isScheduledToday && (
                              <View style={styles.skipBadge}>
                                <Text style={styles.skipBadgeText}>Not today</Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.medDosage,
                              isTaken && styles.medTextTaken,
                            ]}
                          >
                            {med.dosage}
                          </Text>
                          <View style={styles.medTimeRow}>
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color={isTaken ? '#A5D6A7' : '#757575'}
                            />
                            <Text
                              style={[
                                styles.medTime,
                                isTaken && styles.medTextTaken,
                              ]}
                            >
                              {med.time}
                            </Text>
                          </View>
                          {med.notes && (
                            <Text
                              style={[
                                styles.medNotes,
                                isTaken && styles.medTextTaken,
                              ]}
                            >
                              📝 {med.notes}
                            </Text>
                          )}
                        </View>

                        <View style={styles.medDoseBadge}>
                          <Text style={styles.doseBadgeText}>{med.dosage}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'center',
  },
  periodSection: {
    marginBottom: 20,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5722',
    marginBottom: 10,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medCardTaken: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
    opacity: 0.85,
  },
  medCardSkipped: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: '#BDBDBD',
    opacity: 0.6,
  },
  medLeft: {
    marginRight: 12,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxDisabled: {
    borderColor: '#BDBDBD',
    backgroundColor: '#EEEEEE',
  },
  medInfo: {
    flex: 1,
  },
  medNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  medTextTaken: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  medDosage: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
    marginTop: 2,
  },
  medTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  medTime: {
    fontSize: 15,
    color: '#757575',
  },
  medNotes: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    fontStyle: 'italic',
  },
  medDoseBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  doseBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5722',
  },
  skipBadge: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  skipBadgeText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9E9E9E',
    marginTop: 12,
  },
});

export default MedicationsScreen;