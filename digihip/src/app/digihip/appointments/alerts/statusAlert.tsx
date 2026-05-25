/**
 * 
 */

import React from 'react';
import styles from '@/digihip/appointments/css/SuccessAlert.module.css'
import { GrClose } from 'react-icons/gr';

interface CustomAlertProps {
    message: string | null;
    type: 'success' | 'error' | 'default';
    onClose: () => void;
}

const ApptStatusAlert: React.FC<CustomAlertProps> = ({ message, type, onClose }) => {
    
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
};

export default ApptStatusAlert;