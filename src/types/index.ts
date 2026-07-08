// Types for MemoryBridge patient app

export interface Contact {
  id: string;
  name: string;
  photoUri: string | null;
  phoneNumber: string;
  relationship: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string; // HH:mm format
  location?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format
  days: DayOfWeek[];
  notes?: string;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface PatientInfo {
  name: string;
  photoUri: string | null;
  caregiverCode: string;
  caregiverName: string;
}

export interface DailySchedule {
  date: string;
  events: ScheduleEvent[];
}

export interface AppData {
  patient: PatientInfo;
  contacts: Contact[];
  medications: Medication[];
  schedule: DailySchedule;
}