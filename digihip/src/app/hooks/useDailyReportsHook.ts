/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description Hook for fetching statistics for daily reports 
 */

import { useState, useEffect } from 'react';

export interface DailyReport {
    _id: string;
    amka: string;
    injectionDone: boolean;
    exercisesDone: boolean;
    painLevel: number;
    painCategory: string;
    date: string;
}

export interface StatisticsData {
    injectionRate: number;
    exerciseRate: number;
    averagePainLevel: number;
    painDistribution: {
        mild: number;
        moderate: number;
        severe: number;
    };
    totalReports: number;
    lastUpdated: string | null;
}

const useDailyReportsHook = (amka: string | null | undefined) => {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!amka) {
            setReports([]);
            setStatistics(null);
            return;
        }

        const fetchDailyReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/patients/daily-reports?amka=${amka}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch daily reports');
                }
                const data = await response.json();
                
                if (data.success && data.reports) {
                    setReports(data.reports);
                    calculateStatistics(data.reports);
                } else {
                    setReports([]);
                    setStatistics(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setReports([]);
                setStatistics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyReports();
    }, [amka]);

    const calculateStatistics = (reports: DailyReport[]) => {
        if (reports.length === 0) {
            setStatistics(null);
            return;
        }

        const injectionCount = reports.filter(r => r.injectionDone).length;
        const exerciseCount = reports.filter(r => r.exercisesDone).length;
        
        const injectionRate = Math.round((injectionCount / reports.length) * 100);
        const exerciseRate = Math.round((exerciseCount / reports.length) * 100);
        
        const totalPainLevel = reports.reduce((sum, r) => sum + (r.painLevel || 0), 0);
        const averagePainLevel = Math.round(totalPainLevel / reports.length);

        const mildCount = reports.filter(r => r.painCategory === 'Ήπιος').length;
        const moderateCount = reports.filter(r => r.painCategory === 'Μέτριος').length;
        const severeCount = reports.filter(r => r.painCategory === 'Σοβαρός').length;

        const stats: StatisticsData = {
            injectionRate,
            exerciseRate,
            averagePainLevel,
            painDistribution: {
                mild: Math.round((mildCount / reports.length) * 100),
                moderate: Math.round((moderateCount / reports.length) * 100),
                severe: Math.round((severeCount / reports.length) * 100),
            },
            totalReports: reports.length,
            lastUpdated: reports[0]?.date || null,
        };

        setStatistics(stats);
    };

    return {
        reports,
        statistics,
        loading,
        error,
    };
};

export default useDailyReportsHook;
