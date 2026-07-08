import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ClockWidgetProps {
  large?: boolean;
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ large = true }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateString = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.time, large && styles.timeLarge]}>{timeString}</Text>
      <Text style={styles.date}>{dateString}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1A237E',
    borderRadius: 16,
    marginBottom: 16,
  },
  time: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timeLarge: {
    fontSize: 56,
  },
  date: {
    fontSize: 18,
    color: '#E8EAF6',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default ClockWidget;