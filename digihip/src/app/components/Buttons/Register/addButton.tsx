/**
 * 
 */

{/**
    ------------------
    | Προσθήκη value |
    ------------------
*/}

import React, { ReactNode } from "react";
import styles from "./AddButton.module.css"

interface AddBtnProps {
    onRegister: () => void;
    value: string;
    children: ReactNode;
}

const AddButton: React.FC<AddBtnProps> = ({ onRegister, children, value }) => {
    return (
        <div className={styles.addButtonContainer}>
            <button
                type="button"
                className={styles.addButton}
                title={`${value}`}
                onClick={onRegister}
            >
                { children }
            </button>
        </div>
    );
};

export default AddButton;
