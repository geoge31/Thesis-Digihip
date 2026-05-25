/**
 * DailyReportCard.tsx
 * @title Daily Report Card
 * @description Renders a patient's daily reports as structured cards inside the chatbot
 * @file src\app\chatbot\components\DailyReportCard.tsx
 *
 * @version 1.3
 * @date 21/05/2026
 * 
 * @author Evangelia Andredaki [csd4588]
 **/

import React from "react";
import styles from "./ChatWidget.module.css";

export interface DailyReportEntry {
    date:          string;
    exercisesDone: boolean;
    injectionDone: boolean;
    painLevel:     number | null;
    painCategory:  string | null;
}

interface Props {
    patientName: string;
    periodLabel: string;
    data:        DailyReportEntry[];
}

function PainBar({ level }: { level: number }) {
    const pct = (level / 10) * 100;
    return (
        <div className={styles.painBarWrapper}>
            <div
                className={styles.painBarFill}
                style={{ width: `${pct}%`, backgroundColor: "#2d7dd2" }}
            />
        </div>
    );
}

function Badge({ done, label }: { done: boolean; label: string }) {
    return (
        <span className={done ? styles.badgeYes : styles.badgeNo}>
            {label}: {done ? "Ναι" : "Όχι"}
        </span>
    );
}

export default function DailyReportCard({ patientName, periodLabel, data }: Props) {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Ημερήσιες αναφορές</span>
                <span className={styles.cardSubtitle}>{patientName}</span>
            </div>
            <div className={styles.cardMeta}>
                {periodLabel} &middot; {data.length} εγγραφ{data.length === 1 ? "ή" : "ές"}
            </div>
            <div className={styles.cardList}>
                {data.map((r, i) => (
                    <div key={i} className={styles.cardEntry}>
                        <div className={styles.cardEntryDate}>{r.date}</div>
                        <div className={styles.cardEntryBadges}>
                            <Badge done={r.exercisesDone} label="Ασκήσεις" />
                            <Badge done={r.injectionDone} label="Ένεση" />
                        </div>
                        <div className={styles.cardEntryPain}>
                            <span className={styles.painLabel}>
                                Πόνος: {r.painLevel != null ? `${r.painLevel}/10` : "—"}
                                {r.painCategory ? ` · ${r.painCategory}` : ""}
                            </span>
                            {r.painLevel != null && <PainBar level={r.painLevel} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
