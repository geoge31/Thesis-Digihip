export const fieldDisplayNames: Record<string, string> = {
    firstname: 'Όνομα',
    lastname: 'Επίθετο',
    birthdate: 'Ημερομηνία Γέννησης',
    amka: 'ΑΜΚΑ',
    amedcode: 'Κωδικός αμεδ',
    height: 'Ύψος',
    weight: 'Βάρος',
    mobilephone: 'Τηλέφωνο Επικοινωνίας',
    email: 'Email',
    address: 'Διεύθυνση Κατοικίας',
    currentStage: 'Στάδιο',
    bloodtype: 'Ομάδα Αίματος',
    chronicDiseases: 'Χρόνιες Παθήσεις',
    allergies: 'Αλλεργίες',
    smoking: 'Κάπνισμα',
    alcohol: 'Αλκοόλ',
    legOperation: 'Σκέλος Επέμβασης',
    primary: 'Κατάσταση Επέμβασης',
    supervisorDoctor: 'Επιβλέπων Ιατρός',
    entryDate: 'Ημερομηνία Εισαγωγής',
    operationDate: 'Ημερομηνία Επέμβασης',
    exitDate: 'Ημερομηνία Εξόδου',
    medicalFiles: 'Ιατρικά Αρχεία',
    medicines: 'Φάρμακα',
    surgeries: 'Χειρουργεία',
};

/**
 * Returns the Greek display name for a given field key.
 * Falls back to the key itself if no translation is found.
 */
export const getFieldDisplayName = (key: string): string => {
    return fieldDisplayNames[key] || key;
};
