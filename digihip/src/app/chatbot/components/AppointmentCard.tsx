/**
 * AppointmentCard.tsx
 * @title Appointment Card
 * @description Renders a patient's appointments as structured cards inside the chatbot
 * @file src\app\chatbot\components\AppointmentCard.tsx
 *
 * @version 1.3
 * @date 21/05/2026
 * 
 * @author Evangelia Andredaki [csd4588]
 **/

import React from "react";
import styles from "./ChatWidget.module.css";

export interface AppointmentEntry {
    datetime: string;
    reason:   string | null;
    upcoming: boolean;
}

interface Props {
    patientName: string;
    data:        AppointmentEntry[];
}

export default function AppointmentCard({ patientName, data }: Props) {
    const upcoming = data.filter((a) => a.upcoming);
    const past     = data.filter((a) => !a.upcoming);

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Ραντεβού</span>
                <span className={styles.cardSubtitle}>{patientName}</span>
            </div>
            <div className={styles.cardMeta}>
                {upcoming.length} επερχόμενα &middot; {past.length} παρελθοντικά
            </div>
            <div className={styles.cardList}>
                {upcoming.length > 0 && (
                    <>
                        <div className={styles.apptSectionLabel}>Επερχομενα</div>
                        {upcoming.slice(0, 5).map((a, i) => (
                            <div key={i} className={`${styles.cardEntry} ${styles.apptUpcoming}`}>
                                <div className={styles.cardEntryDate}>{a.datetime}</div>
                                {a.reason && (
                                    <div className={styles.apptReason}>{a.reason}</div>
                                )}
                            </div>
                        ))}
                    </>
                )}
                {past.length > 0 && (
                    <>
                        <div className={styles.apptSectionLabel}>Παρελθοντικα</div>
                        {past.slice(-3).map((a, i) => (
                            <div key={i} className={`${styles.cardEntry} ${styles.apptPast}`}>
                                <div className={styles.cardEntryDate}>{a.datetime}</div>
                                {a.reason && (
                                    <div className={styles.apptReason}>{a.reason}</div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
