/**
 * 
 */

import React from "react";
import styles from "@/digihip/appointments/modules/MonthlyView/monthlyView.module.css";

interface TooltipProps {
    date: string;
    time: string;
    pntName: string;
    apptReason: string | null;
    docName: string | null;
    onPatientClick?: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ date, time, pntName, apptReason, docName, onPatientClick}) => {
    return (
        <div className={styles.tooltip}>
          <ul>
            <li>
              <b>{date} | {time}</b>
            </li>
            <li
              className={styles.clickPatient}
              onClick={onPatientClick}
            >
              Ασθενής <u>{pntName}</u>
            </li>
            <li>
              Αιτιολογία: {apptReason}
            </li>
            <li>
              Ιατρός: {docName}
            </li>
          </ul>
        </div>
      );
};

export default Tooltip;