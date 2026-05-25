/**
 * path: @src/app/digihip/homepage/methods/delete/deletePatient.tsx
 * @file deletePatient.tsx
 * This helper function implements the soft-deletion of a patient.
 * The patient is moved to the DeletedPatients collection with a reason and doctor info.
 *  @geoge31
 */

/**
 * Soft-deletes a patient by ID, storing the reason and doctor who performed the deletion.
 * @param patientId - The ID of the patient to delete.
 * @param reason - The reason for the deletion.
 * @param doctorName - The username of the doctor performing the deletion.
 * @returns A boolean indicating success or failure.
 */
export const deletePatientById = async (patientId: string | null, reason: string, doctorName: string) => {

    if(!patientId) {
        console.error('no patient id received');
        return false;
    }

    if(!reason || reason.trim().length === 0) {
        console.error('no deletion reason provided');
        return false;
    }

    if(!doctorName) {
        console.error('no doctor name provided');
        return false;
    }

    console.log('patient id received: ', patientId);

    const token = localStorage.getItem('token');

    if(!token) {
        console.error('Unathorized User');
        return false;
    }

    try {
        const response = await fetch(`/api/patients/soft-delete`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: patientId, reason, doctorName }),
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Failed to delete patient', response.statusText);
            throw new Error(errorData.mesage || 'Failed to delete patient');
        }

        return true;
    } catch (error: unknown) {
        if(error instanceof Error){
        console.error('Error deleting patient: ', error);
        }
        return false;
    }
}