/**
 * @geoge31
 * @file Context.tsx
 * @path '@/app/api/_context/Patients/Context.tsx'
 * This file implements the PatientProvider context, which supplies patient-related data 
 *  to any component within its scope. Components can access this data by using the usePatientProvider hook. 
 */

import React, { createContext, useContext, useState } from 'react';
import { usePatientsHook } from '@/hooks/usePatientsHook';
import { PatientData } from '@/utils/interfaces/interfaceModules';

interface PatientsContextType {
  patientsList: PatientData[] | null;
  isLoading: boolean;
  isError: boolean;
  refetchPatients: () => void;
  currPatientId: string | null;
  setCurrPatientId: (id: string) => void;
}

const PatientContext = createContext<PatientsContextType | undefined>(undefined);

/**
 * PatientProvider component that fetches and supplies patient-related data to its children.
 * @param children Child components that can access the patient context data via usePatientProvider.
 * @returns JSX Element wrapping children in PatientContext.Provider.
 */
export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const { patientsList, isLoading, isError, refetchPatients } = usePatientsHook();
  const [currPatientId, setCurrPatientId] = useState<string | null>(null); // State to store the current patient ID


  return (
    <PatientContext.Provider value={{ patientsList, isLoading, isError, refetchPatients, currPatientId, setCurrPatientId }}>
      {children}
    </PatientContext.Provider>
  );
};

/**
 * Custom hook that allows access to the patient context.
 * @returns The context value, which includes patient data and helper functions.
 * @throws Error if used outside of the PatientProvider. 
 */
export const usePatientProvider = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};