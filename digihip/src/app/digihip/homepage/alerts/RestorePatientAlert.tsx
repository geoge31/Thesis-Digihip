/* /src/app/digihip/homepage/alerts */

import React, { useState } from "react";
import styles from "@/digihip/homepage/css/RestorePatientAlert.module.css";
import { DeletedPatientInterface } from "@/utils/interfaces/deletedPatient";

interface RestorePatientAlertProps {
    deletedPatient: DeletedPatientInterface;
    onCancel: () => void;
    onConfirm: () => void;
}

const CONFIRMATION_WORD = "ΕΠΑΝΑΦΟΡΑ";

const RestorePatientAlert: React.FC<RestorePatientAlertProps> = ({ deletedPatient, onCancel, onConfirm }) => {

    const [confirmText, setConfirmText] = useState("");

    const patientData = deletedPatient.patientData;
    const fullname = `${patientData.firstname ?? ""} ${patientData.lastname ?? ""}`;

    const isConfirmValid = confirmText.trim() === CONFIRMATION_WORD;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3>Στοιχεία Διαγραμμένου Ασθενή</h3>
                </div>
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ονοματεπώνυμο:</span>
                            <span>{fullname}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>ΑΜΚΑ:</span>
                            <span>{(patientData.amka as string) ?? "-"}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Λόγος Διαγραφής:</span>
                            <span>{deletedPatient.deletionReason}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Διαγράφηκε από:</span>
                            <span>{deletedPatient.deletedBy}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ημερομηνία Διαγραφής:</span>
                            <span>{new Date(deletedPatient.deletedAt ?? "").toLocaleDateString("el-GR")}</span>
                        </div>
                    </div>
                    <div className={styles.restoreSection}>
                        <p className={styles.restoreWarning}>
                            Η επαναφορά ασθενή δεν πρέπει να γίνεται συχνά. Για να επιβεβαιώσετε, πληκτρολογήστε <b>{CONFIRMATION_WORD}</b> παρακάτω:
                        </p>
                        <input
                            type="text"
                            className={styles.confirmInput}
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Πληκτρολογήστε ${CONFIRMATION_WORD}`}
                        />
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button type="button" name="cncl" onClick={onCancel}>Κλείσιμο</button>
                    <button
                        type="button"
                        name="restore"
                        onClick={onConfirm}
                        disabled={!isConfirmValid}
                        className={isConfirmValid ? styles.restoreActive : styles.restoreDisabled}
                    >
                        Επαναφορά Ασθενή
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestorePatientAlert;
