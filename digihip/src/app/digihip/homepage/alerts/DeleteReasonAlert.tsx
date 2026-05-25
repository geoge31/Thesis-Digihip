/* /src/app/digihip/homepage/alerts */

import React, { useState } from "react";
import styles from "@/digihip/homepage/css/DeleteReasonAlert.module.css";

interface DeleteReasonAlertProps {
    patient: string | null;
    onCancel: () => void;
    onConfirm: (reason: string) => void;
}

const DeleteReasonAlert: React.FC<DeleteReasonAlertProps> = ({ patient, onCancel, onConfirm }) => {

    const [step, setStep] = useState<1 | 2>(1);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleNext = () => {
        if (!reason.trim()) {
            setError("Παρακαλούμε συμπληρώστε τον λόγο διαγραφής.");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleConfirm = () => {
        onConfirm(reason.trim());
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                {step === 1 && (
                    <>
                        <div className={styles.header}>
                            <h3>Διαγραφή Ασθενή</h3>
                        </div>
                        <div className={styles.body}>
                            <p>
                                Ασθενής: <b>{patient}</b>
                            </p>
                            <label htmlFor="deletionReason">Λόγος Διαγραφής <span className={styles.required}>*</span></label>
                            <textarea
                                id="deletionReason"
                                className={styles.textarea}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Συμπληρώστε τον λόγο διαγραφής..."
                                rows={4}
                            />
                            {error && <p className={styles.error}>{error}</p>}
                        </div>
                        <div className={styles.buttons}>
                            <button type="button" name="cncl" onClick={onCancel}>Ακύρωση</button>
                            <button type="button" name="next" onClick={handleNext}>Συνέχεια</button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <div className={styles.header}>
                            <h3>Επιβεβαίωση Διαγραφής</h3>
                        </div>
                        <div className={styles.body}>
                            <p>
                                Είστε σίγουροι ότι θέλετε να διαγράψετε τ@ν ασθενή <b>{patient}</b>;
                            </p>
                            <div className={styles.reasonPreview}>
                                <span>Λόγος:</span>
                                <p>{reason}</p>
                            </div>
                            <p className={styles.warning}>
                                Ο/Η ασθενής θα αφαιρεθεί από τη λίστα ασθενών και θα μεταφερθεί στις πρόσφατες διαγραφές.
                            </p>
                        </div>
                        <div className={styles.buttons}>
                            <button type="button" name="back" onClick={handleBack}>Πίσω</button>
                            <button type="button" name="dlt" onClick={handleConfirm}>Διαγραφή</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeleteReasonAlert;
