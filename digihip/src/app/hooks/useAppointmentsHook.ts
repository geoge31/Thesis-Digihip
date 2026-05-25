/**
 * Hook to fetch and manage appointments
 * path:  @/hooks/useAppointmentsHook
 * author: @gioge31
 */

import useSWR, { mutate } from "swr";
import { AppointmentInterface } from "@/utils/interfaces/appointment";

const apiRequest = async (endpoint: string): Promise<AppointmentInterface[]> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const useAppointmentsHook = () => {
  const { data, error } = useSWR<AppointmentInterface[]>("/api/appointments/fetch", apiRequest);
  const refetchAppointments = () => mutate("/api/appointments/fetch");

  return {
    appointmentsList: data || [],
    isLoading: !error && !data,
    isError: !!error,
    refetchAppointments,
  };
};
