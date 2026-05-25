/**
 * Custom alert modal
 * @gioge31
 * Implementation
 */

import React from "react";
import styles from "@/customUtils/alerts/css/wrongPassword.module.css";


interface CustomAlertProps {
    message: string;
    messageNew: string;
    onClose: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CustomAlert: React.FC<CustomAlertProps> = ({ message, messageNew, onClose}) => {

    return(
        <div className={styles.alertModal}>
            <div className={styles.alertContent}>
                <p>{message}</p>
                <p>{messageNew}</p>
                <button 
                    className={styles.btnAction}
                    onClick={onClose}>
                        Συνέχεια
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;