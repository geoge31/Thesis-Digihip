/**
 * 
 */

import React, { useState } from 'react';
import { PatientData } from '@/utils/interfaces/interfaceModules';
import styles from '@/digihip/patient-details/modules/SecondPage/css/SecondPage.module.css'; 
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";

import PreExercisesCheckList from '../../utils/preExercises';
import PreInstructionsChecklist from '../../utils/preInstructions';
import Statistics from '../../utils/Statistics';


interface SecondPageProps {
    pStringId: string;
    headersSectionB: string;
    currentSelectionB: number;
    currentSectionB: string;
    handleClickHeaderB: (header: string, selection: React.SetStateAction<number>) => void;
    handleClickSectionB: (section: string) => void;
    sectionBDisplayNames: { [key: string]: string };
    patient: PatientData;
}

const SecondPage: React.FC<SecondPageProps> = ({ pStringId, headersSectionB, currentSelectionB, currentSectionB, handleClickHeaderB, handleClickSectionB, patient }) => {

    const pdata = patient;
    const flags = patient ? 
        {
            ispreop: patient?.isPreoperation === true ? true : false,
            curstg: patient.currentStage ?? 'Μη διαθέσιμο' 
        } : null;

    console.log(pdata);

    const [] = useState(1);  //
    const [currentPreSelection, setCurrentPreSelection] = useState(1);
    const [currentPostSelection, setCurrentPostSelection] = useState(1);
    const [selectedPreInstructions, setSelectedPreInstructions] = useState<string[]>(patient.preInstructions || []);
    const [selectedPreExercises, setSelectedPreExercises] = useState<string[]>(patient.preExercises || []);
    
    if(!patient) {
        return <div>Δεν βρέθηκε ασθενής.</div>;
    }

    const handlePreInstructionChange = (newSelection: string[]) => {
        setSelectedPreInstructions(newSelection);
        // You can also update the patient object here if needed
    };

    const handlePreExerciseChange = (newSelection: string[]) => {
        setSelectedPreExercises(newSelection);
    };


    const patientIsPreoperation = () => {
        if(flags?.ispreop) {
            return (
                <div className={styles.sectionsB}>
                    <div
                        className={`${styles.sectionBItem} ${headersSectionB === 'preoperation' ? styles.focused : ''}`}
                        onClick={() => handleClickHeaderB('preoperation',1)}
                        tabIndex={0}> Προεγχειρητικό Στάδιο
                    </div>
                    <div
                        className={`${styles.sectionBdisabledItem} ${currentSectionB === 'postoperation' ? styles.disabled : ''}`}
                        tabIndex={1}>Μετεγχειρητικό Στάδιο (Μη διαθέσιμο)
                    </div>

                </div>
            );
        } else {
            return (
                <div className={styles.sectionsB}>
                    <div
                        className={`${styles.sectionBItem} ${headersSectionB === 'preoperation' ? styles.focused : ''}`}
                        onClick={() => handleClickHeaderB('preoperation',1)}
                        tabIndex={1}>Προεγχειρητικό Στάδιο
                    </div>
                    <div
                        className={`${styles.sectionBItem} ${headersSectionB === 'postoperation' ? styles.focused : ''}`}
                        onClick={() => handleClickHeaderB('postoperation',2)}
                        tabIndex={0}>Μετεγχειρητικό Στάδιο
                    </div>
                </div>
            );
        }
    };

    const PrevPreView = () => {
        setCurrentPreSelection(
            (prevView) => (prevView > 1 ? prevView - 1 : 3)
        )
    };

    const NextPreView = () => {
        setCurrentPreSelection(
            (prevView) => (prevView < 3 ? prevView + 1 : 1)
        )
    };
    
    const PrevPostView = () => {
        setCurrentPostSelection(
            (prevView) => (prevView > 1 ? prevView - 1 : 3)
        )
    };
    
    const NextPostView = () => {
        setCurrentPostSelection(
            (prevView) => (prevView > 1 ? prevView - 1 : 3)
        )
    };

    const RenderHeaderView = () => {

        if(currentSelectionB === 1) {
            switch(currentPreSelection) {
                case 1:
                    handleClickSectionB('preInstr'); 
                    return <p>Οδηγίες</p>;
                case 2: 
                    handleClickSectionB('preExcs');
                    return <p>Ασκήσεις</p>;
                case 3: 
                    handleClickSectionB('preStats');
                    return <p>Στατιστικά</p>;
                default:
                     return <p></p>;
            }
        } else {
            switch(currentPostSelection) {
                case 1:
                    handleClickSectionB('postInstr'); 
                    return <p>Οδηγίες</p>;
                case 2: 
                    handleClickSectionB('postExcs');
                    return <p>Ασκήσεις</p>;
                case 3: 
                    handleClickSectionB('postStats');
                    return <p>Στατιστικά</p>;
                default:
                     return <p></p>;
            }
        }
    };

    const RenderContentView = () => {
        
        if(currentSelectionB === 1) {
            switch(currentPreSelection) {
                case 1: 
                    return (
                        <div>    
                            <PreInstructionsChecklist
                                patientToUpdate={pStringId}
                                selectedItems={selectedPreInstructions}
                                onSelectionChange={handlePreInstructionChange}
                            />
                        </div>
                    );
                case 2: 
                    return (
                        <div>
                            <PreExercisesCheckList
                                patientToUpdate={pStringId}
                                selectedItems={selectedPreExercises}
                                onSelectionChange={handlePreExerciseChange}/>
                        </div>
                    );
                case 3: 
                    return (
                        <div>
                            <Statistics patientAmka={pdata?.amka} />
                        </div>
                    );
            }
        } else if(currentSelectionB === 2) {
            switch(currentPostSelection) {
                case 1: 
                    return (
                        <div>Εδώ θα είναι οι μετεγχειρητικές οδηγίες</div>
                    );
                case 2: 
                    return (
                        <div>Εδώ θα είναι οι μετεγχειρητικές ασκήσεις</div>
                    );
                case 3: 
                    return (
                        <div>
                            <Statistics patientAmka={pdata?.amka} />
                        </div>
                    );
            }
        }
    };

    return (
        <div className={styles.pageB}>
            {patientIsPreoperation()}
            <div className={styles.contentB}>
                <div className={styles.currViewB}>
                    <div className={styles.prevView}>
                        {currentSelectionB === 1 ? (<button onClick={PrevPreView}>{<FaCaretLeft/>}</button>) : (<button onClick={PrevPostView}>{<FaCaretLeft/>}</button>)}
                    </div>
                    <div className={styles.contentView}>
                        {RenderHeaderView()}
                    </div>
                    <div className={styles.nextView}>
                        {currentSelectionB === 1 ? (<button onClick={NextPreView}>{<FaCaretRight/>}</button>) : (<button onClick={NextPostView}>{<FaCaretRight/>}</button>)}
                    </div>
                </div>
                <div className={styles.currViewContent}>
                    {RenderContentView()}
                </div>
            </div>
        </div>
    );
}

export default SecondPage;