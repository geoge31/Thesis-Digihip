/**
 * @geoge31
 * @path @/src/app/digihip/appointments/methods/patch
 */

import { AppointmentInterface } from '@/utils/interfaces/appointment';

/**
 * 
 * @param doctorId 
 * @param appointmentId 
 * @param updates 
 * @returns 
 */
export const updateAppointment = async (doctorId: string, appointmentId: string, updates: Partial<AppointmentInterface>) => {

    const token = localStorage.getItem('token');

    if(!token) {
        console.error('Unathorized User');
        return;
    }

    try {
        const response = await fetch(`/api/appointments/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({id: doctorId, _id: appointmentId, updates }),
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Failed to update appointment', response.statusText);
            throw new Error(errorData.message || 'Failed to update appointment')
        }
        const data = await response.json();

        return data;
    } catch (error: unknown) {
        if(error instanceof Error){
        console.error('Error udating appointment: ', error);
        }
    }
};
