/**
 * Update Patient Method
 * This function provides the update method for a Patient in DiGiHip application
 * @path @/src/app/digihip/patient-details/methods/update
 * @file updatePatient.tsx
 * @geoge31
 */


import { PatientData } from "@/utils/interfaces/interfaceModules";

export const updatePatient = async (patientId: string, updates: Partial<PatientData>, changedFields?: string[]) => {
    
    const token = localStorage.getItem('token');

    if(!token) {
        console.error('User is not authenticated');
        return;
    }

    console.log('Sending payload:', { pId: patientId, updates }); // Add debugging here
    
    try {
        const response = await fetch(`/api/patients/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pId: patientId, updates, changedFields }),
        });

        const result = await response.json();

        if(response.ok) {
            console.log('Patient updated successfully', result);
            return result;
        } else {
            console.error('Failed to update patient (updatePatient.tsx) : ', result.message || result.error);
        }
    } catch (error) {
        console.error('Error updating doctor (updatePatient.tsx)', error)
    }
};