import { AppData } from '../types';

export const mockAppData: AppData = {
  patient: {
    name: 'Margaret Johnson',
    photoUri: null,
    caregiverCode: 'CAREGIVER-MB-2024',
    caregiverName: 'Sarah (Daughter)',
  },
  contacts: [
    {
      id: '1',
      name: 'Sarah Johnson',
      photoUri: null,
      phoneNumber: '+1 (555) 123-4567',
      relationship: 'Daughter',
    },
    {
      id: '2',
      name: 'Dr. Robert Chen',
      photoUri: null,
      phoneNumber: '+1 (555) 987-6543',
      relationship: 'Doctor',
    },
    {
      id: '3',
      name: 'Linda Wilson',
      photoUri: null,
      phoneNumber: '+1 (555) 456-7890',
      relationship: 'Neighbor',
    },
  ],
  medications: [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10 mg',
      time: '08:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes: 'Take with breakfast',
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500 mg',
      time: '12:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes: 'Take with lunch',
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20 mg',
      time: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes: 'Take before bed',
    },
  ],
  schedule: {
    date: new Date().toISOString().split('T')[0],
    events: [
      {
        id: '1',
        title: 'Morning Walk',
        time: '09:00',
        location: 'Garden',
        notes: 'Weather permitting',
      },
      {
        id: '2',
        title: 'Lunch',
        time: '12:00',
        location: 'Dining Room',
      },
      {
        id: '3',
        title: 'Arts & Crafts',
        time: '14:00',
        location: 'Activity Room',
      },
      {
        id: '4',
        title: 'Call Sarah',
        time: '16:00',
        notes: 'Video call with daughter',
      },
      {
        id: '5',
        title: 'Bingo Night',
        time: '19:00',
        location: 'Community Hall',
      },
    ],
  },
};

export default mockAppData;