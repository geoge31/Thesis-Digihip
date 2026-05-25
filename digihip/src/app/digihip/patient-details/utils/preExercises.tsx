/**
 * 
 */

import React, { useState } from 'react';
import styles from './css/styling.module.css';
import { preExcercises } from '@/utils/exercises/exercisesModule';
import { updatePatient } from '../methods/update/updatePatient';
import HandleCases from '@/components/HandleCases/HandleCases';

interface PreExercisesProps {
    patientToUpdate: string;
    selectedItems: string[];
    onSelectionChange: (selectedItems: string[]) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const PreExercisesChecklist: React.FC<PreExercisesProps> = ({ patientToUpdate, selectedItems, onSelectionChange }) => {

    const [editMode,setEditMode] = useState(false);
    const [backupPreEx,setBackupPreEx] = useState<string[]>([]);
    const [newPreEx, setNewPreEx] = useState<string[]>([]);
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
        setNewPreEx(updatedSelection);
        // console.log(updatedSelection);
    };

    const EditMode = () => {
        setBackupPreEx(selectedItems);
        setEditMode(true);
    };

    const Cancel = () => {
        onSelectionChange(backupPreEx);
        setEditMode(false);
    };

    const Save = () => {
        updatePreOpExercises({ preExercises: newPreEx });
        setEditMode(false);
    };

    const updatePreOpExercises = async (updates: {preExercises: string[]}) => {

        console.log('Updating preExercises with:', updates); // Debugging
        if (!updates) {
            return;
        }
        try {
            const result = await updatePatient(patientToUpdate, updates);

            if(!result) {
                handleModal('Αποτυχία ενημέρωσης προεγχειρητικών ασκήσεων.', 'fail', true);
                return;
            }

            handleModal('Οι προεγχειρητικές ασκήσεις ενημερώθηκαν επιτυχώς.', 'success', true);
        } catch(error) {
            console.error("Failed to update pre-exercises:", error);
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
                        placeholder='Αναζήτηση Προεγχειρητικών Ασκήσεων'
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
                    {preExcercises.map((exercise) => (
                        <div
                            key={exercise.value}
                            className={`${styles.checklistItem} 
                            ${selectedItems.includes(exercise.value) ? styles.checked : ''}
                            ${!editMode ? styles.checklistItemDisabled : ''}`}
                            onClick={() => editMode ? handleItemClick(exercise.value) : ''}
                        >
                            <div className={styles.item} />
                            <label>{exercise.label}</label>
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

export default PreExercisesChecklist;