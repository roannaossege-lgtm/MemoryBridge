import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, PatientInfo, Contact, Medication } from '../types';
import { mockAppData } from '../data/mockData';

const KEYS = {
  APP_DATA: '@memorybridge:app_data',
  CAREGIVER_CODE: '@memorybridge:caregiver_code',
  PATIENT_INFO: '@memorybridge:patient_info',
  CONTACTS: '@memorybridge:contacts',
  MEDICATIONS: '@memorybridge:medications',
  SCHEDULE: '@memorybridge:schedule',
  IS_SETUP: '@memorybridge:is_setup',
};

export async function loadAppData(): Promise<AppData> {
  try {
    const isSetup = await AsyncStorage.getItem(KEYS.IS_SETUP);
    if (isSetup === 'true') {
      const dataJson = await AsyncStorage.getItem(KEYS.APP_DATA);
      if (dataJson) {
        return JSON.parse(dataJson) as AppData;
      }
    }
    // First launch: seed with mock data
    await seedMockData();
    return mockAppData;
  } catch (error) {
    console.error('Error loading app data:', error);
    return mockAppData;
  }
}

export async function seedMockData(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.APP_DATA, JSON.stringify(mockAppData));
    await AsyncStorage.setItem(KEYS.IS_SETUP, 'true');
  } catch (error) {
    console.error('Error seeding mock data:', error);
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.APP_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving app data:', error);
  }
}

export async function getPatientInfo(): Promise<PatientInfo> {
  const data = await loadAppData();
  return data.patient;
}

export async function savePatientInfo(info: PatientInfo): Promise<void> {
  const data = await loadAppData();
  data.patient = info;
  await saveAppData(data);
}

export async function getContacts(): Promise<Contact[]> {
  const data = await loadAppData();
  return data.contacts;
}

export async function saveContacts(contacts: Contact[]): Promise<void> {
  const data = await loadAppData();
  data.contacts = contacts;
  await saveAppData(data);
}

export async function getMedications(): Promise<Medication[]> {
  const data = await loadAppData();
  return data.medications;
}

export async function getCaregiverCode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.CAREGIVER_CODE);
  } catch {
    return null;
  }
}

export async function saveCaregiverCode(code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CAREGIVER_CODE, code);
  } catch (error) {
    console.error('Error saving caregiver code:', error);
  }
}

export async function isAppSetup(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.IS_SETUP)) === 'true';
  } catch {
    return false;
  }
}

export async function resetToMockData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.APP_DATA);
    await AsyncStorage.setItem(KEYS.IS_SETUP, 'true');
  } catch (error) {
    console.error('Error resetting data:', error);
  }
}