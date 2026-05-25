"use client";

import { useState } from "react";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import Tooltip from "@/components/Appointments/HoverExistingApptModal/Tooltip";
import { formatTime } from "@/utils/date/dateUtils";

import stylesMonth from "@/digihip/appointments/css/MonthlyContent.module.css";
import { GoDotFill } from "react-icons/go";
import { format } from "date-fns"; // ✅ Correct format function

type Appointment = AppointmentInterface | null;

const AppointmentItem: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    // ✅ Add missing state hooks
    const [, setCurrApptId] = useState<string | null>(null);
    const [, setPreviewAppointment] = useState<Appointment | null>(null);

    return (
        <div
            className={stylesMonth.appointmentItem}
            onClick={() => {
                setCurrApptId(appointment?._id ?? ""); // ✅ Fix possible null error
                setPreviewAppointment(appointment); // ✅ Fix function name
            }}
        >
            <GoDotFill color="green" />
            <p>
                {formatTime(appointment?.datetime ?? new Date())}{" "}
                {` ${appointment?.patient?.firstname || ""} ${appointment?.patient?.lastname || ""}`}
            </p>

            <Tooltip
                date={appointment?.datetime ? format(new Date(appointment.datetime), "yyyy-MM-dd") : "N/A"} // ✅ Fix formatDate issue
                time={new Date(appointment?.datetime ?? new Date()).toLocaleTimeString("el", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                pntName={`${appointment?.patient?.firstname || ""} ${appointment?.appointmentPatient?.lastname || ""}`}
                apptReason={appointment?.reason ?? "N/A"}
                docName={appointment?.doctor ?? "N/A"}
            />
        </div>
    );
};

export default AppointmentItem;
