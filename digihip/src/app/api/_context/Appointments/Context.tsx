/**
 * 
 * providing appointmetns data to any component that needs it
 * @path @/src/app/api/_context/Appointments
 * @file Context.tsx
 * @author @geoge31
 */

// "use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAppointmentsHook } from '@/hooks/useAppointmentsHook';
import { AppointmentInterface } from '@/utils/interfaces/appointment';


type Appointments = AppointmentInterface[] | null;

interface AppointmentContextType {
    appointmentsList: Appointments;
    isLoading: boolean;
    isError: boolean;
    refetchAppointments: () => void;
    currentAppointmentId: string | null;
    setCurrentAppointmentId: (id: string) => void;
  }
  
const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);
  
/**
 * 
 * @param param0 
 * @returns 
 */
export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { appointmentsList, isLoading, isError, refetchAppointments } = useAppointmentsHook();
    const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  
    return (
      <AppointmentContext.Provider
        value={{
          appointmentsList,
          isLoading,
          isError,
          refetchAppointments,
          currentAppointmentId,
          setCurrentAppointmentId,
        }}
      >
        {children}
      </AppointmentContext.Provider>
    );
};
  

  /**
   * 
   * @returns 
   */
export const useAppointmentProvider = () => {
    const context = useContext(AppointmentContext);
    
    if (!context) {
        throw new Error("useAppointmentProvider must be used within an AppointmentProvider");
    }

    return context;
};