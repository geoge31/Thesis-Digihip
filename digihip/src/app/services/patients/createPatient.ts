/**
 * @path /digihip/src/app/services/patients/
 * @file createPatient.tsx
 * @author: @geoge31
 */

import { NewPatient } from "@/utils/interfaces/patient";

/**
 * 
 * @param newPatient 
 * @returns 
 */
export const CreatePatient = async (newPatient: NewPatient) => {
  let errorCase = "";

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Unathorized User");
    return {
      state: false,
      error: "missingToken",
      message: "Unathorized: Token is missing",
    };
  }

  try {
    const response = await fetch(`/api/patients/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newPatient),
    });

    if (!response.ok) {
      const errorData = await response.json();
      switch (errorData.errorType) {
        case "missingField":
          errorCase = "missingField";
          break;
        case "duplicatedField":
          errorCase = "duplicatedField";
          break;
        default:
          errorCase = "";
          break;
      }
      throw new Error(errorData.message || errorCase);
    }

    const responseData = await response.json();

    return {
      state: true,
      message: "Η εγγραφή ολοκληρώθηκε με επιτυχία",
      patient: responseData.patient
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Response from api: `, error);
      return {
        state: false,
        errorCase,
        message: error.message,
      };
    }
  }
};