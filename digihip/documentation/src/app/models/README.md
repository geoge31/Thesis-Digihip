### Μοντέλα Εφαρμογής

- src/app/models/
    - <b>Patient.tsx (Μοντέλο Ασθενή) </b>
        - Το μοντέλο Patient είναι μια κλάση που υλοποιεί τη δομή ενός ασθενή με τη χρήση του mongoose για την MongoDB. Το Schema καθορίζει τις απαιτούμενες και προαιρετικές ιδιότητες για κάθε καταχώρηση του ασθενή στην βάση δεδομένων

                const PatientSchema = new mongoose.Schema({
                    firstname: { type: String, required: true },
                    lastname: { type: String, required: true },
                    birthdate: {type: Date, required: true},
                    age: {type: String, required: true},
                    amka: {type: String, required: true, unique: true},
                    amedcode: { type:String, required: true, unique: true},
                    email: { type: String, required: true, unique: true },
                    mobilephone: { type: String, required: true, unique: true },
                    address: { type: String, required: false },
                    height : { type: String, required: true },
                    weight : { type: String, required: true },
                    bloodtype : { type: String, required: true },
                    medicines : { type: Array, required: false },
                    chronicDiseases : { type: String, required: true },
                    chronicMedicines : { type: String, required: true },
                    pastOperations: { type: String, required: true },
                    allergies: { type: String, required: true },
                    isSmoker : { type: Boolean, required: false },
                    isAlcoholuser : { type: Boolean, required: false },
                    supervisordoctor : { type: String, required: true },
                    isPreoperation : { type: Boolean, required: true },
                    currentStage : { type: String, required:  false},
                    legOperation : { type: String, required: true },
                    entryDate : { type: Date, required: true },
                    operationDate : { type: Date, required: true },
                    exitDate : { type: Date, required: true },
                    preInstructions: {type: Array, required: false},
                    preExercises: {type: Array, required: false},
                    registrationDate : { type: Date, required: true },
                    itsAdmin : { type: String, required: false }, 
                });
        - Πεδία__
            - <em>Δημογραφικά Στοιχεία</em> 
                - <b>firstname</b> - Όνομα Ασθενούς
                    - required
                - <b>lastname</b> - Επίθετο Ασθενούς
                    - required
                - <b>birthdate</b> - Ημερομηνία Γέννησης
                    - required
                - <b>age</b> - Ηλικία 
                    - required
                - <b>amka</b> - ΑΜΚΑ
                    - unique, required
                - <b>amedcode</b> - Ειδικός Κωδικός Ασθενή amed
                    - unique, required
                - <b>email</b> - Email
                    - unique, required 
                - <b>mobilephone</b> - Τηλέφωνο 
                    - unique, required
                - <b>address</b> - Διεύθυνση Κατοικίας
                    - required
                - <b>height</b> - Ύψος
                    - required
                - <b>weight</b> - Βάρος
                    - required
            - <em>Ατομικό Αναμνηστικό</em>
                - <b>bloodtype</b> - Ομάδα Αίματος
                    - required
                - <b>medicines</b> - Φαρμακευτικές Αγωγές
                - <b>chronicDiseases</b> - Χρόνιες Παθήσεις
                    - required
                - <b>chronicMedicines</b> - Χρόνιες Φαρμακευτικές Αγωγές
                    - required
                - <b>pastOperations</b> - Προηγούμενες Χειρουργικές επεμμβάσεις
                    - required
                - <b>allergies</b> - Αλλεργίες
                    - required
                - <b>isSmoking</b> - Καπνιστής
                    - required
                - <b>isDrinking</b> - Κατανάλωση Αλκοόλ
                    - required
            - <em>Στοιχεία Επέμβασης</em>
                - <b>supervisorDoctor</b> - Επιβλέπων Ιατρός
                    - required
                - <b>isPreoperation</b> - Βρίσκεται σε Προεγχειρητικό Στάδιο  
                    - required
                - <b>currentStage</b> - Τρέχον Στάδιο
                - <b>legOperation</b> - Σκέλος Επέμβασης
                    - required
                - <b>entryDate</b> - Ημερομηνία Εισαγωγή στο Νοσοκομείο
                    - required
                - <b>operationDate</b> - Ημερομηνία Επέμβασης
                    - required
                - <b>exitDate</b> - Ημερομηνία Εξόδου από το Νοσοκομείο
                    - required
                - <b>preInstructions</b> - Προεχγειρητικές Οδηγίες
                - <b>preExercises</b> - Προεγχειρητικές Ασκήσεις
            - <em>Ειπλέον Στοιχεία</em>
                - <b>registrationDate</b> - Ημερομηνία Εγγραφής στο Σύστημα
                    - required
                - <b>itsAdmin</b> - Διαχειριστής που ενέγραψε τον Ασθενή
                    - required