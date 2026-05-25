/**
* ChatWidget.tsx
* @title Chat Widget UI Component
* @description Component for the chatbot UI, allowing users to interact with the chatbot and view responses
* @file src\app\chatbot\components\ChatWidget.tsx
*
* @version 1.15
* @date 21/05/2026
*
* @author Evangelia Andredaki [csd4588]
**/

"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatWidget.module.css";
import chatbotConfig from "@/chatbot/config";
import { FaRobot, FaUserInjured } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import DailyReportCard, { DailyReportEntry } from "./DailyReportCard";
import QuestionnaireCard, { QuestionnaireEntry } from "./QuestionnaireCard";
import AppointmentCard, { AppointmentEntry } from "./AppointmentCard";

interface Message {
    role: "bot" | "user";
    text: string;
    options?: string[];
    loading?: boolean;
    type?: "daily_reports" | "questionnaires" | "appointments";
    data?: DailyReportEntry[] | QuestionnaireEntry[] | AppointmentEntry[];
    patientName?: string;
    periodLabel?: string;
}

interface PatientOption {
    _id: string;
    firstname: string;
    lastname: string;
    amka: string;
}

// Shown as clickable buttons when the chat opens
const quickQuestions: string[] = [
    "Ποιοι ασθενείς έχουν επέμβαση σήμερα;",
    "Ποιοι ασθενείς είναι προεγχειρητικοί;",
    "Ποιοι ασθενείς είναι μετεγχειρητικοί;",
    "Πόσα ραντεβού έχω σήμερα;",
    "Τι είναι η αρθροπλαστική ισχίου;",
    "Πώς προσθέτω νέο ασθενή;",
];

export default function ChatWidget() {

    const [isOpen, setIsOpen]     = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", text: chatbotConfig.welcomeMessage }
    ]);
    const [input, setInput]           = useState("");
    const [isLoading, setIsLoading]   = useState(false);
    const [showFaq, setShowFaq]       = useState(false);
    const [appLoading, setAppLoading] = useState(false);
    const [showPatientPicker, setShowPatientPicker]   = useState(false);
    const [patients, setPatients]                     = useState<PatientOption[]>([]);
    const [patientSearch, setPatientSearch]           = useState("");
    const [patientsLoading, setPatientsLoading]       = useState(false);
    const [selectedPatient, setSelectedPatient]       = useState<PatientOption | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => {
            const found = document.querySelector("[data-app-loading]") !== null;
            setAppLoading((prev) => {
                if (found !== prev) {
                    if (found) setIsOpen(false);
                    return found;
                }
                return prev;
            });
        };

        const observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true, subtree: true });

        check();

        return () => observer.disconnect();
    }, []);

    // Auto-scroll every time a new message arrives or the chat opens
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Fetch patient list when the picker is opened for the first time
    const openPatientPicker = async () => {
        setShowFaq(false);
        setShowPatientPicker((prev) => {
            if (prev) return false;
            return true;
        });

        // Only fetch if we don't have the list yet
        if (patients.length === 0) {
            setPatientsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/patients/fetch", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setPatients(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.map((p: any) => ({
                        _id:       p._id,
                        firstname: p.firstname,
                        lastname:  p.lastname,
                        amka:      p.amka ?? "",
                    }))
                );
            } catch {

            } finally {
                setPatientsLoading(false);
            }
        }
    };

    const selectPatient = (patient: PatientOption) => {
        setSelectedPatient(patient);
        setShowPatientPicker(false);
        setPatientSearch("");
        setMessages((prev) => [
            ...prev,
            {
                role: "bot",
                text: `Επιλέξατε τον/την ασθενή ${patient.firstname} ${patient.lastname}. Τώρα μπορείτε να κάνετε ερωτήσεις σχετικά με αυτόν/αυτήν.`,
            },
        ]);
    };

    const clearSelectedPatient = () => {
        setSelectedPatient(null);
        setMessages((prev) => [
            ...prev,
            { role: "bot", text: "Η επιλογή ασθενή αποεπιλέχτηκε. Μπορείτε να κάνετε γενικές ερωτήσεις." },
        ]);
    };

    const sendMessage = async (question: string) => {
        if (!question.trim() || isLoading) return;

        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setInput("");
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: "bot", text: "", loading: true }]);

        try {
            const token = localStorage.getItem("token");

            const body: Record<string, unknown> = { question };
            if (selectedPatient) {
                body.selectedPatient = {
                    firstname: selectedPatient.firstname,
                    lastname:  selectedPatient.lastname,
                };
            }

            const res = await fetch("/api/chatbot/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev.slice(0, -1),
                {
                    role:        "bot",
                    text:        data.response ?? "",
                    options:     data.options,
                    type:        data.type,
                    data:        data.data,
                    patientName: data.patientName,
                    periodLabel: data.periodLabel,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "bot", text: "Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const filteredPatients = patients.filter((p) => {
        const term = patientSearch.toLowerCase();
        return (
            p.firstname.toLowerCase().includes(term) ||
            p.lastname.toLowerCase().includes(term)  ||
            p.amka.toLowerCase().includes(term)
        );
    });

    return (
        <div className={styles.wrapper}>

            {/* FLOATING BUTTON */}
            {!isOpen && (
                <button
                    className={`${styles.toggleButton} ${appLoading ? styles.toggleButtonDisabled : ""}`}
                    onClick={() => { if (!appLoading) setIsOpen(true); }}
                    title={appLoading ? "Αναμονή φόρτωσης..." : "Βοηθός"}
                    disabled={appLoading}
                >
                    <FaRobot size={24} />
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <FaRobot size={18} />
                        <span>Βοηθός DigiHip</span>
                        <button
                            type="button"
                            className={styles.headerFaqButton}
                            onClick={() => { setShowFaq((prev) => !prev); setShowPatientPicker(false); }}
                            title="Συχνές ερωτήσεις"
                        >
                            FAQ
                        </button>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            <IoClose size={18} />
                        </button>
                    </div>

                    {/* Message history */}
                    <div className={styles.messages}>

                        {/* All messages */}
                        {messages.map((msg, i) => (
                            <div key={i} className={styles.messageGroup}>

                                {/* Message bubble */}
                                <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : msg.type ? styles.botBubbleCard : styles.botBubble}`}>
                                    {/* Show animated dots while loading */}
                                    {msg.loading ? (
                                        <span className={styles.typingDots}>
                                            <span /><span /><span />
                                        </span>
                                    ) : msg.type === "daily_reports" && msg.data ? (
                                        <DailyReportCard
                                            patientName={msg.patientName ?? ""}
                                            periodLabel={msg.periodLabel ?? ""}
                                            data={msg.data as DailyReportEntry[]}
                                        />
                                    ) : msg.type === "questionnaires" && msg.data ? (
                                        <QuestionnaireCard
                                            patientName={msg.patientName ?? ""}
                                            periodLabel={msg.periodLabel ?? ""}
                                            data={msg.data as QuestionnaireEntry[]}
                                        />
                                    ) : msg.type === "appointments" && msg.data ? (
                                        <AppointmentCard
                                            patientName={msg.patientName ?? ""}
                                            data={msg.data as AppointmentEntry[]}
                                        />
                                    ) : (
                                        <>
                                            {msg.text}
                                            {/* Numbered inline options for ambiguity clarification */}
                                            {msg.options && msg.options.length > 0 && (
                                                <div className={styles.inlineOptions}>
                                                    {msg.options.map((opt, j) => (
                                                        <span
                                                            key={j}
                                                            className={styles.inlineOption}
                                                            onClick={() => sendMessage(opt)}
                                                        >
                                                            {j + 1}) {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Invisible element at the bottom, used for auto-scroll */}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input wrapper */}
                    <div className={styles.inputWrapper}>

                        {/* FAQ floating popup */}
                        {showFaq && (
                            <div className={styles.faqPopup}>
                                <div className={styles.popupHeader}>
                                    <p className={styles.quickLabel}>Συχνές ερωτήσεις:</p>
                                    <button
                                        className={styles.popupClose}
                                        onClick={() => setShowFaq(false)}
                                        title="Κλείσιμο"
                                    >
                                        <IoClose size={14} />
                                    </button>
                                </div>
                                {quickQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        className={styles.quickButton}
                                        onClick={() => { sendMessage(q); setShowFaq(false); }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Patient picker popup */}
                        {showPatientPicker && (
                            <div className={styles.patientPickerPopup}>
                                <div className={styles.popupHeader}>
                                    <p className={styles.quickLabel}>Επιλογή ασθενή:</p>
                                    <button
                                        className={styles.popupClose}
                                        onClick={() => setShowPatientPicker(false)}
                                        title="Κλείσιμο"
                                    >
                                        <IoClose size={14} />
                                    </button>
                                </div>
                                <input
                                    className={styles.patientSearch}
                                    type="text"
                                    placeholder="Αναζήτηση με όνομα ή ΑΜΚΑ..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    autoFocus
                                />
                                <div className={styles.patientList}>
                                    {patientsLoading && (
                                        <p className={styles.patientListHint}>Φόρτωση...</p>
                                    )}
                                    {!patientsLoading && filteredPatients.length === 0 && (
                                        <p className={styles.patientListHint}>Δεν βρέθηκαν ασθενείς.</p>
                                    )}
                                    {!patientsLoading && filteredPatients.map((p) => (
                                        <button
                                            key={p._id}
                                            className={styles.patientItem}
                                            onClick={() => selectPatient(p)}
                                        >
                                            {p.firstname} {p.lastname}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected patient chip */}
                        {selectedPatient && (
                            <div className={styles.selectedPatientChip}>
                                <FaUserInjured size={12} />
                                <span>{selectedPatient.firstname} {selectedPatient.lastname}</span>
                                <button
                                    className={styles.chipClear}
                                    onClick={clearSelectedPatient}
                                    title="Αποεπιλογή ασθενή"
                                >
                                    <IoClose size={12} />
                                </button>
                            </div>
                        )}

                        {/* Text input area */}
                        <form className={styles.inputArea} onSubmit={handleSubmit}>
                            {/* Patient picker toggle button */}
                            <button
                                type="button"
                                className={`${styles.patientButton} ${selectedPatient ? styles.patientButtonActive : ""}`}
                                onClick={openPatientPicker}
                                title="Επιλογή ασθενή"
                            >
                                <FaUserInjured size={15} />
                            </button>
                            <input
                                className={styles.input}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    selectedPatient
                                        ? `Ερώτηση για ${selectedPatient.firstname}...`
                                        : "Γράψτε την ερώτησή σας..."
                                }
                                disabled={isLoading}
                                maxLength={chatbotConfig.maxQuestionLength}
                            />
                            <button
                                className={styles.sendButton}
                                type="submit"
                                disabled={isLoading || !input.trim()}
                            >
                                <IoSend size={18} />
                            </button>
                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}
