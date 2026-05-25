/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description : Component for displaying  questionnaire results 
**/

import React, { useState, useMemo } from 'react';
import { Questionnaire } from '@/hooks/useQuestionnairesHook';
import styles from './css/QuestionnaireDisplay.module.css';

type FilterPeriod = 'day' | 'week' | 'month';

interface QuestionnaireDisplayProps {
  questionnaires: Questionnaire[];
  filterPeriod: FilterPeriod;
  selectedDay: string;
  selectedWeekStart: string;
  selectedMonth: string;
}

const dimensions = [
  { key: 'mobility', label: 'Κινητικότητα' },
  { key: 'selfCare', label: 'Αυτοεξυπηρέτηση' },
  { key: 'usualActivities', label: 'Συνήθεις Δραστηριότητες' },
  { key: 'pain', label: 'Πόνος / Δυσφορία' },
  { key: 'anxiety', label: 'Άγχος / Θλίψη' },
] as const;

type DimensionKey = (typeof dimensions)[number]['key'];

const normalizeDate = (dateValue: string | Date) => {
  const d = new Date(dateValue);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Κυριακή, 1=Δευτέρα
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const parseDateString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getDaysBetweenInclusive = (start: Date, end: Date) => {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};


const getDisplayScore = (score: number) => Math.max(0, score - 1);

const getPercentageForBar = (score: number) => {
  const displayScore = Math.max(0, score - 1);
  const percentage = (displayScore / 4) * 100;
  return Math.max(12, percentage);
};

const getScoreColor = (score: number) => {
  if (score <= 0.5) return '#4caf50';
  if (score <= 1.5) return '#8bc34a';
  if (score <= 2.5) return '#ffc107';
  if (score <= 3.5) return '#ff9800';
  return '#f44336';
};

const QuestionnaireDisplay: React.FC<QuestionnaireDisplayProps> = ({
  questionnaires,
  filterPeriod,
  selectedDay,
  selectedWeekStart,
  selectedMonth,
}) => {

  const today = useMemo(() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}, []);

const selectedRange = useMemo(() => {
  if (filterPeriod === 'day') {
    const day = parseDateString(selectedDay);
    return { start: day, end: day };
  }

  if (filterPeriod === 'week') {
    const start = parseDateString(selectedWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Δευτέρα -> Κυριακή
    return { start, end };
  }

  const monthStart = parseDateString(selectedMonth);
  const monthEnd = getEndOfMonth(monthStart);
  const isCurrentMonth =
    monthStart.getFullYear() === today.getFullYear() &&
    monthStart.getMonth() === today.getMonth();

  return {
    start: monthStart,
    end: isCurrentMonth ? today : monthEnd,
  };
}, [filterPeriod, selectedDay, selectedWeekStart, selectedMonth, today]);

  const filteredQuestionnaires = useMemo(() => {
    return questionnaires
      .filter((q) => {
        const qDateOnly = normalizeDate(q.submittedAt);
        return (
          qDateOnly.getTime() >= selectedRange.start.getTime() &&
          qDateOnly.getTime() <= selectedRange.end.getTime()
        );
      })
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [questionnaires, selectedRange]);

  const scaleLabels = [
    { score: 0, label: 'Καλή', color: '#4caf50' },
    { score: 1, label: 'Ελαφριά', color: '#8bc34a' },
    { score: 2, label: 'Μέτρια', color: '#ffc107' },
    { score: 3, label: 'Σοβαρή', color: '#ff9800' },
    { score: 4, label: 'Ακραία', color: '#f44336' },
  ];

  const periodSummary = useMemo(() => {
    if (filterPeriod === 'day') return null;

    const expectedDays = getDaysBetweenInclusive(selectedRange.start, selectedRange.end);

    const uniqueSubmittedDays = new Set(
      filteredQuestionnaires.map((q) => normalizeDate(q.submittedAt).getTime())
    ).size;

    const completionRate =
      expectedDays > 0 ? Math.round((uniqueSubmittedDays / expectedDays) * 100) : 0;

    const averages = dimensions.map((dim) => {
      const scores = filteredQuestionnaires
        .map((q) => q[dim.key as keyof Questionnaire])
        .filter((value): value is number => typeof value === 'number');

      const rawAverage =
        scores.length > 0
          ? scores.reduce((sum, value) => sum + value, 0) / scores.length
          : 0;

      const displayAverage = rawAverage > 0 ? rawAverage - 1 : 0;
      const percentage = getPercentageForBar(rawAverage);

      return {
        key: dim.key,
        label: dim.label,
        rawAverage: Number(rawAverage.toFixed(1)),     // 1-5
        displayAverage: Number(displayAverage.toFixed(1)), // 0-4
        percentage,
        color: getScoreColor(displayAverage),
      };
    });

    return {
      expectedDays,
      uniqueSubmittedDays,
      completionRate,
      averages,
    };
  }, [filteredQuestionnaires, filterPeriod, selectedRange]);

  const periodTitle =
    filterPeriod === 'week'
      ? 'Σύνοψη Τρέχουσας Εβδομάδας'
      : filterPeriod === 'month'
      ? 'Σύνοψη Τρέχοντος Μήνα'
      : 'Ημερήσια Προβολή';

  const rangeLabel =
  filterPeriod === 'day'
    ? selectedRange.start.toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : `${selectedRange.start.toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
      })} - ${selectedRange.end.toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
      })}`;

  return (
    <div className={styles.container}>
      {filteredQuestionnaires.length === 0 ? (
        <div className={styles.emptyState}>
          Δεν υπάρχουν ερωτηματολόγια για την επιλεγμένη περίοδο.
        </div>
      ) : (
        <>
          {periodSummary && (
            <div
              style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#333' }}>{periodTitle}</h3>
                <div style={{ color: '#666', marginTop: '6px' }}>{rangeLabel}</div>
              </div>

              <div className={styles.scaleLegend} style={{ marginBottom: '20px' }}>
                <span className={styles.scaleLabel}>Κλίμακα:</span>
                <div className={styles.scaleItems}>
                  {scaleLabels.map((item) => (
                    <div key={item.score} className={styles.scaleItem}>
                      <div
                        className={styles.scaleColor}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className={styles.scaleText}>
                        {item.score} - {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    minWidth: '220px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                    Ποσοστό Συμπλήρωσης
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#1976d2' }}>
                    {periodSummary.completionRate}%
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {periodSummary.uniqueSubmittedDays}/{periodSummary.expectedDays} ημέρες
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {periodSummary.averages.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      background: '#fafafa',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid #eee',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#333' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color }}>
                        {item.rawAverage}/5
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '12px',
                        background: '#e5e7eb',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: '999px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filterPeriod === 'day' && (
            <>
              <div className={styles.scaleLegend}>
                <span className={styles.scaleLabel}>Κλίμακα:</span>
                <div className={styles.scaleItems}>
                  {scaleLabels.map((item) => (
                    <div key={item.score} className={styles.scaleItem}>
                      <div
                        className={styles.scaleColor}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className={styles.scaleText}>
                        {item.score} - {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.dimensionHeader}>Διάσταση</th>
                      {filteredQuestionnaires.map((q, index) => {
                        const submitDate = new Date(q.submittedAt).toLocaleDateString('el-GR', {
                          weekday: filterPeriod === 'day' ? undefined : 'short',
                          day: 'numeric',
                          month: 'short',
                        });

                        return (
                          <th key={index} className={styles.dateHeader}>
                            {submitDate}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.map((dim, dimIndex) => (
                      <tr
                        key={dim.key}
                        className={dimIndex % 2 === 0 ? styles.rowEven : styles.rowOdd}
                      >
                        <td className={styles.dimensionCell}>{dim.label}</td>

                        {filteredQuestionnaires.map((q, qIndex) => {
                          const score = q[dim.key as keyof Questionnaire] as number;
                          const displayScore = getDisplayScore(score);
                          const percentage = getPercentageForBar(score);
                          const barColor = getScoreColor(displayScore);

                          return (
                            <td key={qIndex} className={styles.scoreCell}>
                              <div className={styles.cellBarContainer}>
                                <div className={styles.cellBarBackground}>
                                  <div
                                    className={styles.cellBar}
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: barColor,
                                    }}
                                  >
                                    <span className={styles.cellBarValue}>
                                      {displayScore.toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionnaireDisplay;