import { TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, trend, trendDirection }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__label">
        {Icon && (
          <div className="kpi-card__label-icon">
            <Icon size={20} />
          </div>
        )}
        <span>{label}</span>
      </div>
      <div className="kpi-card__value">{value}</div>
      {trend !== undefined && (
        <div className={`kpi-card__trend kpi-card__trend--${trendDirection === "up" ? "up" : "down"}`}>
          {trendDirection === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
