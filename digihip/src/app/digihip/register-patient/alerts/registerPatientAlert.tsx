
/**
 * 
 */

import React, { useState, useEffect} from "react";
import styles from "@/digihip/register-patient/css/RegPatientForm.module.css"

interface Props {
    option: "numericError" | "missingFieldError" | "pntExistsError" | "handleSubmit";
    field?: string;
    state?: boolean | null;
    errorMessage?: string;
    onClose?: () => void;
}


/**
 * 
 * @param param0 
 * @returns 
 */
const RgPtAlert: React.FC<Props> = ({ option, field, state, errorMessage, onClose}) => {

    const [message, setMessage] = useState<string | null>(null);
    const [showSpin, setShowSpin] = useState(true);

    useEffect(() => {
        if (option === "handleSubmit" && state === true) {
            setMessage("Η διαδικασία βρίσκεται σε εξέλιξη");

            const timer = setTimeout(() => {
                setMessage("Η εγγραφή ολοκληρώθηκε με επιτυχία");
                setShowSpin(false);
            }, 3000);

            // Cleanup timer
            return () => clearTimeout(timer);
        }
        
        if (option === "handleSubmit" && state === false) {
            setMessage("Η διαδικασία βρίσκεται σε εξέλιξη");

            const timer = setTimeout(() => {
                setMessage("Προέκυψε κάποιο σφάλμα κατά την διαδικασία της εγγραφής");
                setShowSpin(false);
            }, 3000);

            // Cleanup timer
            return () => clearTimeout(timer);
        }
    }, [option, state]);

    switch(option) {
        case "numericError":
            return (
                <div className={styles.numValidity}>
                    <span className={styles.numImportant}>!</span>
                    <p>Το πεδίο <b>{field}</b> πρέπει να αποτελείται μόνο από αριθμούς.</p>
                </div>
            );
            
        case "missingFieldError":
            return (
                <div className={styles.numValidity}>
                    <span className={styles.numImportant}>!</span>
                    <p>Το πεδίο <b>{field}</b> είναι υποχρεωτικό</p>
                </div>
            );
        case "pntExistsError":
            return (
                <div className={styles.numValidity}>
                    <span className={styles.numImportant}>!</span>
                    <p>Υπάρχει ήδη εγγραμένος ασθένης με αυτό το <b>{field}</b></p>
                </div>
            );
        case "handleSubmit":
            return (
                <div className={styles.submitState}>
                    {showSpin ? (
                        <>
                            <span className={styles.spinner} />
                            <p>{message}</p>
                        </>
                    ) : (
                        <>
                            <div className={`${styles.checkMark} ${state ? styles.successMark : styles.failureMark}`}>
                                {state ? "✔" : "✗"}
                            </div>
                            <p className={state ? styles.success : styles.failure}>{message}</p>
                            {!state && errorMessage && (
                                <p className={styles.errorDetail}>{errorMessage}</p>
                            )}
                            {!state && onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.retryButton}
                                >
                                    Δοκιμάστε Ξανά
                                </button>
                            )}
                        </>
                    )}
                </div>
            );
        default: 
            return <></>;
    }
};

export default RgPtAlert;