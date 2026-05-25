/**
 * @geoge31
 * @path @/src/app/digihip/appointments/METHODS/PATCH
 */

import { AppointmentInterface } from '@/utils/interfaces/appointment';

/**
 * 
 * @param doctorId 
 * @param newAppointmentData 
 * @returns 
 */
export const CreateAppointment = async (doctorId: string, newAppointmentData: AppointmentInterface) => {

    const token = localStorage.getItem('token');
    
    if(!token) {
        console.error('Unathorized User');
        return;
    }

    try {
        const response = await fetch(`/api/appointments/post`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: doctorId, newAppointmentData }),
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Failed to post appointment', response.statusText);
            throw new Error(errorData.message || 'Failed to post appointment');
        }

        const data = await response.json();
        
        return data;
    } catch (error: unknown) {
        if(error instanceof Error){
        console.error('Error posting appointment: ', error);
        }
    }

};