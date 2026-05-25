/**
 * Register Patient page
 * This component provides the register-patient page of DiGiHip Application
 * author: @geoge31
 * @path @/digihip/regiter-patient/
 * @file page.tsx
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { usePatientProvider } from "@/api/_context/Patients/Context";
import { DoctorData } from "@/utils/interfaces/interfaceModules";
import { NewPatient, PatientInterface } from "@/utils/interfaces/patient";
import { useRouter } from "next/navigation";
import { CreatePatient } from "@/services/patients/createPatient";
import { uploadMedicalFiles } from "@/services/patients/uploadMedicalFiles";
import { preInstructions } from "@/utils/instructions/instructionsModule";
import { preExcercises } from "@/utils/exercises/exercisesModule";
import { treatments } from "@/utils/treatments/treatments";
import RgPtAlert from "./alerts/registerPatientAlert";
import styles from "./css/RegPatientForm.module.css";
import { Input, Menu } from "antd";
import { FaChevronRight } from "react-icons/fa6";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { IoMdArrowRoundBack, IoMdArrowRoundForward } from "react-icons/io";
import { FiEye, FiEyeOff  } from "react-icons/fi";


export default function RegisterPatient () {

    const { currentDoctorData } = useDoctor();

    const router = useRouter();

    const doctor = currentDoctorData ? currentDoctorData : null;

    const [] = useState
    <{
        isMissingField: boolean,
        isNumericError: boolean;
        alertVisible: boolean;
        statusAlert: boolean | null;
    }>({
        isMissingField: false,
        isNumericError: false,
        alertVisible: false,
        statusAlert: null,
    });

    {/** represent boolean variables of patient data */}
    const [isSmoking, setIsSmoking] = useState<true | false>(false);
    const [isAlcohol, setIsAlcohol] = useState<true | false>(false);
    const [isPrimary, setIsPrimary] = useState<true | false>(false);

    {/** flag for changing  display page if success/failure */}
    const [finalState, setFinalState] = useState<true | false>(false);
    const [responseStatus, setResponseStatus] = useState<true | false>(false);
    const [statusText, setStatusText] = useState<"Ολοκληρώθηκε" | "Προέκυψε Σφάλμα" |"Εκκρεμμεί" | "">("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    {/** variables handling pre instructions and exercises*/}
    const [searchTermInstructions, setSearchTermInstructions] = useState("");
    const [searchTermExercises, setSearchTermExercises] = useState("");
    const [searchTreatments, setSearchTreatments] = useState("");
    const [selectedPreInstr, setSelectedPreInst] = useState<string[]>([]);
    const [selectedPreEx,setSelectedPreEx] = useState<string[]>([]);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
    const [savedPreInstr, setSavedPreInstr] = useState<string[]>([]);
    const [savedPreEx, setSavedPreEx] = useState<string[]>([]);
    const [savedTreatments, setSavedTreatments] = useState<string[]>([]);
    const [selectedMedicalFiles, setSelectedMedicalFiles] = useState<File[]>([]);
    const [] = useState(true);
    const [] = useState(true);
    const [] = useState<string>("");

    const [instrState, setInstrState] = useState<{
        visible: boolean; 
        action: boolean;
    }>({
        visible: false, action: false
    });
    
    const [exsState, setExsState] = useState<{
        visible: boolean; 
        action: boolean;
    }>({
        visible: false, action: false
    });

    const [treatmentState, setTreatmentState] = useState<{
        visible: boolean;
        action: boolean;
    }>({
        visible: false, action: false
    })


    {/* * Alert for handling errors such :
        * non numeric values at attributes > amka, mobilephone, height, weight 
        * missign required fields 
    */}
    const [showAlert, setShowAlert] = useState<boolean>(true);
    const [numericError, setNumericError] = useState<boolean>(false);
    const [missingFdError, setMissingFdError] = useState<boolean>(false);
    const [field, setField] = useState("");
    const [showOptions ,setShowOptions] = useState<boolean>(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    const formContentRef = useRef<HTMLDivElement>(null);
    const [] = useState<string | null>(null);


    {/** switching @formSections */}
    const [formState, setFormState] = useState(1);

    const formSectionRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            node.scrollTop = 0;
        }
    }, [formState]);

    const formSections: { [key: number]: string } = {
        1: "Δημογραφικά Στοιχεία",
        2: "Ατομικό Αναμνηστικό",
        3: "Πληροφορίες Επέμβασης",
        4: "Οδηγίες & Ασκήσεις",
        5: "Σχόλια",
    };

    {/** Patient Data based on interface module */}
    const [pData, setPData] = useState<PatientInterface>({
        address: "", 
        admin: doctor as DoctorData, 
        alcohol: "", 
        allergies: "", 
        amedcode: "",
        amka: "", 
        birthdate: "", 
        bloodtype: "", 
        chronicDiseases: "",
        comments: "",
        currentStage: "ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ", 
        email: "", 
        entryDate: "", 
        exitDate: "", 
        firstname: "", 
        height: "", 
        isPreoperation: true, 
        lastname: "", 
        legOperation: "", 
        manualStage: false,
        medicines: [], 
        mobilephone: "", 
        operationDate: "", 
        pastOperations: "", 
        preExercises: [], 
        preInstructions: [], 
        primary: "",
        smoking: "",
        surgeries: "",
        supervisorDoctor: "", 
        treatments: [],
        weight: "",
        medicalFiles: "", 
    });

    const clearedPtData = ({
        address: "", 
        admin: doctor as DoctorData, 
        alcohol: "", 
        allergies: "", 
        amedcode: "", 
        amka: "", 
        birthdate: "", 
        bloodtype: "", 
        chronicDiseases: "",
        comments: "",
        currentStage: "ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ",
        email: "", 
        entryDate: "", 
        exitDate: "", 
        firstname: "", 
        height: "", 
        isPreoperation: true, 
        lastname: "", 
        legOperation: "", 
        manualStage: false,
        medicines: [], 
        mobilephone: "", 
        operationDate: "", 
        pastOperations: "", 
        preExercises: [], 
        preInstructions: [],
        primary: "", 
        smoking: "", 
        surgeries: "",
        supervisorDoctor: "", 
        treatments: [],
        weight: "",
        medicalFiles: "", 
    });

    {/* * Fields to upperase input value
        * address
        * firstname
        * lastname
        * supervisorDoctor
    */}
    const uppercaseFields : Array<keyof PatientInterface> = [
        "address",
        "firstname",
        "lastname",
        "supervisorDoctor",
    ];

    const booleanFields: Array<keyof PatientInterface> = [
        "alcohol",
        "smoking",
        "primary"
    ]

    const fieldLabels: Record<string, string> = {
        firstname: "Όνομα",
        lastname: "Επίθετο",
        birthdate: "Ημερομηνία Γέννησης",
        amka: "ΑΜΚΑ",
        amedcode: "Κωδικός a-med",
        email: "Email",
        mobilephone: "Τηλέφωνο",
        height: "Ύψος",
        weight: "Βάρος",
        bloodtype: "Ομάδα Αίματος",
        legOperation: "Σκέλος Επέμβασης",
        primary: "Ιστορικό Επέμβασης",
        supervisorDoctor: "Επιβλέπων Ιατρός",
        entryDate: "Ημερομηνία Εισαγωγής",
        operationDate: "Ημερομηνία Επέμβασης",
        exitDate: "Ημερομηνία Εξόδου"
    };

    const BackAction = () => {
        router.back();
    };

    /** Clears fields of selected section based on the map */
    const ClearCurrentSection = () => {
        const clearedMapSections: Record<number, Partial<PatientInterface>> = {
            1: {
                firstname: "",
                lastname: "",
                birthdate: "",
                amka: "",
                amedcode: "",
                mobilephone: "",
                email: "",
                address: "",
                height: "",
                weight: "",
            },
            2: {
                bloodtype: "",
                allergies: "",
                chronicDiseases: "",
                pastOperations: "",
                surgery: "",
            },
            3: {
                legOperation: "",
                primary: "",
                supervisorDoctor: "",
                entryDate: "",
                operationDate: "",
                exitDate: "",
                medicalFiles: "",
            },
        };
    
        if (clearedMapSections[formState]) {
            // Merge the cleared fields for the current section with the existing state
            setPData((prevData) => ({
                ...prevData,
                ...clearedMapSections[formState],
            }));
        } else {
            console.warn(`No fields mapped for formState: ${formState}`);
        }
    };

    /** Clears all form fields */
    const ClearForm = () => {
        setPData(clearedPtData);
        setSelectedMedicalFiles([]);
    };

    /**
     * Handles which option to clear : current or all
     * @param 
     * @returns 
     */
    const handleClear = (option: "current" | "all", value: boolean) => {
        switch (option) {
            case "current":
                setShowOptions(value);
                if (formState === 3) {
                    setSelectedMedicalFiles([]);
                }
                ClearCurrentSection();
                break;
            case "all":
                setShowOptions(value);
                setSelectedMedicalFiles([]);
                ClearForm();
                break;
            default:
                break;
        }
    };

    /**
     * 
     * @param option 
     */
    const SaveUtils = (option: "instructions" | "exercises" | "treatments") => {
        switch(option) {
            case "instructions":
                setInstrState({
                    visible: true,
                    action: true,
                });
                break;
            case "exercises":
                setExsState({
                    visible: true,
                    action: true,
                });
                break;
            case "treatments":
                setTreatmentState({
                    visible: true,
                    action: false,
                });
                break;
            default:
                break;
        }
    };


    /**
     * 
     * @param option 
     */
    const OpenUtils = (option: "instructions" | "exercises" | "treatments") => {
        switch(option) {
            case "instructions":
                setInstrState({
                    visible: true,
                    action: false
                });
                break;
            case "exercises":
                setExsState({
                    visible: true,
                    action:false,
                })
                break;
            case "treatments":
                setTreatmentState({
                    visible: true,
                    action: false,
                })
                break;
            default:
                break;
        }  
    };

    /**
     * 
     * @param option 
     */
    const CloseUtils = (option: "instructions" | "exercises" | "treatments") => {
        switch(option) {
            case "instructions" :
                setInstrState({
                    visible: false,
                    action: false
                });
                break;
            case "exercises":
                setExsState({
                    visible: false,
                    action: false
                });
                break;
            case "treatments":
                setTreatmentState({
                    visible: false,
                    action: false,
                })
                break;
            default: 
                break;
        }
    };

    /**
     * 
     * @returns 
     */
    const FormSections = () => {
        switch (formState) {
            case 1:
                    return (
                        <>
                            <div className={styles.formSection} ref={formSectionRef}>
                                {/** firstname */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Όνομα<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        title="firstname"
                                        value={pData.firstname}
                                        onChange={(e) => UpdateData(e, "firstname")}
                                        required
                                    />
                                </div>
                                {/** lastname */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Επίθετο<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        name="lastname"
                                        title="lastname"
                                        value={pData.lastname}
                                        onChange={(e) => UpdateData(e, "lastname")}
                                        required
                                    />
                                </div>
                                {/** birthdate */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Ημερομηνία Γέννησης<span className={styles.required}> *</span></label>
                                    <input 
                                        type="date"
                                        title="birthdate"
                                        // value={pData.birthdate}
                                        value={pData.birthdate ? new Date(pData.birthdate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => UpdateData(e, "birthdate")}
                                        required
                                    />
                                </div>
                                {/** amka */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">ΑΜΚΑ<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        title="amka"
                                        value={pData.amka}
                                        maxLength={11}
                                        onChange={(e) => UpdateData(e, "amka")}
                                        required
                                    />
                                </div>
                                {/** amed-code */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Κωδικός a-med</label>
                                    <input 
                                        type="text"
                                        title="amedcode"
                                        value={pData.amedcode}
                                        onChange={(e) => UpdateData(e, "amedcode")}
                                        required
                                    />
                                </div>
                                {/** email */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Email</label>
                                    <input 
                                        type="text"
                                        title="email"
                                        value={pData.email}
                                        onChange={(e) => UpdateData(e, "email")}
                                        required
                                    />
                                </div>
                                {/** mobilephone */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Τηλέφωνο Επικοινωνίας<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        title="mobilephone"
                                        maxLength={10}
                                        value={pData.mobilephone}
                                        onChange={(e) => UpdateData(e, "mobilephone")}
                                        required
                                    />
                                </div>
                                {/** address */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Διεύθυνση Κατοικίας</label>
                                    <input 
                                        type="text"
                                        title="address"
                                        value={pData.address}
                                        onChange={(e) => UpdateData(e, "address")}
                                        />
                                </div>
                                {/** height */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Ύψος (cm)<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        title="height"
                                        pattern="^[0-9]*$"
                                        value={pData.height}
                                        onChange={(e) => UpdateData(e, "height")}
                                        required
                                    />
                                </div>
                                {/** weight */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Βάρος (kg)<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        title="weight"
                                        value={pData.weight}
                                        onChange={(e) => UpdateData(e, "weight")}
                                        required
                                    />
                                </div>
                                {/** current stage */}
                                <div className={styles.formInput}>
                                    <label htmlFor="stage">Τρέχον Στάδιο</label>
                                    <input 
                                        type="text"
                                        name="stage"
                                        title="Στάδιο"
                                        value={pData.currentStage} 
                                        readOnly
                                    />
                                </div>
                            </div>
                        </>
                    );        
            case 2:
                    return (
                        <>
                            <div className={styles.formSection} ref={formSectionRef}>
                                {/** bloodtype */}
                                <div className={styles.formInput}>
                                    <label htmlFor="bloodtype">Ομάδα Αίματος</label>
                                    <select 
                                        name="bloodtype" 
                                        title="bloodtype"
                                        value={pData.bloodtype}
                                        onChange={(e) => UpdateData(e, "bloodtype")}
                                        required
                                    >
                                        <option value="" selected disabled></option>
                                        <option value="A +">A +</option>
                                        <option value="A -">A -</option>
                                        <option value="B +">B +</option>
                                        <option value="B -">B -</option>
                                        <option value="AB +">AB +</option>
                                        <option value="AB -">AB -</option>
                                        <option value="0 +">0 +</option>
                                        <option value="0 -">0 -</option>
                                    </select>
                                </div>
                                {/** smoking */}
                                <div className={styles.formInput}>
                                    <label htmlFor="smoking">Κάπνισμα</label>
                                    <select 
                                        name="smoking"
                                        title="Επιλέξτε αν ο ασθένης είναι χρήστης νικοτίνης"
                                        value={pData.smoking}
                                        onChange={(e) => UpdateData(e, "smoking")}
                                    >
                                        <option value="" disabled selected>
                                        </option>
                                        <option value="true">Ναι</option>   
                                        <option value="false">Όχι</option>   
                                    </select>
                                </div>
                                {/** alcohol */}
                                <div className={styles.formInput} style={{ marginTop: '1.5rem' }}>
                                    <label htmlFor="alcohol">Αλκοόλ</label>
                                    <select 
                                        name="alcohol"
                                        title="Επιλέξτε αν ο ασθενής καταναλώνει αλκόολ."
                                        value={pData.alcohol}
                                        onChange={(e) => UpdateData(e, "alcohol")}
                                    >
                                        <option 
                                            value="" 
                                            disabled
                                            selected
                                        >
                                        </option>
                                        <option value="true">Ναι</option>   
                                        <option value="false">Όχι</option>   
                                    </select>
                                </div>
                                {/** surgeries */}
                                <div className={styles.formInput}>
                                    <label htmlFor="surgery">Χειρουργία</label>
                                    <textarea 
                                        name="surgery" 
                                        title="Εισάγετε χειρουργεία που @ ασθενής έχει πραγματοποιήσει"
                                        placeholder="Αν θέλετε να εισάγετε πολλαπλά χειρουργεία, πατήστε το πλήκτρο Enter μετά από κάθε καταχώρηση."
                                        value={pData.surgeries}
                                        onChange={(e) => UpdateData(e,"surgeries")}
                                    ></textarea>
                                </div>
                                {/** allergies */}
                                <div className={styles.formInput}>
                                    <label htmlFor="allergies">Αλλεργίες</label>
                                    <textarea 
                                        name="allergies"
                                        title="Εισάγετε αλλεργία αν @ χρήστης διαθέτει κάποια."
                                        placeholder="Αν θέλετε να εισάγετε πολλαπλές καταχωρήσεις, πατήστε το πλήκτρο Enter μετά από κάθε καταχώρηση."
                                        value={pData.allergies}
                                        onChange={(e) => UpdateData(e,"allergies")}
                                    />
                                </div>
                                {/** chronic diseases */}
                                <div className={styles.formInput}>
                                    <label htmlFor="chronicDiseases">Χρόνιες Παθήσεις</label>
                                    <textarea 
                                        name="chronicDiseases"
                                        title="Εισάγετε χρόνια πάθηση αν @ χρήστης νοσεί από κάποια."
                                        placeholder="Αν θέλετε να εισάγετε πολλαπλές παθήσεις, πατήστε το πλήκτρο Enter μετά από κάθε καταχώρηση."
                                        value={pData.chronicDiseases}
                                        onChange={(e) => UpdateData(e,"chronicDiseases")}
                                    />
                                </div>
                                {/** chronic medicines */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Χρόνιες Φαρμακευτικές Αγωγές</label>
                                    {selectedTreatments?.length == 0 && (
                                        <p> Δεν έχουν επιλεχθεί Χρόνιες Φαρμακευτικές Αγωγές ακόμα. </p>
                                    )}
                                    {selectedTreatments?.length > 0 && (
                                        <div className={styles.treatmentsPreview}>
                                            {selectedTreatments.map((val) => {
                                                const tr = treatments.find((t) => t.value === val);
                                                return (
                                                    <span key={val} className={styles.treatmentBadge} title={tr?.label}>
                                                        {tr?.label ?? val}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <button 
                                        type="button"
                                        name="viewModal"
                                        onClick={() => {
                                            setSavedTreatments([...selectedTreatments]);
                                            setTreatmentState({ visible: true, action: false })
                                        }}
                                    >
                                        {selectedTreatments?.length > 0 ? "Επεξεργασία" : "Προσθήκη"}
                                    </button>
                                </div>

                                {treatmentState.visible && (
                                    <div className={styles.utilsModal}>
                                        <div className={styles.utilsModalScroll}>
                                            <div className={styles.utilsModalContent}>
                                                <div className={styles.utilsModalHeader}>
                                                    <h3>Επιλογή Φαρμακευτικών Αγωγών</h3>
                                                    <button 
                                                        onClick={handleCloseModalTreatment}
                                                        className={styles.modalCloseButton}
                                                    >
                                                        <IoClose />
                                                    </button>
                                                </div>

                                                <Input
                                                    placeholder="Αναζήτηση Φαρμακευτικών Αγωγών"
                                                    name="searchTreatments"
                                                    value={searchTreatments}
                                                    onChange={(e) => setSearchTreatments(e.target.value)}
                                                />

                                                <Menu
                                                    className={styles.menu}
                                                    selectable
                                                    multiple
                                                    selectedKeys={selectedTreatments ?? []}
                                                    onClick={({ key }) => handleSelectTreatment(key)}
                                                >
                                                    {(treatments.filter((trtmnt) =>
                                                    trtmnt.label.toLowerCase().includes(searchTreatments.toLowerCase())
                                                    ) ?? []).map((trtmnt) => (
                                                    <Menu.Item key={trtmnt.value}>
                                                        {highlightMatch(trtmnt.label, searchTreatments)}
                                                    </Menu.Item>
                                                    ))}
                                                </Menu>

                                                <div className={styles.utilsModalActions}>
                                                    <button
                                                        type="button"
                                                        name="clear"
                                                        title="Εκκαθάριση"
                                                        onClick={() => ClearSelectedItems("treatments")}
                                                    >
                                                        Εκκαθάριση
                                                    </button>
                                                    <button
                                                        type="button"
                                                        name="save"
                                                        title="Αποθήκευση"
                                                        onClick={() => {
                                                            setSavedTreatments([...selectedTreatments]); // save current as new baseline
                                                            setTreatmentState({ visible: false, action: false });
                                                        }}
                                                    >
                                                        Αποθήκευση
                                                    </button>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>     
                                )}
                            </div>
                        </>
                    );
                      
            case 3: 
                    return (
                        <>
                            <div className={styles.formSection} ref={formSectionRef}>
                                {/** operation leg */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Σκέλος Επέμβασης<span className={styles.required}> *</span></label>
                                    <select 
                                        name="legOperation"
                                        title="legOperation"
                                        value={pData.legOperation}
                                        onChange={(e) => UpdateData(e, "legOperation")}
                                    >
                                        <option value="" selected disabled></option>
                                        <option value="right">Δεξί</option>       
                                        <option value="left">Αριστερό</option>       
                                    </select>
                                </div>
                                {/** operation status */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Κατάσταση Επέμβασης<span className={styles.required}> *</span></label>
                                    <select 
                                        name="primary"
                                        title="Κατάσταση Επέμβασης"
                                        value={pData.primary}
                                        onChange={(e) => UpdateData(e, "primary")}
                                    >
                                        <option value="" selected disabled></option>
                                        <option value="true">Πρωτοπαθής</option>       
                                        <option value="false">Αναθεώρηση</option>       
                                    </select>
                                </div>
                                {/** supervisor doctor */}
                                <div className={styles.formInput}>
                                    <label htmlFor="supervisorDoctor">Επιβλέπων Ιατρός<span className={styles.required}> *</span></label>
                                    <input 
                                        type="text"
                                        name="supervisorDoctor"
                                        title="supervisorDoctor"
                                        value={pData.supervisorDoctor}
                                        onChange={(e) => UpdateData(e, "supervisorDoctor")} 
                                        required
                                    />
                                </div>
                                {/** entry date */}
                                <div className={styles.formInput}>
                                    <label htmlFor="entryDate">Ημερομηνία Εισαγωγής</label>
                                    <input 
                                        type="date"
                                        name="entryDate"
                                        title="entryDate"
                                        value={pData.entryDate}
                                        onChange={(e) => UpdateData(e, "entryDate")} 
                                        required
                                    />
                                </div>

                                {/** operation date */}
                                <div className={styles.formInput}>
                                    <label htmlFor="operationDate">Ημερομηνία Επέμβασης</label>
                                    <input 
                                        type="date"
                                        name="operationDate"
                                        title="operationDate"
                                        value={pData.operationDate}
                                        onChange={(e) => UpdateData(e, "operationDate")} 
                                        required
                                    />
                                </div>
                                {/** exit date */}
                                <div className={styles.formInput}>
                                    <label htmlFor="exitDate">Ημερομηνία Εξόδου</label>
                                    <input 
                                        type="date"
                                        name="exitDate"
                                        title="exitDate"
                                        value={pData.exitDate}
                                        onChange={(e) => UpdateData(e, "exitDate")} 
                                        required
                                    />
                                </div>
                                {/** medical files - x-ray, pdf, png */}
                                <div className={styles.formInput}>
                                    <label htmlFor="medicalFiles">Ιατρικά Αρχεία (X-ray, PDF, PNG)</label>
                                    {selectedMedicalFiles?.length == 0 && (
                                        <p>Δεν έχουν προστεθεί αρχεία ακόμα.</p>
                                    )}
                                    {selectedMedicalFiles?.length > 0 && (
                                        <div className={styles.medicalFilesPreview}>
                                            {selectedMedicalFiles.map((file, index) => (
                                                <span key={index} className={styles.fileBadge} title={file.name}>
                                                    {file.name}
                                                    <button
                                                        type="button"
                                                        className={styles.removeBadgeBtn}
                                                        onClick={() => RemoveMedicalFile(file.name)}
                                                        title="Διαγραφή αρχείου"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <label className={styles.fileInputLabel} htmlFor="medicalFileInput">
                                        Προσθήκη
                                    </label>
                                    <input 
                                        id="medicalFileInput"
                                        type="file"
                                        name="medicalFiles"
                                        title="medicalFiles"
                                        accept=".pdf,.png,.jpg,.jpeg,.dcm"
                                        onChange={(e) => HandleMedicalFileChange(e)}
                                    />
                                </div>
                            </div>
                        </>
                    );
            case 4: 
                    return (
                        <>
                            <div className={styles.formSection} ref={formSectionRef}>
                                {/* pre-operation instructions */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Προεγχειρητικές Οδηγίες</label>
                                    {selectedPreInstr?.length == 0 && (
                                        <p> Δεν έχουν επιλεχθεί Προεγχειρητικές Οδηγίες ακόμα. </p>
                                    )}
                                    {selectedPreInstr?.length > 0 && (
                                        <div className={styles.treatmentsPreview}>
                                            {selectedPreInstr.map((val) => {
                                                const instr = preInstructions.find((t) => t.value === val);
                                                return (
                                                    <span key={val} className={styles.treatmentBadge} title={instr?.label}>
                                                        {instr?.label ?? val}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        name="viewModal"
                                        onClick={() => {
                                            setSavedPreInstr([...selectedPreInstr]);
                                            setInstrState({ visible: true, action: false })
                                        }}
                                    >
                                        {selectedPreInstr?.length > 0 ? "Επεξεργασία" : "Προσθήκη"}
                                    </button>
                                </div>
                                {instrState.visible && (
                                    <div className={styles.utilsModal}>
                                        <div className={styles.utilsModalScroll}>
                                            <div className={styles.utilsModalContent}>
                                                <div className={styles.utilsModalHeader}>
                                                    <h3>Επιλογή Προεγχειρητικών Οδηγιών</h3>
                                                    <button
                                                        onClick={handleCloseModalInstruction}
                                                        className={styles.modalCloseButton}
                                                    >
                                                        <IoClose />
                                                    </button>
                                                </div>
                                                <Input
                                                    placeholder="Αναζήτηση Προεγχειρητικών Οδηγιών"
                                                    name="searchTreatments"
                                                    value={searchTermInstructions}
                                                    onChange={(e) => setSearchTermInstructions(e.target.value)}
                                                />
                                                <Menu
                                                    className={styles.menu}
                                                    selectable
                                                    multiple
                                                    selectedKeys={selectedPreInstr ?? []}
                                                    onClick={({ key }) => handleSelectInstruction(key)}
                                                >
                                                    {(preInstructions.filter((instr) =>
                                                        instr.label.toLowerCase().includes(searchTermInstructions.toLowerCase())
                                                    ) ?? []).map((instr) => (
                                                        <Menu.Item key={instr.value}>
                                                            {highlightMatch(instr.label, searchTermInstructions)}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu>
                                                <div className={styles.utilsModalActions}>
                                                    <button
                                                        type="button"
                                                        name="clear"
                                                        title="Εκκαθάριση"
                                                        onClick={() => ClearSelectedItems("instructions")}
                                                    >
                                                        Εκκαθάριση
                                                    </button>
                                                    <button
                                                        type="button"
                                                        name="save"
                                                        title="Αποθήκευση"
                                                        onClick={() => {
                                                            setSavedPreInstr([...selectedPreInstr]); // save current as new baseline
                                                            setInstrState({ visible: false, action: false });
                                                        }}
                                                    >
                                                        Αποθήκευση
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* pre-operation exercises */}
                                <div className={styles.formInput}>
                                    <label htmlFor="">Προεγχειρητικές Ασκήσεις</label>
                                    {selectedPreEx?.length == 0 && (
                                        <p> Δεν έχουν επιλεχθεί Προεγχειρητικές Ασκήσεις ακόμα. </p>
                                    )}
                                    {selectedPreEx?.length > 0 && (
                                        <div className={styles.treatmentsPreview}>
                                            {selectedPreEx.map((val) => {
                                                const instr = preExcercises.find((t) => t.value === val);
                                                return (
                                                    <span key={val} className={styles.treatmentBadge} title={instr?.label}>
                                                        {instr?.label ?? val}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        name="viewModal"
                                        onClick={() => {
                                            setSavedPreEx([...selectedPreEx]);
                                            setExsState({ visible: true, action: false })
                                        }}
                                    >
                                        {selectedPreEx?.length > 0 ? "Επεξεργασία" : "Προσθήκη"}
                                    </button>
                                </div>
                                {exsState.visible && (
                                    <div className={styles.utilsModal}>
                                        <div className={styles.utilsModalScroll}>
                                            <div className={styles.utilsModalContent}>
                                                <div className={styles.utilsModalHeader}>
                                                    <h3>Επιλογή Προεγχειρητικών Ασκήσεων</h3>
                                                    <button
                                                        onClick={handleCloseModalExercise}
                                                        className={styles.modalCloseButton}
                                                    >
                                                        <IoClose />
                                                    </button>
                                                </div>
                                                <Input
                                                    placeholder="Αναζήτηση Προεγχειρητικών Ασκήσεων"
                                                    name="searchExercises"
                                                    value={searchTermExercises}
                                                    onChange={(e) => setSearchTermExercises(e.target.value)}
                                                />
                                                <Menu
                                                    className={styles.menu}
                                                    selectable
                                                    multiple
                                                    selectedKeys={selectedPreEx ?? []}
                                                    onClick={({ key }) => handleSelectExercise(key)}
                                                >
                                                    {(preExcercises.filter((instr) =>
                                                        instr.label.toLowerCase().includes(searchTermExercises.toLowerCase())
                                                    ) ?? []).map((instr) => (
                                                        <Menu.Item key={instr.value}>
                                                            {highlightMatch(instr.label, searchTermExercises)}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu>
                                                <div className={styles.utilsModalActions}>
                                                    <button
                                                        type="button"
                                                        name="clear"
                                                        title="Εκκαθάριση"
                                                        onClick={() => ClearSelectedItems("exercises")}
                                                    >
                                                        Εκκαθάριση
                                                    </button>
                                                    <button
                                                        type="button"
                                                        name="save"
                                                        title="Αποθήκευση"
                                                        onClick={() => {
                                                            setSavedPreEx([...selectedPreEx]); // save current as new baseline
                                                            setExsState({ visible: false, action: false });
                                                        }}
                                                    >
                                                        Αποθήκευση
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    );
            case 5 :
                    return (
                        <>
                            <div className={styles.formSection} ref={formSectionRef}>
                                <div className={styles.formInput}>
                                    <label htmlFor="comments">Σχόλια</label>
                                    <textarea
                                        name="comments"
                                        title="Λοιπά Σχόλια"
                                        placeholder="Αν θέλετε να εισάγετε πολλαπλά σχόλια, πατήστε το πλήκτρο Enter μετά από κάθε σχόλιο."
                                        onChange={(e) => UpdateData(e, "comments")}
                                    />
                                </div>
                            </div>
                        </>
                    );
            default:
                return <></>;
        }
    };

    /**
     * 
     * @returns 
     */
    const FormActionButtons = () => {
            return (
                <div className={styles.clearOptions}>
                    {showOptions && (
                        <div className={styles.availableOptions} ref={optionsRef}>
                            <button
                                type="button"
                                name="clear-current"
                                title="Εκκαθάριση Στοιχείων"
                                onClick={() => handleClear("current",false)}
                            >
                                Εκκαθάριση Τρέχουσας Ενότητας
                            </button>
                            <button
                                type="button"
                                name="clear-all"
                                title="Εκκαθάριση Στοιχείων"
                                onClick={() => handleClear("all",false)}
                                >
                                    Εκκαθάριση Όλων
                            </button>
                        </div>
                    )}
                    <div className={styles.unavailableOptions}>
                        <button
                            type="button"
                            name="clear"
                            title="Εκκαθάριση Στοιχείων"
                            onClick={() => setShowOptions(true)}>Εκκαθάριση
                        </button>
                    </div>
                </div>
            );
        // }
    };

    /**
     * 
     * @param key 
     */
    const handleSelectInstruction = (key: string) => {
        setInstrState({
            visible: true,
            action: false
        });
        setSelectedPreInst((prev) => {
            const isSelected = prev?.includes(key);
            /** add or remove instruction */
            const updatedSelection = isSelected
            ? prev?.filter((instr) => instr !== key) ?? []
            : [...(prev ?? []), key];
            /** update pData */
            setPData((prevData) => ({
                ...prevData,
                preInstructions: updatedSelection,
            }));
          
          console.log(pData);
          return updatedSelection;
        });
    };
    
    /**
     * 
     * @param key 
     */
    const handleSelectExercise = (key: string) => {
        setSelectedPreEx((prev) => {
          const isSelected = prev?.includes(key);
          /** add or remove exercise */
          const updatedSelection = isSelected
            ? prev?.filter((exercise) => exercise !== key) ?? []
            : [...(prev ?? []), key];
            /** update pData */
          setPData((prevData) => ({
            ...prevData,
            preExercises: updatedSelection,
          }));
          
          console.log(pData);
          return updatedSelection;
        });
    };

    /**
     * 
     * @param key 
     */
    const handleSelectTreatment = (key: string) => {
        setTreatmentState({
            visible: true,
            action: false,
        });
        setSelectedTreatments((prev) => {
            const isSelected = prev?.includes(key);
            /** add or remove the treatment */
            const updatedSelection = isSelected
            ? prev?.filter((treatment) => treatment != key) ?? []
            : [...(prev ?? []), key];
            /** update pData */
            setPData((prevData) => ({
                ...prevData,
                treatments: updatedSelection
            }));
            console.log(pData);
            return updatedSelection;
        })
    }

    const handleCloseModalInstruction = () => {
        setSelectedPreInst([...savedPreInstr]);
        CloseUtils("instructions");
    };

    const handleCloseModalExercise = () => {
        setSelectedPreEx([...savedPreEx]);
        CloseUtils("exercises");
    };

    const handleCloseModalTreatment = () => {
        setSelectedTreatments([...savedTreatments]);
        CloseUtils("treatments");
    };
    
    /**
     * 
     * @param option 
     */
    const ClearSelectedItems = (option: "instructions" | "exercises" | "treatments") => {
        switch (option) {
            case "instructions":
                setInstrState({
                    visible: true,
                    action: false
                });
                setSelectedPreInst([]);
                setPData((prevData) => ({
                    ...prevData,
                    preInstructions: [],
                  }));
                break;
            case "exercises":
                setSelectedPreEx([]);
                setPData((prevData) => ({
                    ...prevData,
                    preExercises: [],
                  }));
                break;
            case "treatments":
                setTreatmentState({
                    visible: true,
                    action: false
                });
                setSelectedTreatments([]);
                setPData((prevData) => ({
                    ...prevData,
                    treatments:[],
                }));
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param option 
     * @param value 
     */
    const RemoveSelectedItem = (option: "instruction" | "exercise" | "treatments", value: string) => {
        switch (option) {
            case "instruction":
                setSelectedPreInst((prev) => {
                    const updatedSelection = prev?.filter((instruction) => instruction !== value) ?? [];
                    setPData((prevData) => ({
                        ...prevData,
                        preInstructions: updatedSelection,
                    }));
                    console.log("Updated Instructions:", updatedSelection);
                    return updatedSelection;
                });
                break;
    
            case "exercise":
                setSelectedPreEx((prev) => {
                    const updatedSelection = prev?.filter((exercise) => exercise !== value) ?? [];
                    setPData((prevData) => ({
                        ...prevData,
                        preExercises: updatedSelection,
                    }));
                    console.log("Updated Exercises:", updatedSelection);
                    return updatedSelection;
                });
                break;
            case "treatments":
                setTreatmentState((prev) => {
                    const updatedSelection = prev?.filter((treatment) => treatment != value) ?? [];
                    setPData((prevData) => ({
                        ...prevData,
                        treatments: updatedSelection,
                    }));
                    console.log("Updated Treatments:", updatedSelection);
                    return updatedSelection;
                })
                break;
            default:
                break;
        }
    };

    const PrevFormSection = () => {
        setFormState((prev) => Math.max(1, prev - 1)); // Prevent going below 1
    };

    const NextFormSection = () => {
        setFormState((prev) => Math.min(5, prev + 1)); // Prevent exceeding the last step
    };

    /**
     * 
     * @param value 
     * @param field 
     * @returns 
     */
    const CheckForNumericErrors = (value: string, field: keyof PatientInterface) => {
        const inputVal = value;
        const numRgx = /^\d*$/; 
        const numericFields = [
            { field: "amka", label: "ΑΜΚΑ" },
            { field: "mobilephone", label: "Τηλέφωνο Επικοινωνίας" },
            { field: "height", label: "Ύψος" },
            { field: "weight", label: "Βάρος" },
        ];
        const matchingField = numericFields.find((f) => f.field === field);        

        if(!numRgx.test(inputVal) && matchingField) {
            return {
                result: true,
                field: matchingField.label,
            }
        }
    };

    /**
     * 
     * @param value 
     */
    const hideAlerts = (value: boolean) => {
        setNumericError(value);
        setMissingFdError(value);
    };

    /**
     * 
     * @param e 
     * @param field 
     */
    const UpdateData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field: keyof PatientInterface) => {
        hideAlerts(false);
        let newVal: string | number | boolean = e.target.value;
        if(uppercaseFields.includes(field)) {
            newVal = newVal.toUpperCase();
        } 
        if(booleanFields.includes(field)) {
            const boolVal = newVal === "true";
            switch(field) {
                case "alcohol":
                    setIsAlcohol(boolVal);
                    console.log("is-alcohol value: ", isAlcohol);
                    break;
                case "smoking":
                    setIsSmoking(boolVal);
                    console.log("is-smoking value: ", isSmoking);
                    break;
                case "primary":
                    setIsPrimary(boolVal);
                    console.log("is-primary value:", isPrimary);
                    break;
            }
        };
        const numGuard = CheckForNumericErrors(newVal, field);
        if(numGuard?.result) {
            setField(numGuard.field);
            setNumericError(true);
            return;
        }
        
        setPData((prevData) => ({
            ...prevData,
            [field]: newVal,
        })); 
    };

    /**
     * Handles medical file upload (X-ray, PDF, PNG)
     * @param e 
     */
    const HandleMedicalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedMedicalFiles((prev) => [...prev, file]);
            setPData((prevData) => {
                const existingFiles = prevData.medicalFiles && prevData.medicalFiles.trim() 
                    ? prevData.medicalFiles.split(',').map(f => f.trim())
                    : [];
                const updatedFiles = [...existingFiles, file.name].join(",");
                return {
                    ...prevData,
                    medicalFiles: updatedFiles
                };
            });
        }
    };

    /**
     * Removes a medical file from the list
     * @param fileName 
     */
    const RemoveMedicalFile = (fileName: string) => {
        const updatedFiles = selectedMedicalFiles.filter((file) => file.name !== fileName);
        setSelectedMedicalFiles(updatedFiles);
        setPData((prevData) => ({
            ...prevData,
            medicalFiles: updatedFiles
                .map((f) => f.name)
                .join(",")
        }));
    };

    /**
     * 
     * @param patient 
     * @returns 
     */
    const CheckForMissingRequiredFields = (patient: NewPatient) => {
        const requiredFields: Array<keyof NewPatient> = [
            "firstname", 
            "lastname", 
            "amka", 
            "mobilephone", 
            "height", 
            "weight",
            "legOperation", 
            "supervisorDoctor",
            "birthdate",
        ];

        const missingFields = requiredFields.filter((field) => {
            return !patient[field] || patient[field] === "";
        });

        return {
            missing: missingFields.length > 0,
            missingFields,
        };
    };

    const safeDate = (value: string): Date | null => {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    /**
     * 
     * @param e 
     * @returns 
     */
    const SubmitAction = async(e: React.FormEvent) => {

        e.preventDefault();

        const newPatient: NewPatient = {
            ...pData,
            admin: currentDoctorData ? currentDoctorData._id : "",
            alcohol: isAlcohol,
            smoking: isSmoking,
            primary: isPrimary,
            isPreoperation: true,
            birthdate: pData.birthdate ? new Date(pData.birthdate) : new Date(),
            entryDate: pData.entryDate ? new Date(pData.entryDate) : null,
            operationDate: pData.operationDate ? new Date(pData.operationDate) : null,
            exitDate: pData.exitDate ? new Date(pData.exitDate) : null,
            medicalFiles: selectedMedicalFiles.map((f) => f.name).join(","),
        };


        const { missing, missingFields } = CheckForMissingRequiredFields(newPatient); 

        if(missing) {
            console.log("Missing fields: ", missingFields);
            const firstMissing = missingFields[0];
            setField(fieldLabels[firstMissing] || firstMissing);
            setMissingFdError(true);
            return;
        }

        try {
            const result = await CreatePatient(newPatient);

            if(!result?.state || !result.state) {
                const error = result?.errorCase;
                let message = "";
                if(error === "missingField") {
                    message = "Λείπει κάποιο υποχρεωτικό πεδίο. Παρακαλώ ελέγξτε τα στοιχεία και δοκιμάστε ξανά.";
                } else if(error === "duplicatedField") {
                    const serverMsg = result?.message || "";
                    const match = serverMsg.match(/fields?:\s*(.+?)(?:\.|,?\s*Each)/i);
                    if (match) {
                        const rawFields = match[1].split(",").map((f: string) => f.trim());
                        const translatedFields = rawFields.map((f: string) => fieldLabels[f] || f);
                        message = `Υπάρχει ήδη ασθενής με ίδιο: ${translatedFields.join(", ")}. Παρακαλώ ελέγξτε και δοκιμάστε ξανά.`;
                    } else {
                        message = "Υπάρχει ήδη ασθενής με τα ίδια στοιχεία. Παρακαλώ ελέγξτε και δοκιμάστε ξανά.";
                    }
                } else {
                    message = "Προέκυψε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.";
                }
                setErrorMessage(message);
                throw new Error(error);
            }

            // Upload medical files after patient creation
            if (result?.patient && selectedMedicalFiles.length > 0) {
                const patientId = result.patient._id || result.patient.id;
                const uploadResult = await uploadMedicalFiles(patientId, selectedMedicalFiles);
                if (!uploadResult.success) {
                    console.warn("File upload warning:", uploadResult.message);
                }
            }
        } catch (error) {
            console.error("Submission Error: ", error);
            setFinalState(true);
            setResponseStatus(false);
            setFormState(6);
            setShowAlert(true);
            return;
        }
        setErrorMessage("");
        setFinalState(true);
        setResponseStatus(true);
        setFormState(6);
    };

    /**
     * 
     * @returns 
     */
    const DisplayALert = () => {
        if(numericError) {
            return (
                <RgPtAlert
                    option="numericError"
                    field={field}
                />
            );
        }
        if(missingFdError) {
            return (
                <RgPtAlert
                    option="missingFieldError"
                    field={field}
                />
            );
        }
        if(finalState) {
            switch(responseStatus) {
                case true:
                    return (
                        <RgPtAlert
                            option="handleSubmit"
                            state={responseStatus}
                        />
                    );
                case false:
                    return(
                        <RgPtAlert
                            option="handleSubmit"
                            state={responseStatus}
                            errorMessage={errorMessage}
                            onClose={() => {
                                setFinalState(false);
                                setResponseStatus(false);
                                setStatusText("");
                                setErrorMessage("");
                                setFormState(1);
                                setShowAlert(true);
                            }}
                        />     
                    );
                default:
                    return <></>;
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptions(false); // Hide when clicked outside
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(finalState === true) {
            const timer = setTimeout(() => {
                setStatusText(responseStatus ? "Ολοκληρώθηκε" : "Προέκυψε Σφάλμα");
                setShowAlert(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert, finalState, responseStatus])


    return (
        <main className={styles.main}>
            <div className={styles.page}>
                {showAlert && DisplayALert()}
                <div className={styles.header}>
                    <button
                        type='button'
                        title='Πίσω'
                        name='bck-btn'
                        onClick={BackAction}>{<IoMdArrowRoundBack/>}
                    </button>
                    <p>Φόρμα Εγγραφής Νέου Ασθενή <FaChevronRight/> {formSections[formState]}</p>
                </div>
                <div className={styles.container}>
                    <div className={styles.container_aside}>
                        <div className={styles.stepper}>
                            <div className={`${styles.step} ${formState === 1 ? styles.active : ''}`}>
                                <div className={styles.circle}>1</div>
                                <div className={styles.label}>Δημογραφικά Στοιχεία</div>
                            </div>
                            <div className={`${styles.step} ${formState === 2 ? styles.active : ''}`}>
                                <div className={styles.circle}>2</div>
                                <div className={styles.label}>Ατομικό Αναμνηστικό</div>
                            </div>
                            <div className={`${styles.step} ${formState === 3 ? styles.active : ''}`}>
                                <div className={styles.circle}>3</div>
                                <div className={styles.label}>Πληροφορίες Επέμβασης</div>
                            </div>
                            <div className={`${styles.step} ${formState === 4 ? styles.active : ''}`}>
                                <div className={styles.circle}>4</div>
                                <div className={styles.label}>Οδηγίες & Ασκήσεις</div>
                            </div>
                            <div className={`${styles.step} ${formState === 5 ? styles.active : ''}`}>
                                <div className={styles.circle}>5</div>
                                <div className={styles.label}>Σχόλια</div>
                            </div>
                            <div className={`${styles.state} ${finalState ? styles.active : ''}`}>
                                <div className={styles.circle}>6</div>
                                {/* <div className={styles.label}>Κατάσταση</div> */}
                                {   
                                    !finalState ? 
                                    (
                                        <div className={styles.label}>Κατάσταση: </div>
                                    ) : (
                                        <div className={styles.label}>
                                            <p>Κατάσταση: </p>
                                            <p className={responseStatus ? styles.success : styles.failure}><b>{statusText}</b></p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className={styles.container_main}>
                        {formState < 6  && (
                            <form onSubmit={SubmitAction} noValidate>
                                <div className={styles.formContent} ref={formContentRef}>
                                    {FormSections()}
                                </div>
                                <div className={styles.formNavBtns}>
                                    <button
                                        type="button"
                                        title="Προηγούμενο Βήμα"
                                        onClick={PrevFormSection}
                                    >
                                        {<IoMdArrowRoundBack size={18}/>} Προηγούμενο Βήμα
                                    </button>
                                    {formState === 5 ? (
                                        <>
                                            <button
                                                // type="submit"
                                                type="button"
                                                title="Υποβολή Νέου Ασθενή"
                                                onClick={SubmitAction}
                                            >
                                                Υποβολή {<IoMdArrowRoundForward size={18}/>}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                title="Επόμενο Βήμα"
                                                onClick={NextFormSection}>Επόμενο Βήμα {<IoMdArrowRoundForward size={18}/>}
                                            </button>
                                        </>
                                    )}
                                    
                                </div>
                                <div className={styles.formActionBtns}>
                                    {FormActionButtons()}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};


function highlightMatch(text: string, searchTerm: string) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = (text || '').split(regex);
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <span key={index} style={{ backgroundColor: 'lightblue' }}>{part}</span> 
        : part
    );
};