/**
 * @author : csd4740 - Efstathia Sekadaki
 * @description Component for displaying daily charts 
 */

import React, { useMemo } from 'react';
import { DailyReport } from '@/hooks/useDailyReportsHook';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './css/DailyChart.module.css';

type FilterPeriod = 'day' | 'week' | 'month';

interface DailyChartProps {
  reports: DailyReport[];
  filterPeriod: FilterPeriod;
  selectedDay: string;
  selectedWeekStart: string;
  selectedMonth: string;
}

interface PeriodAnalytics {
  completionRate: number;
  injectionRate: number;
  exerciseRate: number;
  avgPain: number;
  painCategory: string;
  painTrend: Array<{ date: string; pain: number | null }>;
  injectionDays: number;
  exerciseDays: number;
  daysWithPain: number;
}

const parseDateString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const normalizeDate = (dateValue: string | Date) => {
  const d = new Date(dateValue);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getDaysBetweenInclusive = (start: Date, end: Date) => {
  if (end.getTime() < start.getTime()) return 0;
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const buildDateRange = (start: Date, end: Date) => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current.getTime() <= end.getTime()) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const getPainCategory = (avgPain: number): string => {
  if (avgPain <= 2) return 'Ήπιος πόνος';
  if (avgPain <= 5) return 'Μέτριος πόνος';
  if (avgPain <= 7) return 'Σημαντικός πόνος';
  return 'Σοβαρός πόνος';
};

const getCompletionStatus = (report: DailyReport) => {
  const hasInjectionAnswer = typeof report.injectionDone === 'boolean';
  const hasExercisesAnswer = typeof report.exercisesDone === 'boolean';
  const hasPainAnswer = typeof report.painLevel === 'number';

  return hasInjectionAnswer && hasExercisesAnswer && hasPainAnswer;
};

const calculateAnalyticsForRange = (
  reports: DailyReport[],
  start: Date,
  end: Date
): PeriodAnalytics => {
  const filtered = reports
    .filter((report) => {
      const d = normalizeDate(report.date);
      return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const expectedDays = getDaysBetweenInclusive(start, end);

  const completedReports = filtered.filter(getCompletionStatus).length;
  const yesInjectionDays = filtered.filter((r) => r.injectionDone === true).length;
  const yesExerciseDays = filtered.filter((r) => r.exercisesDone === true).length;
  
  // Count days where answer was provided (true or false)
  const daysWithInjectionAnswer = filtered.filter((r) => typeof r.injectionDone === 'boolean').length;
  const daysWithExerciseAnswer = filtered.filter((r) => typeof r.exercisesDone === 'boolean').length;

  const reportsWithPain = filtered.filter((r) => typeof r.painLevel === 'number');
  const avgPain =
    reportsWithPain.length > 0
      ? reportsWithPain.reduce((sum, r) => sum + (r.painLevel ?? 0), 0) / reportsWithPain.length
      : 0;

  const datesInRange = buildDateRange(start, end);

  const painTrend = datesInRange.map((date) => {
    const match = filtered.find(
      (report) => normalizeDate(report.date).getTime() === date.getTime()
    );

    return {
      date: date.toLocaleDateString('el-GR', {
        weekday: 'short',
        day: 'numeric',
      }),
      pain: typeof match?.painLevel === 'number' ? match.painLevel : null,
    };
  });

  return {
    completionRate: expectedDays > 0 ? Math.round((completedReports / expectedDays) * 100) : 0,
    injectionRate: daysWithInjectionAnswer > 0 ? Math.round((yesInjectionDays / daysWithInjectionAnswer) * 100) : 0,
    exerciseRate: daysWithExerciseAnswer > 0 ? Math.round((yesExerciseDays / daysWithExerciseAnswer) * 100) : 0,
    avgPain: Math.round(avgPain * 10) / 10,
    painCategory: getPainCategory(avgPain),
    painTrend,
    injectionDays: yesInjectionDays,
    exerciseDays: yesExerciseDays,
    daysWithPain: reportsWithPain.length,
  };
};

const AnalyticsCard: React.FC<{ label: string; percentage: number; color: string }> = ({
  label,
  percentage,
  color,
}) => (
  <div className={styles.analyticsCard}>
    <div className={styles.circularProgress}>
      <svg viewBox="0 0 100 100" className={styles.progressSvg}>
        <circle cx="50" cy="50" r="45" className={styles.progressBg} />
        <circle
          cx="50"
          cy="50"
          r="45"
          className={styles.progressCircle}
          style={{
            strokeDasharray: `${(percentage / 100) * 283} 283`,
            stroke: color,
          }}
        />
        <g transform="rotate(90 50 50)">
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.analyticsProgressText}
          >
            {percentage}%
          </text>
        </g>
      </svg>
    </div>
    <div className={styles.cardLabel}>{label}</div>
  </div>
);

interface PainTrendChartProps {
  data: Array<{ date: string; pain: number | null }>;
  avgPain: number;
  painCategory: string;
  daysWithPain: number;
  totalDays: number;
}

const PainTrendChart: React.FC<PainTrendChartProps> = ({
  data,
  avgPain,
  painCategory,
  daysWithPain,
  totalDays,
}) => (
  <div className={styles.trendChartContainer}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h3 className={styles.trendTitle}>Τάση Πόνου</h3>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#1976d2' }}>Μ.Ο: {avgPain}/10</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{painCategory}</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{daysWithPain}/{totalDays} ημέρες</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="pain"
          stroke="#1976d2"
          strokeWidth={2}
          dot={{ fill: '#1976d2', r: 4 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const DailyChart: React.FC<DailyChartProps> = ({
  reports,
  filterPeriod,
  selectedDay,
  selectedWeekStart,
  selectedMonth,
}) => {
  const today = useMemo(() => getTodayDate(), []);

  const selectedRange = useMemo(() => {
    if (filterPeriod === 'day') {
      const day = parseDateString(selectedDay);
      return { start: day, end: day };
    }

    if (filterPeriod === 'week') {
      const start = parseDateString(selectedWeekStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
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

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        const reportDateOnly = normalizeDate(report.date);
        return (
          reportDateOnly.getTime() >= selectedRange.start.getTime() &&
          reportDateOnly.getTime() <= selectedRange.end.getTime()
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, selectedRange]);

  const periodAnalytics = useMemo<PeriodAnalytics | null>(() => {
    if (filterPeriod === 'day') return null;
    return calculateAnalyticsForRange(reports, selectedRange.start, selectedRange.end);
  }, [filterPeriod, reports, selectedRange]);

  return (
    <div className={styles.container}>
      {filterPeriod !== 'day' && periodAnalytics ? (
        filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            Δεν υπάρχουν δεδομένα για την επιλεγμένη περίοδο.
          </div>
        ) : (
          <div className={styles.analyticsContainer}>
            <div className={styles.analyticsGrid}>
              <AnalyticsCard
                label="Ποσοστό Ολοκλήρωσης"
                percentage={periodAnalytics.completionRate}
                color="#1976d2"
              />
              <AnalyticsCard
                label={`Ένεση (${periodAnalytics.injectionDays} ημέρες)`}
                percentage={periodAnalytics.injectionRate}
                color="#1976d2"
              />
              <AnalyticsCard
                label={`Ασκήσεις (${periodAnalytics.exerciseDays} ημέρες)`}
                percentage={periodAnalytics.exerciseRate}
                color="#1976d2"
              />
            </div>

            <PainTrendChart 
              data={periodAnalytics.painTrend}
              avgPain={periodAnalytics.avgPain}
              painCategory={periodAnalytics.painCategory}
              daysWithPain={periodAnalytics.daysWithPain}
              totalDays={Math.floor((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}
            />
          </div>
        )
      ) : filteredReports.length === 0 ? (
        <div className={styles.emptyState}>
          Δεν υπάρχουν δεδομένα για την επιλεγμένη ημέρα.
        </div>
      ) : (
        <div className={styles.reportsTabs}>
          {filteredReports.map((report, index) => {
            const reportDate = new Date(report.date);
            const dateString = reportDate.toLocaleDateString('el-GR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const isCompleted = getCompletionStatus(report);

            return (
              <div key={index} className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <div className={styles.dateSection}>
                    <div className={styles.date}>{dateString}</div>
                    <div
                      className={`${styles.status} ${
                        isCompleted ? styles.completed : styles.pending
                      }`}
                    >
                      {isCompleted ? 'Ολοκληρώθηκε' : 'Δεν ολοκληρώθηκε'}
                    </div>
                  </div>
                </div>

                <div className={styles.reportContent}>
                  <div className={styles.reportItem}>
                    <div className={styles.itemLabel}>Πόνος</div>
                    <div className={styles.itemValue}>
                      <div className={styles.reportProgressContainer}>
                        <div className={styles.reportProgressBar}>
                          <div
                            className={styles.reportProgressFill}
                            style={{
                              width: `${((report.painLevel ?? 0) / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <span className={styles.progressText}>{report.painLevel ?? 0}/10</span>
                      </div>
                      <span className={styles.painCategory} style={{ color: '#1976d2' }}>
                        ({report.painCategory})
                      </span>
                    </div>
                  </div>

                  <div className={styles.reportItem}>
                    <div className={styles.itemLabel}>Ασκήσεις</div>
                    <div className={styles.itemValue}>
                      <span
                        className={`${styles.yesNoIndicator} ${
                          report.exercisesDone ? styles.yes : styles.no
                        }`}
                      >
                        {report.exercisesDone ? 'Ναι' : 'Όχι'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reportItem}>
                    <div className={styles.itemLabel}>Ένεση</div>
                    <div className={styles.itemValue}>
                      <span
                        className={`${styles.yesNoIndicator} ${
                          report.injectionDone ? styles.yes : styles.no
                        }`}
                      >
                        {report.injectionDone ? 'Ναι' : 'Όχι'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyChart;