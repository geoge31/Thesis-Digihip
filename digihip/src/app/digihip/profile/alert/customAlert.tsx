/**
 * Custom Alert
 * This component provides the alert of a successful ? unsuccessful update of a doctor for Digihip application
 * src>app>digihip>profile>alert
 */

import React from "react";
import styles from "@/digihip/profile/css/CustomAlert.module.css";

interface AlertProps {
    message: string | null;
    option: number | null;
    onClose: () => void;
}

const CustomAlert: React.FC<AlertProps> = ({ message, option ,onClose}) => {
    
    switch(option){
        case 1:
            return (
                <div className={styles.alertContainer}>
                    <div className={styles.successAlert}>
                        <p>{message}</p>
                        <button onClick={onClose}>Χ</button>
                    </div>
                </div>
            );
        case 0: 
        return (
            <div className={styles.alertContainer}>
                <div className={styles.errorAlert}>
                    <p>{message}</p>
                    <button onClick={onClose}>Χ</button>
                </div>
            </div>
        );
        default: 
            return (
                <div>an error occured</div>
            );
    }
};

export default CustomAlert;