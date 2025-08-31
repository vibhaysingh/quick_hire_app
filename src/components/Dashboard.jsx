import { memo, useMemo } from "react";
import { DiversityAnalytics } from "./DiversityAnalytics";

const DashboardComponent = ({
  candidates,
  navigate,
  shortlistCount,
  selectionCount,
  rejectedCount,
  finalSelection,
}) => {
  const stats = useMemo(() => {
    return {
      total: candidates.length,
    };
  }, [candidates]);

  return (
    <div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card__value">{stats.total}</div>
          <div className="stat-card__title">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{shortlistCount}</div>
          <div className="stat-card__title">Shortlisted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{selectionCount}</div>
          <div className="stat-card__title">Final Selection</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{rejectedCount}</div>
          <div className="stat-card__title">Rejected</div>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <h2>Quick Actions</h2>
          <p>
            Welcome to your hiring dashboard! You have {stats.total} candidates
            to review.
          </p>
          <div className="flex gap-16" style={{ marginTop: "var(--space-16)" }}>
            <button
              className="btn btn--primary"
              onClick={() => navigate("browse")}
            >
              Start Browsing Candidates
            </button>
            {shortlistCount > 0 && (
              <button
                className="btn btn--secondary"
                onClick={() => navigate("shortlist")}
              >
                Review Shortlist ({shortlistCount})
              </button>
            )}
            {selectionCount > 0 && (
              <button
                className="btn btn--outline"
                onClick={() => navigate("selection")}
              >
                Manage Final Selection ({selectionCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {finalSelection.length > 0 ? (
        <div style={{ marginTop: "var(--space-24)" }}>
          <DiversityAnalytics finalSelection={finalSelection} />
        </div>
      ) : (
        <div className="card mt-24">
          <div className="card__body analytics-placeholder">
            <h2>Team Diversity Analytics</h2>
            <div className="analytics-placeholder__content">
              <p className="analytics-placeholder__message">
                Select candidates to see team diversity insights and analytics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard = memo(DashboardComponent);
