import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PatientInfo } from '../types';

interface IdentityCardProps {
  patient: PatientInfo;
  onEdit?: () => void;
}

const IdentityCard: React.FC<IdentityCardProps> = ({ patient, onEdit }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onEdit}
      activeOpacity={onEdit ? 0.7 : 1}
    >
      <View style={styles.photoContainer}>
        {patient.photoUri ? (
          <Image source={{ uri: patient.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>🧠 WHO AM I?</Text>
        <Text style={styles.name}>{patient.name}</Text>
        {patient.caregiverName && (
          <Text style={styles.caregiver}>
            My caregiver: {patient.caregiverName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  photoContainer: {
    marginRight: 16,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7986CB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5C6BC0',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  caregiver: {
    fontSize: 14,
    color: '#757575',
  },
});

export default IdentityCard;