/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description Component for displaying statistics charts based on daily reports and questionnaires data
 */

import React, { useMemo, useState } from 'react';
import useDailyReportsHook from '@/hooks/useDailyReportsHook';
import useQuestionnairesHook from '@/hooks/useQuestionnairesHook';
import DailyChart from './DailyChart';
import QuestionnaireDisplay from './QuestionnaireDisplay';
import styles from './css/Statistics.module.css';

type FilterPeriod = 'day' | 'week' | 'month';

interface StatisticsProps {
  patientAmka: string;
}

const getDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const Statistics: React.FC<StatisticsProps> = ({ patientAmka }) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('day');

  const today = useMemo(() => getTodayDate(), []);
  const todayString = useMemo(() => getDateString(today), [today]);

  const [selectedDay, setSelectedDay] = useState<string>(todayString);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(
    getDateString(getStartOfWeek(today))
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getDateString(getStartOfMonth(today))
  );

  const { reports, loading: reportsLoading, error: reportsError } =
    useDailyReportsHook(patientAmka);

  const { questionnaires, loading: questionnairesLoading, error: questionnairesError } =
    useQuestionnairesHook(patientAmka);

  const handleWeekChange = (value: string) => {
    const pickedDate = parseDateString(value);
    const monday = getStartOfWeek(pickedDate);
    setSelectedWeekStart(getDateString(monday));
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    setSelectedMonth(getDateString(firstDay));
  };

  if (reportsLoading || questionnairesLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Φόρτωση δεδομένων...</div>;
  }

  if (reportsError || questionnairesError) {
    return (
      <div style={{ padding: '20px', color: '#c62828' }}>
        Σφάλμα: {reportsError || questionnairesError}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Period Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterLeft}>
          <label className={styles.filterLabel}>Περίοδος:</label>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
            className={styles.filterSelect}
          >
            <option value="day">Ημέρα</option>
            <option value="week">Εβδομάδα</option>
            <option value="month">Μήνας</option>
          </select>
        </div>

        {filterPeriod === 'day' && (
          <div className={styles.filterRight}>
            <label className={styles.filterLabel}>Ημερομηνία:</label>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        )}

        {filterPeriod === 'week' && (
          <div className={styles.filterRight}>
            <label className={styles.filterLabel}>Εβδομάδα:</label>
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => handleWeekChange(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        )}

        {filterPeriod === 'month' && (
          <div className={styles.filterRight}>
            <label className={styles.filterLabel}>Μήνας:</label>
            <input
              type="month"
              value={selectedMonth.slice(0, 7)}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        )}
      </div>

      {/* Daily Reports Section */}
      <div>
        <h3
          style={{
            marginBottom: '15px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
          }}
        >
          Ημερήσιες Αναφορές
        </h3>

        <DailyChart
          reports={reports}
          filterPeriod={filterPeriod}
          selectedDay={selectedDay}
          selectedWeekStart={selectedWeekStart}
          selectedMonth={selectedMonth}
        />
      </div>

      {/* Questionnaires Section */}
      <div>
        <h3
          style={{
            marginBottom: '15px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
          }}
        >
          Ερωτηματολόγια EQ-5D
        </h3>

        <QuestionnaireDisplay
          questionnaires={questionnaires}
          filterPeriod={filterPeriod}
          selectedDay={selectedDay}
          selectedWeekStart={selectedWeekStart}
          selectedMonth={selectedMonth}
        />
      </div>
    </div>
  );
};

export default Statistics;