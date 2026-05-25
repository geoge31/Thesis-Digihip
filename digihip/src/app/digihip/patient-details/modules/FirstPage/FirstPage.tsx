/**
 * 
 */

import React, { 
    useState,
} from 'react';
import { PatientInterface, ChangeLogEntry } from '@/utils/interfaces/PatientInterface';
import EditButton from '@/components/Buttons/EditButton/EditButton';
import CnlSvBtns from '@/components/Buttons/CancelSave/CancelSave';
import styles from '@/digihip/patient-details/modules/FirstPage/css/FirstPage.module.css'; 
import { AiFillEdit } from "react-icons/ai";
import { updatePatient } from '../../methods/update/updatePatient';
import { uploadMedicalFiles } from '@/services/patients/uploadMedicalFiles';
import { treatments } from '@/utils/treatments/treatments';
import HandleCases from '@/components/HandleCases/HandleCases';
import { IoClose } from "react-icons/io5";
import { calculateAge } from '@/utils/date/dateUtils';
import { fieldDisplayNames } from '@/utils/locale/fieldDisplayNames';


interface FirstPageProps {
    currentSectionA: string;
    handleClickSection: (section: string) => void;
    sectionADisplayNames: { [key: string]: string };
    patient: PatientInterface;
    onPatientUpdate?: (updated: PatientInterface) => void;
}


/**
 * 
 * @param param0 
 * @returns 
 */
const FirstPage: React.FC<FirstPageProps> = ({ currentSectionA, handleClickSection, sectionADisplayNames, patient, onPatientUpdate }) => {

    const [editMode, setEditMode] = useState(false);
    const [pdata, setPdata] = useState(patient);
    const [oldData, setOldData] = useState<PatientInterface | null> (pdata);
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
    const [medicalFilesForEdit, setMedicalFilesForEdit] = useState<File[]>([]);
    const [manualStage, setManualStage] = useState(patient.manualStage ?? false);
    const [showManualWarning, setShowManualWarning] = useState(false);
    const [pendingStageValue, setPendingStageValue] = useState<string>('');
    const [modalState, setModalState] = useState<{ message: string; option: "loading" | "success" | "fail"; visibility: boolean }>({
        message: "", option: "loading", visibility: false,
    });

    const [medicinesModalVisible, setMedicinesModalVisible] = useState(false);
    const [selectedMedicines, setSelectedMedicines] = useState<string[]>(patient.medicines ?? []);
    const [savedMedicines, setSavedMedicines] = useState<string[]>(patient.medicines ?? []);
    const [searchMedicines, setSearchMedicines] = useState('');

    console.log("pdata : ", pdata);
    
    const uppercaseFields : Array<keyof PatientInterface> = [
        'address',
        'firstname',
        'supervisorDoctor',
        'lastname',
    ];


  
    const handleEditButton = () => {
        if(!editMode) {
            setEditMode(true);
            setMedicalFilesForEdit([]);
        } else {
            setEditMode(false);
        }
    };

    const IsEditMode = () => {
        if(!editMode) {
            return (
                <div>
                    <EditButton onClick={handleEditButton}><AiFillEdit/></EditButton>
                </div>
            );
        } else {
            return (
                <CnlSvBtns 
                    onClickCancel={handleCancel}
                    onClickSave={handleSave}/>
            );
        }
    };


    /**
     * Handle medical file upload
     */
    const HandleMedicalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedicalFilesForEdit((prev) => [...prev, file]);
        }
    };

    /**
     * Remove newly added medical file
     */
    const RemoveMedicalFile = (fileName: string) => {
        setMedicalFilesForEdit((prev) => 
            prev.filter((file) => file.name !== fileName)
        );
    };

    /**
     * Remove existing medical file
     */
    const RemoveExistingMedicalFile = (fileName: string) => {
        const updatedFiles = pdata?.medicalFiles
            ? pdata.medicalFiles
                .split(',')
                .map((f) => f.trim())
                .filter((f) => f !== fileName)
                .join(',')
            : '';
        
        setPdata((prevData) => ({
            ...prevData,
            medicalFiles: updatedFiles,
        }));
        setChangedFields((prev) => new Set(prev).add('medicalFiles'));
    };

    /**
     * Download medical file
     */
    const DownloadMedicalFile = (fileName: string) => {
        const patientId = pdata?._id || pdata?.id;
        if (!patientId) {
            alert('Patient ID not found');
            return;
        }
        const downloadUrl = `/api/patients/download?patientId=${patientId}&fileName=${encodeURIComponent(fileName)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * 
     * @param e 
     * @param field 
     */
    const HandleDataChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PatientInterface) => {
        
        let newValue = e.target.value;

        if(uppercaseFields.includes(field)) {
            newValue = newValue.toUpperCase();
        } 

        setPdata((prevData) => ({
            ...prevData,
            [field]: newValue,
        }));
        setChangedFields((prev) => new Set(prev).add(field));
    };

    const HandleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'entryDate' | 'operationDate' | 'exitDate') => {
        const newValue = e.target.value;
        const newDate = new Date(newValue);

        if (field === 'entryDate') {
            if (pdata?.exitDate && newDate > new Date(pdata.exitDate)) {
                setModalState({ message: 'Η ημερομηνία εισαγωγής δεν μπορεί να είναι μετά την ημερομηνία εξόδου.', option: 'fail', visibility: true });
                return;
            }
            if (pdata?.operationDate && newDate > new Date(pdata.operationDate)) {
                setModalState({ message: 'Η ημερομηνία εισαγωγής δεν μπορεί να είναι μετά την ημερομηνία επέμβασης.', option: 'fail', visibility: true });
                return;
            }
        }

        if (field === 'exitDate') {
            if (pdata?.entryDate && newDate < new Date(pdata.entryDate)) {
                setModalState({ message: 'Η ημερομηνία εξόδου δεν μπορεί να είναι πριν την ημερομηνία εισαγωγής.', option: 'fail', visibility: true });
                return;
            }
            if (pdata?.operationDate && newDate < new Date(pdata.operationDate)) {
                setModalState({ message: 'Η ημερομηνία εξόδου δεν μπορεί να είναι πριν την ημερομηνία επέμβασης.', option: 'fail', visibility: true });
                return;
            }
        }

        if (field === 'operationDate') {
            if (pdata?.entryDate && newDate < new Date(pdata.entryDate)) {
                setModalState({ message: 'Η ημερομηνία επέμβασης δεν μπορεί να είναι πριν την ημερομηνία εισαγωγής.', option: 'fail', visibility: true });
                return;
            }
            if (pdata?.exitDate && newDate > new Date(pdata.exitDate)) {
                setModalState({ message: 'Η ημερομηνία επέμβασης δεν μπορεί να είναι μετά την ημερομηνία εξόδου.', option: 'fail', visibility: true });
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPreop = newDate > today;

            setPdata((prevData) => ({
                ...prevData,
                [field]: newValue,
                isPreoperation: isPreop,
                currentStage: isPreop ? 'ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ' : 'ΜΕΤΕΓΧΕΙΡΗΤΙΚΟ',
                manualStage: false,
            }));
            setManualStage(false);
            setChangedFields((prev) => {
                const next = new Set(prev);
                next.add(field);
                next.add('isPreoperation');
                next.add('currentStage');
                next.add('manualStage');
                return next;
            });
            return;
        }

        setPdata((prevData) => ({
            ...prevData,
            [field]: newValue,
        }));
        setChangedFields((prev) => new Set(prev).add(field));
    };

    const HandleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        if (!manualStage) {
            setPendingStageValue(newValue);
            setShowManualWarning(true);
        } else {
            const isPreop = newValue === 'ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ';
            setPdata((prevData) => ({
                ...prevData,
                currentStage: newValue,
                isPreoperation: isPreop,
            }));
            setChangedFields((prev) => {
                const next = new Set(prev);
                next.add('currentStage');
                next.add('isPreoperation');
                return next;
            });
        }
    };

    const confirmManualStage = () => {
        setManualStage(true);
        const isPreop = pendingStageValue === 'ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ';
        setPdata((prevData) => ({
            ...prevData,
            currentStage: pendingStageValue,
            isPreoperation: isPreop,
            manualStage: true,
        }));
        setChangedFields((prev) => {
            const next = new Set(prev);
            next.add('currentStage');
            next.add('isPreoperation');
            next.add('manualStage');
            return next;
        });
        setShowManualWarning(false);
    };

    const cancelManualStage = () => {
        setPendingStageValue('');
        setShowManualWarning(false);
    };

    const handleSelectMedicine = (key: string) => {
        setSelectedMedicines((prev) => {
            const isSelected = prev.includes(key);
            return isSelected
                ? prev.filter((m) => m !== key)
                : [...prev, key];
        });
    };

    const handleSaveMedicines = () => {
        setSavedMedicines([...selectedMedicines]);
        setPdata((prevData) => ({
            ...prevData,
            medicines: selectedMedicines,
        }));
        setChangedFields((prev) => new Set(prev).add('medicines'));
        setMedicinesModalVisible(false);
        setSearchMedicines('');
    };

    const handleCloseMedicinesModal = () => {
        setSelectedMedicines([...savedMedicines]);
        setMedicinesModalVisible(false);
        setSearchMedicines('');
    };

    const handleClearMedicines = () => {
        setSelectedMedicines([]);
    };

    const highlightMatch = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = (text || '').split(regex);
        return parts.map((part: string, index: number) => 
            part.toLowerCase() === searchTerm.toLowerCase() 
                ? <span key={index} style={{ backgroundColor: 'lightblue' }}>{part}</span> 
                : part
        );
    };

    /**
     * 
     * @param updates 
     */
    const handleUpdate = async (updates: PatientInterface, fields: string[], filesToUpload?: File[]) => {

        if(pdata){
            setModalState({ message: 'Ενημέρωση δεδομένων ασθενή. Παρακαλούμε περιμένετε...', option: 'loading', visibility: true });
            
            const result = await updatePatient(pdata._id ?? "", updates, fields);

            if(!result) {
                console.error('patient did not update : ', result);
                setModalState({ message: 'Αποτυχία ενημέρωσης ασθενή.', option: 'fail', visibility: true });
                return;
            }

            console.log('patient updated successfully : ', result);
            const updatedResult = {
                ...pdata,
                ...result,
                admin: pdata.admin
            };
            setPdata(updatedResult);
            setOldData(updatedResult);

            // Upload new medical files if any
            if (filesToUpload && filesToUpload.length > 0) {
                const patientId = result._id || result.id;
                const uploadResult = await uploadMedicalFiles(patientId, filesToUpload);
                if (!uploadResult.success) {
                    console.warn("File upload warning:", uploadResult.message);
                    setModalState({ message: 'Ασθενής ενημερώθηκε αλλά υπάρχει σφάλμα στα νέα αρχεία.', option: 'fail', visibility: true });
                } else {
                    setModalState({ message: 'Ο ασθενής ενημερώθηκε επιτυχώς.', option: 'success', visibility: true });
                    
                }
            } else {
                setModalState({ message: 'Ο ασθενής ενημερώθηκε επιτυχώς.', option: 'success', visibility: true });
            }
            if(onPatientUpdate) onPatientUpdate(result);
            setModalState({ message: 'Ο ασθενής ενημερώθηκε επιτυχώς.', option: 'success', visibility: true });
        }
    };

    const handleCancel = () => {
        setPdata(oldData || pdata);
        setEditMode(false);
        setChangedFields(new Set());
        setMedicalFilesForEdit([]);
        setManualStage(oldData?.manualStage ?? false);
        setSelectedMedicines(oldData?.medicines ?? []);
        setSavedMedicines(oldData?.medicines ?? []);
    };

    const handleSave = () => {
        // Merge new files with existing files
        let updatedMedicalFiles = pdata?.medicalFiles || '';
        if (medicalFilesForEdit.length > 0) {
            const newFileNames = medicalFilesForEdit.map((f) => f.name).join(',');
            updatedMedicalFiles = updatedMedicalFiles 
                ? `${updatedMedicalFiles},${newFileNames}` 
                : newFileNames;
        }

        const updates = {
            ...pdata,
            medicalFiles: updatedMedicalFiles,
        };
        
        const fields = Array.from(changedFields);
        if (medicalFilesForEdit.length > 0) {
            fields.push('medicalFiles');
        }
        
        console.log(typeof(updates));

        setPdata(updates);
        setEditMode(false);
        setChangedFields(new Set());
        
        // Pass the files to be uploaded to handleUpdate
        const filesToUpload = medicalFilesForEdit.length > 0 ? [...medicalFilesForEdit] : undefined;
        setMedicalFilesForEdit([]);
        
        handleUpdate(updates, fields, filesToUpload);
    };

    if(!patient) {
        return <div>Δεν βρέθηκε ασθενής.</div>;
    }

    return (
            <div className={styles.pageA}>
                <div className={styles.sectionsA}>
                    <div
                        className={`${styles.sectionAItem} ${currentSectionA === 'demographics' ? styles.focused : ''}`}
                        onClick={() => handleClickSection('demographics')}
                        tabIndex={0}
                    >
                        {sectionADisplayNames['demographics']}
                    </div>
                    <div
                        className={`${styles.sectionAItem} ${currentSectionA === 'medical' ? styles.focused : ''}`}
                        onClick={() => handleClickSection('medical')}
                        tabIndex={0}
                    >
                        {sectionADisplayNames['medical']}
                    </div>
                    <div
                        className={`${styles.sectionAItem} ${currentSectionA === 'operation' ? styles.focused : ''}`}
                        onClick={() => handleClickSection('operation')}
                        tabIndex={0}
                    >
                        {sectionADisplayNames['operation']}
                    </div>
                    <div
                        className={`${styles.sectionAItem} ${currentSectionA === 'other' ? styles.focused : ''}`}
                        onClick={() => handleClickSection('other')}
                        tabIndex={0}
                    >
                        {sectionADisplayNames['other']}
                    </div>
                </div>
                <div className={styles.contentA}>
                    {currentSectionA === 'demographics' && (
                        <div>
                            {/* Demographics details go here */}
                            {IsEditMode()}
                            <div className={styles.item}>
                                <strong>Όνομα</strong>
                                <input
                                    type='text'
                                    title='Όνομα'
                                    value={pdata?.firstname}
                                    onChange={(e) => HandleDataChange(e, 'firstname')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Επίθετο</strong>
                                <input
                                    type='text'
                                    title='Επίθετο'
                                    value={pdata?.lastname}
                                    onChange={(e) => HandleDataChange(e, 'lastname')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Ημερομηνία Γέννησης</strong>
                                <input
                                    type='text'
                                    name='birthdate'
                                    title='Birthdate'
                                    value={new Date(pdata?.birthdate).toLocaleDateString() ?? "Δεν έχει οριστεί"}
                                    onChange={(e) => HandleDataChange(e, 'birthdate')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Ηλικία</strong>
                                <input
                                    type='text'
                                    title='age'
                                    value={calculateAge(pdata?.birthdate)}
                                    readOnly/>
                            </div>
                            <div className={styles.item}>
                                <strong>ΑΜΚΑ</strong>
                                <input
                                    type='text'
                                    title='AMKA'
                                    value={pdata?.amka}
                                    onChange={(e) => HandleDataChange(e, 'amka')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Κωδικός αμεδ</strong>
                                <input
                                    type='text'
                                    title='Κωδικός amed'
                                    value={pdata?.amedcode}
                                    onChange={(e) => HandleDataChange(e, 'amedcode')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Ύψος (cm)</strong>
                                <input
                                    type='text'
                                    title='Ύψος'
                                    value={pdata?.height}
                                    onChange={(e) => HandleDataChange(e, 'height')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Βάρος (kg)</strong>
                                <input
                                    type='text'
                                    title='Βάρος'
                                    value={pdata?.weight}
                                    onChange={(e) => HandleDataChange(e, 'weight')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Τηλέφωνο Επικοινωνίας</strong>
                                <input
                                    type='text'
                                    title='Τηλέφωνο Επικοινωνίας'
                                    value={pdata?.mobilephone}
                                    onChange={(e) => HandleDataChange(e, 'mobilephone')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Email</strong>
                                <input
                                    type='text'
                                    title='Email'
                                    value={pdata?.email}
                                    onChange={(e) => HandleDataChange(e, 'email')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Διεύθυνση Κατοικίας</strong>
                                <input
                                    type='text'
                                    title='Διεύθυνση Κατοικίας'
                                    value={pdata?.address}
                                    onChange={(e) => HandleDataChange(e, 'address')}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Στάδιο</strong>
                                <select
                                    title='Στάδιο'
                                    value={pdata?.currentStage}
                                    onChange={(e) => HandleStageChange(e)}
                                    disabled={!editMode}>
                                    <option value='ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ'>ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ</option>
                                    <option value='ΜΕΤΕΓΧΕΙΡΗΤΙΚΟ'>ΜΕΤΕΓΧΕΙΡΗΤΙΚΟ</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {currentSectionA === 'medical' && (
                        <div>
                            {/* Medical history details go here */}
                            {IsEditMode()}
                            <div className={styles.item}>
                                <strong>Ομάδα Αίματος</strong>
                                <input
                                    type='text'
                                    title='Ομάδα Αίματος'
                                    value={pdata?.bloodtype}
                                    readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Κάπνισμα</strong>
                                <input
                                    type='text'
                                    title='Κάπνισμα'
                                    value={pdata?.smoking ? 'Ναι' : 'Όχι'}
                                    readOnly={!editMode} />
                            </div>
                            <div className={styles.item}>
                                <strong>Αλκοόλ</strong>
                                <input
                                    type='text'
                                    title='Αλκοόλ'
                                    value={pdata?.alcohol ? 'Ναι' : 'Όχι'}
                                    readOnly={!editMode} />
                            </div>
                            <div className={styles.item}>
                                <strong>Χρόνιες Φαρμακευτικές Αγωγές</strong>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {pdata?.treatments && pdata.treatments.length > 0 ? (
                                        pdata.treatments.map((id: string, index: number) => {
                                            const tr = treatments.find((t) => t.value === id);
                                            return (
                                                <span
                                                    key={`treatment-${index}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#0d47a1',
                                                        border: '1px solid #90caf9',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        maxWidth: '300px',
                                                    }}
                                                    title={tr?.label ?? id}
                                                >
                                                    <span style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}>
                                                        {tr?.label ?? id}
                                                    </span>
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Δεν υπάρχουν</span>
                                    )}
                                </div>
                                <span className={styles.emphasis}>!</span>
                            </div>
                            <div className={styles.item}>
                                <strong>Χρόνιες Παθήσεις</strong>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {pdata?.chronicDiseases ? (
                                        pdata.chronicDiseases.split('\n').filter(Boolean).map((disease: string, index: number) => (
                                            <span
                                                key={`disease-${index}`}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    border: '1px solid #90caf9',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '300px',
                                                }}
                                                title={disease.trim()}
                                            >
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {disease.trim()}
                                                </span>
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Δεν υπάρχουν</span>
                                    )}
                                </div>
                                <span className={styles.emphasis}>!</span>
                            </div>
                            <div className={styles.item}>
                                <strong>Αλλεργίες</strong>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {pdata?.allergies ? (
                                        pdata.allergies.split('\n').filter(Boolean).map((allergy: string, index: number) => (
                                            <span
                                                key={`allergy-${index}`}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    border: '1px solid #90caf9',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '300px',
                                                }}
                                                title={allergy.trim()}
                                            >
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {allergy.trim()}
                                                </span>
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Δεν υπάρχουν</span>
                                    )}
                                </div>
                                <span style={{color: 'red'}}>!</span>
                            </div>
                            <div className={styles.item}>
                                <strong>Χειρουργεία</strong>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {pdata?.surgeries ? (
                                        pdata.surgeries.split('\n').filter(Boolean).map((surgery: string, index: number) => (
                                            <span
                                                key={`surgery-${index}`}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    border: '1px solid #90caf9',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '300px',
                                                }}
                                                title={surgery.trim()}
                                            >
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {surgery.trim()}
                                                </span>
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Δεν υπάρχουν</span>
                                    )}
                                </div>
                            </div>                            <div className={styles.item}>
                                <strong>Φάρμακα</strong>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {pdata?.medicines && pdata.medicines.length > 0 ? (
                                        pdata.medicines.map((id: string, index: number) => {
                                            const med = treatments.find((t) => t.value === id);
                                            return (
                                                <span
                                                    key={`medicine-${index}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#0d47a1',
                                                        border: '1px solid #90caf9',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        maxWidth: '300px',
                                                    }}
                                                    title={med?.label ?? id}
                                                >
                                                    <span style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}>
                                                        {med?.label ?? id}
                                                    </span>
                                                    {editMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = pdata.medicines.filter((_: string, i: number) => i !== index);
                                                                setSelectedMedicines(updated);
                                                                setSavedMedicines(updated);
                                                                setPdata((prevData) => ({
                                                                    ...prevData,
                                                                    medicines: updated,
                                                                }));
                                                                setChangedFields((prev) => new Set(prev).add('medicines'));
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#0d47a1',
                                                                cursor: 'pointer',
                                                                fontSize: '1.1rem',
                                                                padding: '0',
                                                                marginLeft: '4px',
                                                                transition: 'all 0.2s ease',
                                                                flexShrink: 0,
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#d21034'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#0d47a1'}
                                                            title="Αφαίρεση"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Δεν υπάρχουν</span>
                                    )}
                                </div>
                                {editMode && (
                                    <div style={{ marginTop: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSavedMedicines([...selectedMedicines]);
                                                setMedicinesModalVisible(true);
                                            }}
                                            style={{
                                                display: 'inline-flex',
                                                padding: '8px 12px',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#c0c0c0',
                                                color: '#000',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                borderRadius: '5px',
                                                border: '1px solid #00000079',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#7c7c7c';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#c0c0c0';
                                                e.currentTarget.style.color = '#000';
                                            }}
                                        >
                                            {pdata?.medicines && pdata.medicines.length > 0 ? 'Επεξεργασία' : 'Προσθήκη'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {medicinesModalVisible && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0 }}>Επιλογή Φαρμάκων</h3>
                                    <button
                                        onClick={handleCloseMedicinesModal}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            color: '#333',
                                        }}
                                    >
                                        <IoClose />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Αναζήτηση Φαρμάκων"
                                    value={searchMedicines}
                                    onChange={(e) => setSearchMedicines(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        marginBottom: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                                    {treatments
                                        .filter((t) => t.label.toLowerCase().includes(searchMedicines.toLowerCase()))
                                        .map((t) => (
                                            <div
                                                key={t.value}
                                                onClick={() => handleSelectMedicine(t.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedMedicines.includes(t.value) ? '#d0e8ff' : 'transparent',
                                                    borderBottom: '1px solid #eee',
                                                    fontSize: '0.9rem',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!selectedMedicines.includes(t.value))
                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!selectedMedicines.includes(t.value))
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {highlightMatch(t.label, searchMedicines)}
                                            </div>
                                        ))}
                                </div>
                                <div className={styles.modalActions}>
                                    <button onClick={handleClearMedicines}>Εκκαθάριση</button>
                                    <button onClick={handleSaveMedicines}>Αποθήκευση</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentSectionA === 'operation' && (
                        <div>
                            {/* Operation details go here */}
                            {IsEditMode()}
                            <div>
                                <div className={styles.item}>
                                    <strong>Σκέλος Επέμβασης</strong>
                                    <input
                                        type='text'
                                        title='Σκέλος Επέμβασης'
                                        value={pdata?.legOperation == 'right' ? 'Δεξί' : 'Αριστερό'}
                                        readOnly={!editMode}/>
                            </div>
                            <div className={styles.item}>
                                <strong>Κατάσταση Επέμβασης</strong>
                                <input
                                    type='text'
                                    title='Κατάσταση Επέμβασης'
                                    value={pdata?.primary == 'true' ? 'Πρωτοπαθής' : 'Αναθεώρηση'}
                                    readOnly={!editMode} />
                            </div>
                                <div className={styles.item}>
                                    <strong>Επιβλέπων Ιατρός</strong>
                                    <input
                                        type='text'
                                        title='Επιβλέπων Ιατρός'
                                        value={pdata?.supervisorDoctor}
                                        readOnly={!editMode}/>
                                </div>
                                <div className={styles.item}>
                                    <strong>Ημερομηνία Εισαγωγής</strong>
                                    <input
                                        type={editMode ? 'date' : 'text'}
                                        title='Ημερομηνία Εισαγωγής'
                                        value={editMode 
                                            ? (pdata?.entryDate ? new Date(pdata.entryDate).toISOString().split('T')[0] : '') 
                                            : new Date(pdata?.entryDate).toLocaleDateString()}
                                        onChange={(e) => HandleDateChange(e, 'entryDate')}
                                        readOnly={!editMode}/>
                                </div>
                                <div className={styles.item}>
                                    <strong>Ημερομηνία Επέμβασης</strong>
                                    <input
                                        type={editMode ? 'date' : 'text'}
                                        title='Ημερομηνία Επέμβασης'
                                        value={editMode 
                                            ? (pdata?.operationDate ? new Date(pdata.operationDate).toISOString().split('T')[0] : '') 
                                            : new Date(pdata?.operationDate).toLocaleDateString()}
                                        onChange={(e) => HandleDateChange(e, 'operationDate')}
                                        readOnly={!editMode}/>
                                </div>
                                <div className={styles.item}>
                                    <strong>Ημερομηνία Εξόδου</strong>
                                    <input
                                        type={editMode ? 'date' : 'text'}
                                        title='Ημερομηνία Εξόδου'
                                        value={editMode 
                                            ? (pdata?.exitDate ? new Date(pdata.exitDate).toISOString().split('T')[0] : '') 
                                            : new Date(pdata?.exitDate).toLocaleDateString()}
                                        onChange={(e) => HandleDateChange(e, 'exitDate')}
                                        readOnly={!editMode}/>
                                </div>
                                <div className={styles.item}>
                                    <strong>Ιατρικά Αρχεία</strong>
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '8px', 
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        minHeight: '40px',
                                        padding: '8px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px'
                                    }}>
                                        {/* Display existing files */}
                                        {pdata?.medicalFiles && pdata.medicalFiles.split(',').map((file, index) => (
                                            <span 
                                                key={`existing-${index}`}
                                                onClick={() => DownloadMedicalFile(file.trim())}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    border: '1px solid #90caf9',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '200px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#bbdefb';
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                                title={`Click to download: ${file.trim()}`}
                                            >
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    flex: 1,
                                                }} title={file.trim()}>
                                                    {file.trim()}
                                                </span>
                                                <svg 
                                                    width="16" 
                                                    height="16" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    style={{
                                                        color: '#0d47a1',
                                                    }}
                                                >
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                {editMode && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            RemoveExistingMedicalFile(file.trim());
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#0d47a1',
                                                            cursor: 'pointer',
                                                            fontSize: '1.1rem',
                                                            padding: '0',
                                                            marginLeft: '4px',
                                                            transition: 'all 0.2s ease',
                                                            flexShrink: 0,
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = '#d21034'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = '#0d47a1'}
                                                        title="Delete file"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        
                                        {/* Display newly uploaded files */}
                                        {medicalFilesForEdit.map((file, index) => (
                                            <span 
                                                key={`new-${index}`}
                                                onClick={() => {
                                                    const url = URL.createObjectURL(file);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = file.name;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    border: '2px solid #64b5f6',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    maxWidth: '200px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#bbdefb';
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                                title={`Click to download: ${file.name}`}
                                            >
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    flex: 1,
                                                }} title={file.name}>
                                                    {file.name}
                                                </span>
                                                <svg 
                                                    width="16" 
                                                    height="16" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    style={{
                                                        color: '#0d47a1',
                                                    }}
                                                >
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        RemoveMedicalFile(file.name);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#0d47a1',
                                                        cursor: 'pointer',
                                                        fontSize: '1.1rem',
                                                        padding: '0',
                                                        marginLeft: '4px',
                                                        transition: 'all 0.2s ease',
                                                        flexShrink: 0,
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#d21034'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#0d47a1'}
                                                    title="Delete file"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}

                                        {(!pdata?.medicalFiles && medicalFilesForEdit.length === 0) && (
                                            <span style={{ color: '#999', fontSize: '0.9rem' }}>
                                                Δεν έχουν προστεθεί αρχεία.
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* File input in edit mode */}
                                    {editMode && (
                                        <div style={{ 
                                            marginTop: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '40px',
                                        }}>
                                            <label htmlFor="medicalFileInput" style={{
                                                display: 'inline-flex',
                                                width: '120px',
                                                height: '100%',
                                                padding: '0 12px',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#c0c0c0',
                                                color: '#000',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                borderRadius: '5px',
                                                border: '1px solid #00000079',
                                                transition: 'all 0.2s ease',
                                                margin: 0,
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#7c7c7c';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#c0c0c0';
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            >
                                                Προσθήκη Αρχείου
                                            </label>
                                            <input 
                                                id="medicalFileInput"
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg,.dcm"
                                                onChange={(e) => HandleMedicalFileChange(e)}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {currentSectionA === 'other' && (
                        <div>
                            {/* Other details go here */}
                            <div>
                                <div className={styles.item}>
                                    <strong>Δημιουργήθηκε από</strong>
                                    <input
                                        type='text'
                                        title='Διαχειριστής'
                                        value={`${pdata?.admin?.firstname} ${pdata?.admin?.lastname}`}
                                        readOnly={!editMode}
                                    />
                                </div>
                                <div className={styles.item}>
                                    <strong>Τελευταία ενημέρωση</strong>
                                    <input
                                        type='text'
                                        title='Τελευταία Ενημέρωση'
                                        value={new Date(pdata?.updatedAt ?? "").toLocaleDateString()}
                                    />
                                </div>
                                <div className={styles.item}>
                                    <strong>Ημερομηνία Εγγραφής</strong>
                                    <input
                                        type='text'
                                        title='Ημερομηνία Εγγραφής'
                                        value={new Date(pdata?.createdAt ?? "").toLocaleDateString()}
                                    />
                                </div>
                            </div>
                            <div className={styles.changeLog}>
                                <strong>Ιστορικό Αλλαγών</strong>
                                {pdata?.changeLog && pdata.changeLog.length > 0 ? (
                                    <ul className={styles.changeLogList}>
                                        {pdata.changeLog.slice().reverse()
                                            .filter((entry: ChangeLogEntry) => entry.field !== 'manualStage' && entry.field !== 'isPreoperation')
                                            .map((entry: ChangeLogEntry, index: number) => (
                                            <li key={index} className={styles.changeLogItem}>
                                                <span className={styles.changeLogDoctor}>{entry.doctorName}</span>
                                                <span className={styles.changeLogField}>{fieldDisplayNames[entry.field] || entry.field}</span>
                                                <span className={styles.changeLogDate}>{new Date(entry.changedAt).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Δεν υπάρχουν αλλαγές.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {modalState.visibility && (
                    <HandleCases
                        {...modalState}
                        onClose={() => setModalState(prev => ({ ...prev, visibility: false }))}
                    />
                )}
                {showManualWarning && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <p><strong>Προσοχή:</strong> Αλλάζοντας χειροκίνητα το στάδιο, η αυτόματη εναλλαγή βάσει ημερομηνίας επέμβασης θα απενεργοποιηθεί.</p>
                            <p>Η αυτόματη λειτουργία θα επανενεργοποιηθεί μόνο αν αλλάξετε την ημερομηνία επέμβασης.</p>
                            <div className={styles.modalActions}>
                                <button onClick={confirmManualStage}>Συνέχεια</button>
                                <button onClick={cancelManualStage}>Ακύρωση</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default FirstPage;
