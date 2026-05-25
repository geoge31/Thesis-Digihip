/**
 * @path
 * @geoge31
 */

import React from "react";
import styles from '@/digihip/homepage/css/DeletePatient.module.css'


interface CustomAlertProps {
    patient: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const DeletePatientAlert: React.FC<CustomAlertProps> = ({ patient, onCancel, onConfirm }) => {
    return (
        <>
                <div className={styles.dltPatientAlert}>
                    <div className={styles.container}>
                        <div className={styles.textContainer}>
                            <p>Επιθυμείτε να διαγράψετε οριστικά τ@ν ασθενή :  <b className={styles.bold}>{patient}</b> ;</p>
                            <p>Πατώντας <u>Διαγραφή</u> @ ασθενής θα διαγραφεί οριστικά και η ενέργεια αυτή δεν μπορεί να ανακληθεί.</p>
                        </div>
                        <div className={styles.buttonsContainer}>
                            <button
                                type='button'
                                title='cancel'
                                name='cncl'
                                id='cncl'
                                onClick={onCancel}>Ακύρωση
                            </button>
                            <button
                                type='button'
                                title='delete'
                                name='dlt'
                                id='dlt'
                                onClick={onConfirm}>Διαγραφή
                            </button>
                        </div>
                    </div>
                </div>
        </>
    );
}

export default DeletePatientAlert;