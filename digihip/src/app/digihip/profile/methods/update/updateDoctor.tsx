/**
 * Update Doctor Method
 * This function provides the update method for a Doctor for DiGiHip application
 * @path @/src/app/digihip/profile/methods/update
 * @geoge31
 */

type Doctor = {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const updateDoctor = async (doctorId: string, updates: Partial<Doctor>) => {

  const token = localStorage.getItem("token");
  
  if (!token) {
    console.error("User is not authenticated");
    return;
  }

  try {

    const response = await fetch(`/api/doctors/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: doctorId, updates }),
    }); 

    const result = await response.json();

    if (response.ok) {
      console.log('Doctor updated successfully', result);
      return result;
    } else {
      console.error('Failed to update doctor:', result.message || result.error);
    }
  } catch (error) {
    console.error('Error updating doctor:', error);
  }
};
