/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description : Custom hook for fetching patient questionnaires based on AMKA
 */

import { useState, useEffect } from 'react';

export interface Questionnaire {
    _id: string;
    amka: string;
    mobility: number;
    selfCare: number;
    usualActivities: number;
    pain: number;
    anxiety: number;
    submittedAt: string;
}

const useQuestionnairesHook = (amka: string | null | undefined) => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!amka) {
            setQuestionnaires([]);
            return;
        }

        const fetchQuestionnaires = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/patients/questionnaires?amka=${amka}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch questionnaires');
                }
                const data = await response.json();
                
                if (data.success && data.questionnaires) {
                    setQuestionnaires(data.questionnaires);
                } else {
                    setQuestionnaires([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setQuestionnaires([]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionnaires();
    }, [amka]);

    return {
        questionnaires,
        loading,
        error,
    };
};

export default useQuestionnairesHook;
