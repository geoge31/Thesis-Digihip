//  @/app/customUtils/confirms/deleteConfirmation/page.tsx => Implementation

import React from "react";
import styles from "./css/CustomConfirm.module.css"

interface CondfirmProps {
    message1: string;
    message2: string;
    name: string;
    onConfirm: () => void; 
    onCancel: () => void;
    category: string  
}

const CustomConfirm: React.FC<CondfirmProps> = ({ message1, message2, name, onConfirm, onCancel, category }) => {

    switch(category) {
        case "deleteAction" :
            return <div className={styles.confirmModal}>
                        <div className={styles.confirmContent}>
                            <h4>{message1} {name}</h4>
                            <div className={styles.hContent}><h5>{message2}</h5></div>
                            
                            <div className={styles.buttonGroup}>
                                <button className={styles.btnCancel} onClick={onCancel}>
                                    Ακύρωση
                                </button>
                                <button className={styles.btnDelAction} onClick={onConfirm}>
                                    Επιβεβαίωση
                                </button>
                            </div>
                        </div>
                    </div>;
        case "proceedAction":
            return <div className={styles.confirmModal}>
            <div className={styles.confirmContent}>
                <h4>{message1}</h4>

                {/* <div className={styles.hContent}><h5>{message2}</h5></div> */}
                <div className={styles.buttonGroup}>
                    <button className={styles.btnCancel} onClick={onCancel}>
                        Ακύρωση
                    </button>
                    <button className={styles.btnProcAction} onClick={onConfirm}>
                        Υποβολή
                    </button>
                </div>
            </div>
        </div>;
    }
    // return (
    //     <div className={styles.confirmModal}>
    //         <div className={styles.confirmContent}>
    //             <h4>{message1} {name}</h4>
    //             <div className={styles.hContent}><h5>{message2}</h5></div>
                
    //             <div className={styles.buttonGroup}>
    //                 <button className={styles.btnCancel} onClick={onCancel}>
    //                     Ακύρωση
    //                 </button>
    //                 <button className={styles.btnAction} onClick={onConfirm}>
    //                     Επιβεβαίωση
    //                 </button>
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default CustomConfirm;