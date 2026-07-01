import { useFantasyStore } from '../../store/fantasyStore';
import { ProgressBar } from '../ui/ProgressBar';

export function BudgetBar() {
  const { budget, maxBudget } = useFantasyStore();
  const spent = maxBudget - budget;
  const pct = (spent / maxBudget) * 100;
  const color = pct > 90 ? '#FF0038' : pct > 75 ? '#FFD23F' : '#00E5B4';

  return (
    <div className="card p-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-text-2 font-medium">Budget remaining</span>
        <span className="font-mono font-bold" style={{ color }}>£{budget.toFixed(1)}M / £{maxBudget}M</span>
      </div>
      <ProgressBar value={100 - pct} color={color} />
    </div>
  );
}
