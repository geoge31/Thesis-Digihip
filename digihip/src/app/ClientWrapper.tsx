/**
 * Client Wrapper
 * This component wraps the application with various context providers
 * enabling access to shared datas across different pars of the Digihip application.
 * Usage :
 * - Wraps around children components ensuring that nested components have access to doctor, patient
 *    appointment contexts.
 * @path /src/app || @ 
 * @file ClientWrapper.tsx
 * authors: @geoge31 @aggelosros
 */

"use client";

import { usePathname } from "next/navigation";
import { DoctorProvider } from "@/api/_context/Doctors/Context";
import { PatientProvider } from "@/api/_context/Patients/Context";
import { AppointmentProvider } from "@/api/_context/Appointments/Context";
import { UnreadMessagesProvider } from "@/api/_context/UnreadMessages/Context";
import {NotificationProvider} from "@/api/_context/Notifications/Context"
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ChatWidget from "@/chatbot/components/ChatWidget";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname(); // Get current path
  const isLoginPage = pathname === "/digihip/log-in" || pathname === "/digihip/admin-panel" || pathname === "/digihip/recover";

  return (
    <DoctorProvider>
      <UnreadMessagesProvider>
         {!isLoginPage  && <Navbar />}
         <PatientProvider>
          <NotificationProvider>
            <AppointmentProvider>{children}</AppointmentProvider>
          </NotificationProvider>
        </PatientProvider>
        {!isLoginPage && <Footer />}
        {!isLoginPage && <ChatWidget />}
      </UnreadMessagesProvider>
    </DoctorProvider>
  );
};

export default ClientWrapper;
