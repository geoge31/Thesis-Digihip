/**
 * Register Patient page
 * This component provides the register-patient page of DiGiHip Application
 * Author: @gioge31
 * src>app>digihip>register-patient
 */

"use client";

import styles from "./css/RegisterPatient.module.css";
import { useEffect, useState } from "react";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { useRouter } from "next/navigation";
import { preInstructions } from "@/utils/instructions/instructionsModule";
import { preExcercises } from "@/utils/exercises/exercisesModule";
import { medications } from "@/utils/medications/medicationsModule";
import CustomConfirm from "@/customUtils/confirms/CustomConfirm";
import CustomAlert from "@/components/Alerts/customAlert";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { IoClose } from "react-icons/io5";

interface Doctor {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PatientData {
  firstname: string;
  lastname: string;
  birthdate: string;
  age: string;
  amka: string;
  amedcode: string;
  email: string;
  mobilephone: string;
  address: string;
  height: string;
  weight: string;
  bloodtype: string;
  medicines: string[];
  chronicDiseases: string;
  chronicMedicines: string;
  pastOperations: string;
  allergies: string;
  isSmoking: boolean | null;
  isDrinking: boolean | null;
  supervisorDoctor: string;
  isPreoperation: boolean;
  currentStage: string;
  legOperation: string;
  entryDate: string;
  operationDate: string;
  exitDate: string;
  preInstructions: string[];
  preExercises: string[];
  registrationDate: string;
  itsAdmin: Doctor;
}

const sections = [
  "demographics",
  "medicalHistory",
  "operationDetails",
  "instrAndExrs",
  "submitPatient",
];

export default function RegisterPatient() {
  const { currentDoctorData, loading } = useDoctor();
  const router = useRouter();

  const doctor = currentDoctorData ? currentDoctorData : null;

  const doctor_fullname = `${doctor?.firstName} ${doctor?.lastName}`;
  const doctor_username = doctor?.username;

  const [calculatedAge, setCalculatedAge] = useState("");
  const [, setError] = useState<string | null>(null);

  // form button : next and previous page
  const [currentPage, setCurrentPage] = useState(0);

  // modals
  const [preInstructionsModal, setPreInstructionsModal] = useState(false);
  const [preExercisesModal, setPreExercisesModal] = useState(false);
  const [medicinesModal, setMedicinesModal] = useState(false);

  // selected fields in modals
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>(
    []
  );
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  // search term
  const [searchTerm, setSearchTerm] = useState("");

  // extra fields
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertNew, setShowAlertNew] = useState(false);
  // showAlertNew
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [hasAllergies, setHasAllergies] = useState(false);
  const [hasPreOperations, setHasPreOperations] = useState(false);
  const [hasChronicDiseases, setHasChronicDiseases] = useState(false);
  const [hasChronicMedicines, setHasChronicMedicines] = useState(false);

  const requiredFields: (keyof typeof patientData)[] = [
    "firstname",
    "lastname",
    "birthdate",
    "amka",
    "amedcode",
    "email",
    "mobilephone",
    "height",
    "weight",
    "bloodtype",
    "supervisorDoctor",
    "currentStage",
    "legOperation",
    "itsAdmin",
  ];

  const [patientData, setPatientData] = useState<PatientData>({
    firstname: "",
    lastname: "",
    birthdate: "",
    age: "",
    amka: "",
    amedcode: "",
    email: "",
    mobilephone: "",
    address: "",
    height: "",
    weight: "",
    bloodtype: "",
    medicines: [],
    chronicDiseases: "",
    chronicMedicines: "",
    allergies: "",
    pastOperations: "",
    isSmoking: null,
    isDrinking: null,
    supervisorDoctor: "",
    isPreoperation: true,
    currentStage: "ΠΡΟΕΓΧΕΙΡΗΤΙΚΟ",
    legOperation: "",
    entryDate: "",
    operationDate: "",
    exitDate: "",
    preInstructions: [],
    preExercises: [],
    registrationDate: "",
    itsAdmin: currentDoctorData as Doctor,
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const birthDate = new Date(value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    setPatientData({
      ...patientData,
      birthdate: value,
    });

    setCalculatedAge(age.toString());
  };

  const handleValueDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    console.log(`received: name - ${name} , value - ${value}`);

    if (name === "isSmoking" || name === "isDrinking") {
      const booleanValue = value === "true";
      setPatientData({ ...patientData, [name]: booleanValue });
    } else if (
      name === "amedcode" ||
      name === "email" ||
      name === "chronicDiseases" ||
      name === "chronicMedicines" ||
      name === "pastOperations" ||
      name === "allergies"
    ) {
      setPatientData({ ...patientData, [name]: value });
    } else {
      const updatedValue = value.toUpperCase();
      setPatientData({ ...patientData, [name]: updatedValue });
    }

    console.log(patientData);
  };

  const filteredMedications = medications.filter((medication) =>
    medication.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstructions = preInstructions.filter((instruction) =>
    instruction.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExercises = preExcercises.filter((exercise) =>
    exercise.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string,
    category: "medications" | "instructions" | "exercises"
  ) => {
    if (e.target.checked) {
      switch (category) {
        case "medications":
          setSelectedMedications((prev) => [...prev, value]);
          break;
        case "instructions":
          setSelectedInstructions((prev) => [...prev, value]);
          break;
        case "exercises":
          setSelectedExercises((prev) => [...prev, value]);
          break;
      }
    } else {
      switch (category) {
        case "medications":
          setSelectedMedications((prev) =>
            prev.filter((medication) => medication !== value)
          );
          break;
        case "instructions":
          setSelectedInstructions((prev) =>
            prev.filter((instruction) => instruction !== value)
          );
          break;
        case "exercises":
          setSelectedExercises((prev) =>
            prev.filter((exercise) => exercise !== value)
          );
          break;
      }
    }
  };

  const handleUnselectItem = (
    item: string,
    category: "medications" | "instructions" | "exercises"
  ) => {
    switch (category) {
      case "medications":
        setSelectedMedications((prev) =>
          prev.filter((selected) => selected !== item)
        );
        break;
      case "instructions":
        setSelectedInstructions((prev) =>
          prev.filter((selected) => selected !== item)
        );
        break;
      case "exercises":
        setSelectedExercises((prev) =>
          prev.filter((selected) => selected !== item)
        );
        break;
    }
  };

  const handleClearAllModals = (
    category: "medications" | "instructions" | "exercises" | "all"
  ) => {
    switch (category) {
      case "medications":
        setSelectedMedications([]);
        break;
      case "instructions":
        setSelectedInstructions([]);
        break;
      case "exercises":
        setSelectedExercises([]);
        break;
      case "all":
        setSelectedMedications([]);
        setSelectedInstructions([]);
        setSelectedExercises([]);
        break;
    }
  };

  const handleSectionClick = (index: number) => {
    setCurrentPage(index);
  };

  const nextPage = () => {
    if (currentPage < sections.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleMedicineModal = () => {
    if (medicinesModal) {
      setMedicinesModal(false);
    } else {
      setMedicinesModal(true);
    }
  };

  const handleInstructionsModal = () => {
    if (preInstructionsModal) {
      setPreInstructionsModal(false);
    } else {
      setPreInstructionsModal(true);
    }
  };

  const handleExercisesModal = () => {
    if (preExercisesModal) {
      setPreExercisesModal(false);
    } else {
      setPreExercisesModal(true);
    }
  };

  const renderFormContent = () => {
    switch (sections[currentPage]) {
      case "demographics":
        return (
          <div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Όνομα <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={patientData.firstname}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Επίθετο <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={patientData.lastname}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Ημερομηνία Γέννησης <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={patientData.birthdate}
                  onChange={(e) => handleDateChange(e)}
                />
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>Ηλικία</label>
                <input
                  type="text"
                  // name="age"
                  value={calculatedAge}
                  disabled
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  ΑΜΚΑ <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="amka"
                  value={patientData.amka}
                  onChange={handleValueDataChange}
                  maxLength={11}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Κωδικός a-med <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="amedcode"
                  value={patientData.amedcode}
                  onChange={handleValueDataChange}
                />
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Email <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={patientData.email}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Κινητό/Τηλέφωνο Επικοινωνίας{" "}
                  <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="mobilephone"
                  value={patientData.mobilephone}
                  onChange={handleValueDataChange}
                  maxLength={10}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>Διεύθυνση Κατοικίας</label>
                <input
                  type="text"
                  name="address"
                  value={patientData.address}
                  onChange={handleValueDataChange}
                />
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Ύψος <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="height"
                  value={patientData.height}
                  onChange={handleValueDataChange}
                  placeholder=" cm"
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Βάρος <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="weight"
                  value={patientData.weight}
                  onChange={handleValueDataChange}
                  placeholder=" kg"
                />
              </div>
            </div>
          </div>
        );
      case "medicalHistory":
        return (
          <div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  {" "}
                  Ομάδα Αίματος <span className={styles.asterisk}>*</span>
                </label>
                <select
                  name="bloodtype"
                  value={patientData.bloodtype}
                  onChange={handleValueDataChange}
                >
                  <option value="" disabled selected>
                    Επιλέξτε ομάδα αίματος.
                  </option>
                  <option value="A +">A +</option>
                  <option value="A -">A -</option>
                  <option value="B +">B +</option>
                  <option value="B -">B -</option>
                  <option value="AB +">AB +</option>
                  <option value="AB -">AB -</option>
                  <option value="0 +">0+</option>
                  <option value="0 -">0-</option>
                </select>
              </div>
              <div className={styles.groupContainer}>
                <label>Φαρμακευτικές Αγωγές</label>
                <button
                  onClick={handleMedicineModal}
                  className={styles.addMedicine}
                >
                  Προσθήκη Φαρμακευτικής Αγωγής
                </button>
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>Χρόνιες Παθήσεις</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="hasChronicDiseases"
                      value="true"
                      checked={hasChronicDiseases === true}
                      onChange={() => setHasChronicDiseases(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="hasChronicDiseases"
                      value="false"
                      checked={hasChronicDiseases === false}
                      onChange={() => setHasChronicDiseases(false)}
                    />
                  </div>
                </div>
                {hasChronicDiseases && (
                  <input
                    type="text"
                    name="chronicDiseases"
                    value={patientData.chronicDiseases}
                    onChange={handleValueDataChange}
                  />
                )}
                {!hasChronicDiseases && (
                  <input
                    type="text"
                    name="chronicDiseases"
                    value={patientData.chronicDiseases}
                    onChange={handleValueDataChange}
                    disabled
                  />
                )}
              </div>
              <div className={styles.groupContainer}>
                <label>Χρόνια Φαρμακευτική Αγωγή</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="hasChronicMedicines"
                      value="true"
                      checked={hasChronicMedicines === true}
                      onChange={() => setHasChronicMedicines(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="hasChronicMedicines"
                      value="false"
                      checked={hasChronicMedicines === false}
                      onChange={() => setHasChronicMedicines(false)}
                    />
                  </div>
                </div>
                {hasChronicMedicines && (
                  <input
                    type="text"
                    name="chronicMedicines"
                    value={patientData.chronicMedicines}
                    onChange={handleValueDataChange}
                  />
                )}
                {!hasChronicMedicines && (
                  <input
                    type="text"
                    name="chronicMedicines"
                    value=""
                    onChange={handleValueDataChange}
                    disabled
                  />
                )}
              </div>
              <div className={styles.groupContainer}>
                <label>Προηγούμενες Χειρουργικές Επεμβάσεις</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="hasPreOperations"
                      value="true"
                      checked={hasPreOperations === true}
                      onChange={() => setHasPreOperations(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="hasPreOperations"
                      value="false"
                      checked={hasPreOperations === false}
                      onChange={() => setHasPreOperations(false)}
                    />
                  </div>
                </div>
                {hasPreOperations && (
                  <input
                    type="text"
                    name="pastOperations"
                    value={patientData.pastOperations}
                    onChange={handleValueDataChange}
                  />
                )}
                {!hasPreOperations && (
                  <input
                    type="text"
                    name="pastOperations"
                    value=""
                    onChange={handleValueDataChange}
                    disabled
                  />
                )}
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>Αλλεργίες</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="hasAllergies"
                      value="true"
                      checked={hasAllergies === true}
                      onChange={() => setHasAllergies(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="hasAllergies"
                      value="false"
                      checked={hasAllergies === false}
                      onChange={() => setHasAllergies(false)}
                    />
                  </div>
                </div>
                {hasAllergies && (
                  <input
                    type="text"
                    name="allergies"
                    value={patientData.allergies}
                    onChange={handleValueDataChange}
                  />
                )}
                {!hasAllergies && (
                  <input
                    type="text"
                    name="allergies"
                    value=""
                    onChange={handleValueDataChange}
                    disabled
                  />
                )}
              </div>
              <div className={styles.groupContainer}>
                <label>Κάπνισμα</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="isSmoking"
                      value="true"
                      checked={patientData.isSmoking === true}
                      onChange={handleValueDataChange}
                      // onChange={()=>setHasChronicMedicines(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="isSmoking"
                      value="false"
                      checked={patientData.isSmoking === false}
                      onChange={handleValueDataChange}
                      // onChange={()=>setHasChronicMedicines(false)}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.groupContainer}>
                <label>Αλκοόλ</label>
                <div className={styles.radioContainer}>
                  <div className={styles.groupSet}>
                    <label>Ναι</label>
                    <input
                      type="radio"
                      name="isDrinking"
                      value="true"
                      checked={patientData.isDrinking == true}
                      onChange={handleValueDataChange}
                      // onChange={()=>setHasChronicMedicines(true)}
                    />
                  </div>
                  <div className={styles.groupSet}>
                    <label>Οχι</label>
                    <input
                      type="radio"
                      name="isDrinking"
                      value="false"
                      checked={patientData.isDrinking == false}
                      onChange={handleValueDataChange}
                      // onChange={()=>setHasChronicMedicines(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "operationDetails":
        return (
          <div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Επιβλέπων Ιατρός <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="supervisorDoctor"
                  value={patientData.supervisorDoctor}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Τρέχον Στάδιο <span className={styles.asterisk}>*</span>
                </label>
                <input type="text" value={patientData.currentStage} disabled />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Σκέλος επέμβασης <span className={styles.asterisk}>*</span>
                </label>
                <select
                  name="legOperation"
                  value={patientData.legOperation}
                  onChange={(e) => handleValueDataChange(e)}
                  // onChange={handleValueDataChange}
                >
                  <option value="" disabled>
                    Επιλέξτε Σκέλος
                  </option>
                  <option value="right">Δεξί</option>
                  <option value="left">Αριστερό</option>
                </select>
              </div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Ημερομηνία Εισαγωγής{" "}
                  <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="date"
                  name="entryDate"
                  value={patientData.entryDate}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label htmlFor="">
                  Ημερομηνία Επέμβασης{" "}
                  <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="date"
                  name="operationDate"
                  value={patientData.operationDate}
                  onChange={handleValueDataChange}
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Ημερομηνία Εξόδου <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="date"
                  name="exitDate"
                  value={patientData.exitDate}
                  onChange={handleValueDataChange}
                />
              </div>
            </div>
          </div>
        );
      case "instrAndExrs":
        return (
          <div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <button
                  className={styles.addInstr}
                  onClick={handleInstructionsModal}
                >
                  Προσθήκη Προεγχειρητικών Οδηγιών
                </button>
              </div>
              <div className={styles.groupContainer}>
                <button
                  className={styles.addExrs}
                  onClick={handleExercisesModal}
                >
                  Προσθήκη Προεγχειρητικών Ασκήσεων
                </button>
              </div>
            </div>
          </div>
        );
      case "submitPatient":
        return (
          <div>
            <div className={styles.rowContainer}>
              <div className={styles.groupContainer}>
                <label>
                  Ημερομηνία Εγγραφής <span className={styles.asterisk}>*</span>
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString()}
                  disabled
                />
              </div>
              <div className={styles.groupContainer}>
                <label>
                  Προστέθηκε από <span className={styles.asterisk}>*</span>
                </label>
                <input type="text" value={doctor_fullname} disabled />
              </div>
              <div className={styles.groupContainer}></div>
            </div>
            <div className={styles.rgstrFormButtons}>
              <button className={styles.clrFields} onClick={handleClear}>
                Εκκαθάριση Στοιχείων
              </button>
              <button
                className={styles.sbmtFields}
                onClick={handleSubmitPatient}
              >
                Οριστική Υποβολή
              </button>
            </div>
          </div>
        );
      default:
        return <div>Select a section to start filling out the form.</div>; // Default content if no section is selected
    }
  };

  const handleClear = () => {
    setPatientData({
      firstname: "",
      lastname: "",
      birthdate: "",
      age: "",
      amka: "",
      amedcode: "",
      email: "",
      mobilephone: "",
      address: "",
      height: "",
      weight: "",
      bloodtype: "",
      medicines: [],
      chronicDiseases: "",
      chronicMedicines: "",
      pastOperations: "",
      isSmoking: null,
      isDrinking: null,
      allergies: "",
      supervisorDoctor: "",
      isPreoperation: true,
      currentStage: patientData.currentStage,
      legOperation: "",
      entryDate: "",
      operationDate: "",
      exitDate: "",
      preExercises: [],
      preInstructions: [],
      itsAdmin: patientData.itsAdmin,
      registrationDate: "",
    });

    setError(null);
    handleClearAllModals("all");
  };

  const handleSubmitPatient = async () => {
    const fieldNames: { [key in keyof PatientData]?: string } = {
      firstname: "Όνομα",
      lastname: "Επίθετο",
      birthdate: "Ημερομηνία Γέννησης",
      amka: "ΑΜΚΑ",
      amedcode: "Κωδικός amed",
      height: "Ύψος",
      weight: "Βάρος",
      email: "Email",
      mobilephone: "Κινητό",
      bloodtype: "Ομάδα Αίματος",
      // supervisorDoctor: "Θεράπων Ιατρός",
      // legOperation: "Σκέλος Επέμβασης"
    };

    const missingFields = requiredFields.filter(
      (field) => !patientData[field as keyof PatientData]
    );

    if (missingFields.length > 0) {
      const missingFieldsNames = missingFields.map(
        (field) => fieldNames[field as keyof typeof fieldNames]
      );
      setAlertMessage(`Εκκρεμούν: ${missingFieldsNames.join(", ")}`);
      setShowAlert(true);
      return;
    }

    setShowConfirm(true);
  };

  const executeRegistration = async () => {
    const currDate = new Date();

    const newPatient = {
      ...patientData,
      age: calculatedAge,
      medicines: selectedMedications,
      entryDate: new Date(patientData.entryDate),
      operationDate: new Date(patientData.operationDate),
      exitDate: new Date(patientData.exitDate),
      preInstructions: selectedInstructions,
      preExcercises: selectedExercises,
      registrationDate: new Date(currDate),
      isPreoperation: true,
    };

    try {
      const response = await fetch("/api/patients/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatient),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Προέκυψε κάποιο σφάλμα κατά την εγγραφή. Προσπαθήστε ξανά σε λίγο."
        );
        return;
      }

      setAlertMessage(`Η εγγραφή του χρήστη πραγματοποιήθηκε με επιτυχία !`);
      setShowConfirm(false);
      handleClear();
      setShowAlertNew(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Προέκυψε κάποιο σφάλμα.");
      }
    }
  };

  const handleBackAction = () => {
    handleClear();
    router.push(`/digihip/homepage?doctor=${doctor_username}`);
  };

  useEffect(() => {
    setPatientData((prevData) => ({
      ...prevData,
      chronicDiseases: hasChronicDiseases ? prevData.chronicDiseases : "",
      chronicMedicines: hasChronicMedicines ? prevData.chronicMedicines : "",
      pastOperations: hasPreOperations ? prevData.pastOperations : "",
      allergies: hasAllergies ? prevData.allergies : "",
    }));
  }, [hasChronicDiseases, hasChronicMedicines, hasPreOperations, hasAllergies]);

  useEffect(() => {
    if (!currentDoctorData && !loading) router.push(`/`);
  }, [currentDoctorData, loading, router]);

  return (
    <>
      <main className={styles.main}>
        <div className={styles.registerpatientContent}>
          <div className={styles.bckBtn}>
            <div className={styles.bckbtnAction} onClick={handleBackAction}>
              <MdNavigateBefore size={19} /> Επιστροφή
            </div>
          </div>
          <div className={styles.Header}>Φόρμα Εγγραφής Ασθενή</div>
          <div className={styles.formSections}>
            {sections.map((section, index) => (
              <div
                key={section}
                className={styles.divSection}
                onClick={() => handleSectionClick(index)}
                style={{
                  fontWeight: currentPage === index ? "normal" : "normal",
                  border: currentPage === index ? "1px solid grey" : "",
                  backgroundColor: currentPage === index ? "cadetblue" : "",
                  color: currentPage === index ? "black" : "",
                }} // Highlight current section
              >
                {section === "demographics" && "Δημογραφικά Στοιχεία"}
                {section === "medicalHistory" && "Ιατρικό Αναμνηστικό"}
                {section === "operationDetails" && "Στοιχεία Επέμβασης"}
                {section === "instrAndExrs" && "Οδηγίες & Ασκήσεις"}
                {section === "submitPatient" && "Υποβολή Ασθενή"}
              </div>
            ))}
          </div>
          <div className={styles.formContent}>
            {renderFormContent()}{" "}
            {/* Render content based on selected section */}
          </div>
          <div className={styles.navgPanel}>
            {currentPage > 0 ? (
              <div className={styles.beforeAction} onClick={prevPage}>
                <MdNavigateBefore size={18} /> Προηγούμενη Σελίδα
              </div>
            ) : (
              <div className={styles.firstAction}>
                <MdNavigateBefore size={18} /> Προηγούμενη Σελίδα
              </div>
            )}

            {currentPage < sections.length - 1 ? (
              <div className={styles.nextAction} onClick={nextPage}>
                Επόμενη Σελίδα <MdNavigateNext size={18} />
              </div>
            ) : (
              <div className={styles.firstAction}>
                Επόμενη Σελίδα <MdNavigateNext size={18} />
              </div>
            )}
          </div>
          {medicinesModal && (
            <div className={styles.modalPopup}>
              <div className={styles.medicinespopupContent}>
                <div className={styles.modalPopupHeader}>
                  <h4>Φαρμακευτικές Αγωγές</h4>
                  <button onClick={handleMedicineModal}>
                    <IoClose size={24} />
                  </button>
                </div>
                <div className={styles.modalsPopupSearchSelectedAvailable}>
                  <div className={styles.modalsPopupSearch}>
                    <input
                      type="text"
                      placeholder="Αναζήτηση Φαρμακευτικής Αγωγής"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      className={styles.clrBttn}
                      onClick={() => handleClearAllModals("medications")}
                    >
                      Εκκαθάριση Όλων
                    </button>
                  </div>
                  <div className={styles.modalsPopupSelectedItems}>
                    <div className={styles.selectedText}>
                      <p>Επιλεγμένα Φάρμακα :</p>
                    </div>
                    <div className={styles.selectedItems}>
                      {selectedMedications.map((selectedValue) => {
                        const selectedMedication = medications.find(
                          (medication) => medication.value === selectedValue
                        );
                        return (
                          <li key={selectedValue}>
                            <div className={styles.itemItem}>
                              <div
                                onClick={() =>
                                  handleUnselectItem(
                                    selectedValue,
                                    "medications"
                                  )
                                }
                                className={styles.itemX}
                              >
                                <IoClose />
                              </div>
                              <div>{selectedMedication?.label}</div>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.modalPopupAvailableItems}>
                    {filteredMedications.map((medication) => (
                      <div
                        key={medication.value}
                        className={styles.itemCheckboxLabel}
                      >
                        <div className={styles.Checkbox}>
                          <input
                            type="checkbox"
                            value={medication.value}
                            checked={selectedMedications.includes(
                              medication.value
                            )}
                            onChange={(e) =>
                              handleSelectionChange(
                                e,
                                medication.value,
                                "medications"
                              )
                            }
                          />
                        </div>
                        <div>
                          {highlightMatch(medication.label, searchTerm)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {preInstructionsModal && (
            <div className={styles.modalPopup}>
              <div className={styles.instructionsPopupContent}>
                <div className={styles.modalPopupHeader}>
                  <h4>Προ-Εγχειρητικές Οδηγίες</h4>
                  <button onClick={handleInstructionsModal}>
                    <IoClose size={24} />
                  </button>
                </div>
                <div className={styles.modalsPopupSearchSelectedAvailable}>
                  <div className={styles.modalsPopupSelectedItems}>
                    <input
                      type="text"
                      placeholder="Αναζήτηση Προ-Εγχειρητικών Οδηγιών"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      className={styles.clrBttn}
                      onClick={() => handleClearAllModals("instructions")}
                    >
                      Εκκαθάριση Όλων
                    </button>
                  </div>
                  <div className={styles.modalsPopupSelectedItems}>
                    <div className={styles.selectedText}>
                      <p>Επιλεγμένες Οδηγίες :</p>
                    </div>
                    <div className={styles.selectedItems}>
                      {selectedInstructions.map((selectedValue) => {
                        const selectedInstruction = preInstructions.find(
                          (instruction) => instruction.value === selectedValue
                        );
                        return (
                          <li key={selectedValue}>
                            <div className={styles.itemItem}>
                              <div
                                onClick={() =>
                                  handleUnselectItem(
                                    selectedValue,
                                    "instructions"
                                  )
                                }
                                className={styles.itemX}
                              >
                                <IoClose />
                              </div>
                              <div>{selectedInstruction?.label}</div>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.modalPopupAvailableItems}>
                    {filteredInstructions.map((instruction) => (
                      <div
                        key={instruction.value}
                        className={styles.itemCheckboxLabel}
                      >
                        <div className={styles.Checkbox}>
                          <input
                            type="checkbox"
                            value={instruction.value}
                            checked={selectedInstructions.includes(
                              instruction.value
                            )}
                            onChange={(e) =>
                              handleSelectionChange(
                                e,
                                instruction.value,
                                "instructions"
                              )
                            }
                          />
                        </div>
                        <div>
                          {highlightMatch(instruction.label, searchTerm)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {preExercisesModal && (
            <div className={styles.modalPopup}>
              <div className={styles.exPopupContent}>
                <div className={styles.modalPopupHeader}>
                  <h4>Προ-Εγχειρητικές Ασκήσεις</h4>
                  <button onClick={handleExercisesModal}>
                    <IoClose size={24} />
                  </button>
                </div>
                <div className={styles.modalsPopupSearchSelectedAvailable}>
                  <div className={styles.modalsPopupSelectedItems}>
                    <input
                      type="text"
                      placeholder="Αναζήτηση Προ-Εγχειρητικών Ασκήσεων"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      className={styles.clrBttn}
                      onClick={() => handleClearAllModals("exercises")}
                    >
                      Εκκαθάριση Όλων
                    </button>
                  </div>
                  <div className={styles.modalsPopupSelectedItems}>
                    <div className={styles.selectedText}>
                      <p>Επιλεγμένες Ασκήσεις :</p>
                    </div>
                    <div className={styles.selectedItems}>
                      {selectedExercises.map((selectedValue) => {
                        const selectedExercise = preExcercises.find(
                          (exercise) => exercise.value === selectedValue
                        );
                        return (
                          <li key={selectedValue}>
                            <div className={styles.itemItem}>
                              <div
                                onClick={() =>
                                  handleUnselectItem(selectedValue, "exercises")
                                }
                                className={styles.itemX}
                              >
                                <IoClose />
                              </div>
                              <div>{selectedExercise?.label}</div>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.modalPopupAvailableItems}>
                    {filteredExercises.map((exercise) => (
                      <div
                        key={exercise.value}
                        className={styles.itemCheckboxLabel}
                      >
                        <div className={styles.Checkbox}>
                          <input
                            type="checkbox"
                            value={exercise.value}
                            checked={selectedExercises.includes(exercise.value)}
                            onChange={(e) =>
                              handleSelectionChange(
                                e,
                                exercise.value,
                                "exercises"
                              )
                            }
                          />
                        </div>
                        <div>{highlightMatch(exercise.label, searchTerm)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAlert && (
            <CustomAlert
              message="Παρακαλούμε Συμπληρώστε όλα τα υποχρεωτικά Πεδία !"
              messageNew={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          )}

          {showAlertNew && (
            <CustomAlert
              message={alertMessage}
              messageNew=""
              onClose={() => {
                window.location.reload();
                router.push(`/digihip/homepage?doctor=${doctor_username}`);
              }}
            />
          )}

          {showConfirm && (
            <div>
              <CustomConfirm
                message1="Επιθυμείτε να προσχωρήσετε σε οριστική Υποβολή των στοιχείων του χρήστη ;"
                message2=""
                name=""
                onConfirm={executeRegistration}
                onCancel={() => setShowConfirm(false)}
                category="proceedAction"
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function highlightMatch(text: string, searchTerm: string) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={index} style={{ backgroundColor: "lightblue" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}
