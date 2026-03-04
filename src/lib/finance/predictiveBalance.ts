/**
 * Calculates a predictive balance trajectory based on historical spend rate
 * and recurring items.
 */

export interface PredictionData {
  currentBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  knownUpcomingSubscriptions: number; // Total upcoming before month end
  daysLeftInMonth: number;
}

export function predictEndOfMonthBalance(data: PredictionData): number {
  const {
    currentBalance,
    averageMonthlyIncome,
    averageMonthlyExpense,
    knownUpcomingSubscriptions,
    daysLeftInMonth,
  } = data;

  // Assuming a linear daily spend rate based on historical average
  const dailySpendRate = averageMonthlyExpense / 30;

  // Forecasted discretionary spending for the rest of the month
  const forecastedDiscretionarySpend = dailySpendRate * daysLeftInMonth;

  // We assume income is already accounted for in the current balance or will be static
  const forecastedTotalSpend =
    forecastedDiscretionarySpend + knownUpcomingSubscriptions;

  return currentBalance - forecastedTotalSpend;
}

// Gives a nice string describing the prediction trend
export function getPredictionMessage(
  currentBalance: number,
  predictedBalance: number,
): string {
  const diff = predictedBalance - currentBalance;

  if (diff > 0) {
    return `Projected to grow by ${Math.abs(diff).toFixed(2)}`;
  } else if (diff < 0) {
    return `Projected to decrease by ${Math.abs(diff).toFixed(2)}`;
  } else {
    return "Projected to remain stable.";
  }
}
