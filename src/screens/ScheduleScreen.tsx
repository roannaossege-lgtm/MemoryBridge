import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mockAppData from '../data/mockData';
import { ScheduleEvent } from '../types';

const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const schedule = mockAppData.schedule;

  const sortedEvents = useMemo(() => {
    return [...schedule.events].sort((a, b) => {
      const aMin = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
      const bMin = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
      return aMin - bMin;
    });
  }, [schedule.events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPeriodIcon = (time: string): keyof typeof Ionicons.glyphMap => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'sunny';
    if (hour < 17) return 'partly-sunny';
    return 'moon';
  };

  const getPeriodColor = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return '#FF9800';
    if (hour < 17) return '#2196F3';
    return '#5C6BC0';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerDate}>{formatDate(schedule.date)}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {sortedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>No events today</Text>
            <Text style={styles.emptySubtext}>Enjoy your day!</Text>
          </View>
        ) : (
          <>
            <Text style={styles.scheduleHint}>Your activities for today</Text>

            {/* Timeline */}
            <View style={styles.timeline}>
              {sortedEvents.map((event, index) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: getPeriodColor(event.time) },
                      ]}
                    />
                    {index < sortedEvents.length - 1 && (
                      <View style={styles.line} />
                    )}
                  </View>

                  <View
                    style={[
                      styles.eventCard,
                      { borderLeftColor: getPeriodColor(event.time) },
                    ]}
                  >
                    <View style={styles.eventHeader}>
                      <Ionicons
                        name={getPeriodIcon(event.time)}
                        size={20}
                        color={getPeriodColor(event.time)}
                      />
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.location && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="location-outline" size={16} color="#757575" />
                        <Text style={styles.eventDetail}>{event.location}</Text>
                      </View>
                    )}
                    {event.notes && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="information-circle-outline" size={16} color="#757575" />
                        <Text style={styles.eventDetail}>{event.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
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
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: 14,
    color: '#BBDEFB',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  scheduleHint: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginLeft: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  eventDetail: {
    fontSize: 15,
    color: '#757575',
    flex: 1,
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
  emptySubtext: {
    fontSize: 16,
    color: '#BDBDBD',
    marginTop: 4,
  },
});

export default ScheduleScreen;