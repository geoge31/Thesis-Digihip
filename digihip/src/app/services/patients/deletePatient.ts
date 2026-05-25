/**
 * path:  
 * @file
 * author: @geoge31
 */

/**
 * Deletes a patient by ID.
 * @param patientId - The ID of the patient to delete.
 * @returns A boolean indicating success or failure.
 */
export const DELETE_Patient = async (patientId: string | null) => {

    if(!patientId) {
        console.error('no patient id received');
        return false;
    }

    console.log('patient id received: ', patientId);

    const token = localStorage.getItem('token');

    if(!token) {
        console.error('Unathorized User');
        return;
    }

    try {
        const response = await fetch(`/api/patients/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: patientId }),
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Failed to delete patient', response.statusText);
            throw new Error(errorData.mesage || 'Failed to delete patient');
            // return false;
        }

        // const data = await response.json();

        return true;
    } catch (error: unknown) {
        if(error instanceof Error){
        console.error('Error deleting patient: ', error);
        }
    }
}