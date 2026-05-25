/**
 * QuestionnaireCard.tsx
 * @title Questionnaire Card
 * @description Renders a patient's questionnaire results as structured cards inside the chatbot
 * @file src\app\chatbot\components\QuestionnaireCard.tsx
 * 
 * @version 1.3
 * @date 21/05/2026
 *
 * @author Evangelia Andredaki [csd4588]
 **/

import React from "react";
import styles from "./ChatWidget.module.css";

export interface QuestionnaireEntry {
    date:            string;
    mobility:        number | null;
    selfCare:        number | null;
    usualActivities: number | null;
    pain:            number | null;
    anxiety:         number | null;
}

interface Props {
    patientName: string;
    periodLabel: string;
    data:        QuestionnaireEntry[];
}

const FIELDS: { key: keyof Omit<QuestionnaireEntry, "date">; label: string }[] = [
    { key: "mobility",        label: "Κινητικότητα"         },
    { key: "selfCare",        label: "Αυτοεξυπηρέτηση"      },
    { key: "usualActivities", label: "Συνήθεις δρ/τητες"    },
    { key: "pain",            label: "Πόνος"                 },
    { key: "anxiety",         label: "Άγχος / Κατάθλιψη"    },
];

function ScoreRow({ label, value }: { label: string; value: number | null }) {
    const filled = value ?? 0;
    return (
        <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>{label}</span>
            <div className={styles.scoreDots}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <span
                        key={n}
                        className={styles.scoreDot}
                        style={{ backgroundColor: n <= filled ? "#2d7dd2" : "#d0d0d0" }}
                    />
                ))}
            </div>
            <span className={styles.scoreValue}>{value != null ? `${value}/5` : "—"}</span>
        </div>
    );
}

export default function QuestionnaireCard({ patientName, periodLabel, data }: Props) {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Ερωτηματολόγια</span>
                <span className={styles.cardSubtitle}>{patientName}</span>
            </div>
            <div className={styles.cardMeta}>
                {periodLabel} &middot; {data.length} εγγραφ{data.length === 1 ? "ή" : "ές"}
            </div>
            <div className={styles.cardList}>
                {data.map((q, i) => (
                    <div key={i} className={styles.cardEntry}>
                        <div className={styles.cardEntryDate}>{q.date}</div>
                        {FIELDS.map((f) => (
                            <ScoreRow key={f.key} label={f.label} value={q[f.key]} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
