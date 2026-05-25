/**
 * 
 */

import React, { useState } from 'react';
import styles from './css/styling.module.css';
import { preInstructions } from '@/utils/instructions/instructionsModule';
import { updatePatient } from '../methods/update/updatePatient';
import HandleCases from '@/components/HandleCases/HandleCases';


interface PreInstructionsProps {
    patientToUpdate: string;
    selectedItems: string[];
    onSelectionChange: (selectedItems: string[]) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const PreInstructionsChecklist: React.FC<PreInstructionsProps> = ({ patientToUpdate, selectedItems, onSelectionChange }) => {

    const [editMode, setEditMode] = useState(false);
    const [backupPreInstructions, setBackupPreInstructions] = useState<string[]>([]);
    const [newPreInst] = useState<string[]> ([]);
    const [modalState, setModalState] = useState<{ message: string; option: "loading" | "success" | "fail"; visibility: boolean }>({
        message: "", option: "success", visibility: false,
    });
    const handleModal = (message: string, option: "loading" | "success" | "fail", show: boolean) => {
        setModalState({ message, option, visibility: show});
    };

    const handleItemClick = (value: string) => {
        const updatedSelection = selectedItems.includes(value)
            ? selectedItems.filter((item) => item !== value)
            : [...selectedItems, value];
        onSelectionChange(updatedSelection);
    };

    const EditMode = () => {
        setBackupPreInstructions(selectedItems);
        setEditMode(true);
    }; 

    const Cancel = () => {
        onSelectionChange(backupPreInstructions);
        setEditMode(false);
    };

    const Save = () => {
        updatePreOpInstr({ preInstructions: newPreInst});
        setEditMode(false);
    }

    const updatePreOpInstr = async (updates: {preInstructions: string[]}) => {

        console.log('Updating preInstructions with:', updates); // Debugging
        if (!updates) {
            console.warn('No updates to apply.');
            handleModal('Δεν ανιχνεύθηκαν αλλαγές.', 'fail', true);
            return;
        }
        handleModal('Ενημέρωση προεγχειρητικών οδηγιών. Παρακαλούμε περιμένετε...', 'loading', true);
        try {
            const result = await updatePatient(patientToUpdate, updates);

            if(!result) {
                handleModal('Αποτυχία ενημέρωσης προεγχειρητικών οδηγιών.', 'fail', true);
                return;
            }

            handleModal('Οι προεγχειρητικές οδηγίες ενημερώθηκαν επιτυχώς.', 'success', true);
        } catch(error) {
            console.error("Failed to update pre-instructions:", error);
            handleModal("Αποτυχία αποθήκευσης αλλαγών.", "fail", true);
        }
    }

    return (
        <>
            <div className={styles.checklist}>
                <div className={styles.checklistSections}>
                    <input 
                        type="search"
                        title='search'
                        placeholder='Αναζήτηση Προεγχειρητικών Οδηγιών'
                    />
                    {!editMode ? (
                        <div className={styles.notEditMode}>
                            <button
                                type='button'
                                title='Επεξεργασία'
                                onClick={EditMode}
                                name='edit'>Επεξεργασία
                            </button>
                        </div>
                    ) : (
                        <div className={styles.EditMode}>
                            <button
                                type='button'
                                title='Ακύρωση'
                                name='cancel'
                                onClick={Cancel}>Ακύρωση
                            </button>
                            <button
                                type='button'
                                title='Αποθήκευση'
                                name='save'
                                onClick={Save}>Αποθήκευση
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.checklistContent}>
                    {preInstructions.map((instruction) => (
                        <div
                            key={instruction.value}
                            className={`${styles.checklistItem} 
                            ${selectedItems.includes(instruction.value) ? styles.checked : ''} 
                            ${!editMode ? styles.checklistItemDisabled : ''}`}
                            onClick={() => editMode ? handleItemClick(instruction.value) : ''}
                        >
                            <div className={styles.item} />
                            <label>{instruction.label}</label>
                        </div>
                    ))}
                </div>
            </div>
          {modalState.visibility && (<HandleCases 
                {...modalState}
                onClose={() => setModalState((prev) => ({ ...prev, visibility: false }))}
            />
        )}</>
    );
};

export default PreInstructionsChecklist;