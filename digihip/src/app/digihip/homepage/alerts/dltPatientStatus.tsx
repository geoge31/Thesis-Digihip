/**
 * @geoge31
 * @path @/src/app/digihip/homepage/alerts/
 * @file dltPatientStatus.tsx
 */

import React from "react";
import styles from "@/digihip/homepage/css/DeletePatientStatus.module.css"
import { GrClose } from "react-icons/gr";

interface CustomAlertProps {
    message: string | null;
    type: 'success' | 'error' | 'default';
    onClose: () => void;
}

const DeleteStatusAlert : React.FC<CustomAlertProps> = ({ message, type, onClose}) => {

    return (
        <div className={`${styles.alert} ${styles[type]}`}>
            <div className={styles.mssg}><p>{message}</p></div>
            <div className={styles.bttn}>
                <button
                    type='button'
                    title='close'
                    onClick={onClose}>{<GrClose/>}
                </button>
            </div>
            
        </div>
    );
}

export default DeleteStatusAlert;