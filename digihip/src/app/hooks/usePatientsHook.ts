/**
 * Custom hook for fetching and managing patient data.
 */

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
// import { PatientData } from "@/utils/interfaces/interfaceModules";
import { PatientInterface } from "@/utils/interfaces/patient";

/**
 * Make an authenticated API request.
 *
 * @param endpoint - API endpoint to fetch data from (relative to the base API URL).
 * @returns A Promise resolving to the JSON response.
 * @throws an error if the request fails or the token is missing.
 */
const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch ${endpoint}: ${response.status} ${
          response.statusText
        }${errorResponse?.message ? ` - ${errorResponse.message}` : ""}`
      );
    }

    return await response.json(); // Ensures a value is always returned
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in apiRequest function:", error);
      throw new Error(
        `An error occurred while making the API request: ${error.message}`
      );
    }
  }

  throw new Error("Unexpected error: apiRequest did not return a value."); // Ensure function always returns
};

/**
 * Update `isPreoperation` status for eligible patients.
 * @param patients List of patients fetched from the API.
 * @returns Updated list of patients.
 */
const updatePreoperationStatus = async (
  patients: PatientInterface[]
): Promise<PatientInterface[]> => {
  const today = new Date();

  // Identify patients who need updates
  const patientsToUpdate = patients.filter(
    (patient) =>
      !patient.manualStage &&
      patient.isPreoperation &&
      patient.operationDate &&
      new Date(patient.operationDate) <= today
  );

  // Process updates for these patients
  const updatedPatients = await Promise.all(
    patientsToUpdate.map(async (patient) => {
      try {
        await fetch(`/api/patients/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            pId: patient._id,
            updates: { isPreoperation: false, currentStage: "ΜΕΤΕΓΧΕΙΡΗΤΙΚΟ" },
          }),
        });

        return { ...patient, isPreoperation: false }; // Return updated patient
      } catch (error) {
        console.error(`Failed to update patient ${patient._id}:`, error);
        return patient; // Return original patient in case of failure
      }
    })
  );

  // Combine updated patients with those that required no updates
  return [
    ...updatedPatients,
    ...patients.filter((patient) => !patientsToUpdate.includes(patient)),
  ];
};

/**
 * Hook for fetching and managing patient data.
 * @returns Patients list with updated `isPreoperation` statuses.
 */
export const usePatientsHook = () => {
  const { data, error } = useSWR<PatientInterface[]>("/api/patients/fetch", apiRequest)
  const [patientsList, setPatientsList] = useState<PatientInterface[] | null>(null);

  useEffect(() => {
    if (data) {
      console.log("Fetched data : ", data);
      const processPatients = async () => {
        const updatedPatientsArray = await updatePreoperationStatus(data);
        console.log("Updated patients array :  ", updatedPatientsArray);
        setPatientsList(updatedPatientsArray);
      };
      processPatients();
    }
  }, [data]);

  // Function to trigger a refetch of patient data
  const refetchPatients = () => {
    mutate("/api/patients/fetch");
  };

  return {
    patientsList,
    isLoading: !error && !data,
    isError: error,
    refetchPatients,
  };
};
