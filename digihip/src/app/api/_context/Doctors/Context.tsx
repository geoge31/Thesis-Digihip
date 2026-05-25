
/**
 * @/app/api/content/AdminContext.tsx => Implementation
 * providing doctors data to any component that needs it
*/

// "use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorData } from '@/utils/interfaces/interfaceModules';


type DoctorsData = DoctorData[] | null;
type CurrentDoctorData = DoctorData | null;

interface DoctorContextType {
  doctorsList: DoctorsData | null;
  currentDoctorData: CurrentDoctorData | null;
  setDoctorsList: React.Dispatch<React.SetStateAction<DoctorsData>>;
  setCurrentDoctorData: React.Dispatch<React.SetStateAction<CurrentDoctorData>>;
  findDoctorByUsername: (usernameOrEmail: string, password: string) => Promise<{status: number, success: boolean, username?: string, message?: string}>;
  fetchDoctorsUsernames: (usernameOrEmail: string) => Promise<{success: boolean, doctors: { username: string; email: string }[]}>;
  logOut: () => void;
  loading: boolean;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

/**
 * 
 * @param param0 
 * @returns 
 */
export const DoctorProvider = ({children}: {children: ReactNode}) => {

  const [doctorsList, setDoctorsList] = useState<DoctorsData>(null);
  const [currentDoctorData, setCurrentDoctorData] = useState<CurrentDoctorData>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * 
   * @param usernameOrEmail 
   * @param password 
   * @returns 
   */
  const findDoctorByUsername = async (usernameOrEmail: string, password: string) => {

    const response = await fetch('/api/doctors/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({usernameOrEmail,password}),
    });

    const data = await response.json();

    if(response.ok) {

      const { doctor, token } = data;

      localStorage.setItem('token', token);

      setCurrentDoctorData(doctor);

      return { 
        success: true,
        status: response.status,
        message: data.message, 
        username: doctor.username 
      };
    } else {
      return {
        success: false, 
        message: data.message, 
        status: response.status,
      };
    }

  };

  /**
   * 
   * @returns 
   */
  const fetchDoctorsUsernames = async (): Promise<{ success: boolean, doctors: { username: string; email: string }[];
}> => {
  try {
    const response = await fetch('/api/doctors/usernames', {
      method: 'GET',
    });

    if (!response.ok) {
      return { success: false, doctors: [] };
    }

    const data = await response.json();
    return { success: true, doctors: data.doctors || [] };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { success: false, doctors: [] };
  }
};

/**
 * 
 */
  const logOut = () => {

    localStorage.removeItem('token');
    setCurrentDoctorData(null)
    router.push('/');
  };
  
  /**
   * 
   */
  useEffect(() => {

    const fetchCurrentDoctorData = async () => {

      const token = localStorage.getItem('token'); 

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/doctors/protected', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in Authorization header
          },
        });

        const data = await response.json();

        if (response.ok && data) {
          setCurrentDoctorData(data); 
        } else {
          setCurrentDoctorData(null); 
        }
      } catch (error) {
        console.error("Error fetching current admin data:", error);
        setCurrentDoctorData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentDoctorData();
  }, []);
  
  return (
    <DoctorContext.Provider value={
        { 
          doctorsList, 
          currentDoctorData, 
          setDoctorsList, 
          setCurrentDoctorData, 
          findDoctorByUsername, 
          fetchDoctorsUsernames,
          logOut, 
          loading
        }
      }>
      {children}
    </DoctorContext.Provider>
  );
};

/**
 * Custom hook: useDoctor to use the admin/s data in each component
 * @returns 
 */
export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within an DoctorProvider');
  }
  return context;
};


