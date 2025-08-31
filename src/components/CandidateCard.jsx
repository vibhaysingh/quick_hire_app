import { memo } from "react";

const CandidateCardComponent = ({
  candidate,
  status,
  onClick,
  onAddToShortlist,
  onRemoveFromShortlist,
  onAddToRejected,
  onRemoveFromRejected,
  onAddToSelection,
  onRemoveFromSelection,
}) => {
  const handleClick = (e) => {
    if (e.target.closest(".candidate-card__actions")) return;
    onClick();
  };

  const handleShortlistToggle = (e) => {
    e.stopPropagation();
    if (status === "shortlisted" || status === "selected") {
      onRemoveFromShortlist();
    } else if (status === "rejected") {
      if (onRemoveFromRejected) {
        onRemoveFromRejected();
      }
    } else {
      onAddToShortlist();
    }
  };

  return (
    <div
      className={`candidate-card ${
        status === "shortlisted" ? "candidate-card--shortlisted" : ""
      } ${status === "selected" ? "candidate-card--selected" : ""} ${
        status === "rejected" ? "candidate-card--rejected" : ""
      }`}
      onClick={handleClick}
    >
      {status === "shortlisted" && (
        <div className="candidate-card__status candidate-card__status--shortlisted">
          Shortlisted
        </div>
      )}
      {status === "selected" && (
        <div className="candidate-card__status candidate-card__status--selected">
          Selected
        </div>
      )}
      {status === "rejected" && (
        <div className="candidate-card__status candidate-card__status--rejected">
          Rejected
        </div>
      )}

      <div className="candidate-card__name">{candidate.name}</div>
      <div className="candidate-card__location">{`📍 ${
        candidate.location || "Not Specified"
      }`}</div>

      <div className="candidate-card__info">
        <div className="candidate-card__info-row">
          <span className="candidate-card__label">Experience:</span>
          <span className="candidate-card__value">
            {candidate.work_experiences?.length >= 5
              ? "Senior"
              : candidate.work_experiences?.length >= 2
              ? "Mid-level"
              : "Junior"}
            {` - (Exp. Count: ${candidate.work_experiences?.length || 0})`}
          </span>
        </div>
        <div className="candidate-card__info-row">
          <span className="candidate-card__label">Highest Education:</span>
          <span className="candidate-card__value">
            {candidate.education?.highest_level || "Not specified"}
          </span>
        </div>
        <div className="candidate-card__info-row">
          <span className="candidate-card__label">Expected Salary:</span>
          <span className="candidate-card__value">
            {candidate.annual_salary_expectation?.["full-time"]
              ? candidate.annual_salary_expectation["full-time"]
              : "Not specified"}
          </span>
        </div>
      </div>

      <div className="candidate-card__skills">
        {(candidate.skills?.length > 0 ? candidate.skills : ["Not Specified"])
          .slice(0, 3)
          .map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        {(candidate.skills || []).length > 3 && (
          <span className="skill-tag">
            +{(candidate.skills || []).length - 3} more
          </span>
        )}
      </div>

      <div
        className="candidate-card__actions"
        style={{ marginTop: "var(--space-12)" }}
      >
        {status !== "rejected" && (
          <button
            className={`btn btn--sm ${
              status === "shortlisted" || status === "selected"
                ? "btn--outline"
                : "btn--primary"
            }`}
            onClick={handleShortlistToggle}
          >
            {status === "shortlisted" || status === "selected"
              ? "Remove from Shortlist"
              : "Add to Shortlist"}
          </button>
        )}
        {status === "available" && onAddToRejected && (
          <button
            className="btn btn--sm btn--reject"
            onClick={(e) => {
              e.stopPropagation();
              onAddToRejected();
            }}
            style={{
              marginLeft: status === "available" ? "var(--space-8)" : "0",
            }}
          >
            Reject
          </button>
        )}
        {status === "rejected" && (
          <button
            className="btn btn--sm btn--outline"
            onClick={handleShortlistToggle}
          >
            Remove from Rejected
          </button>
        )}
        {status === "shortlisted" && onAddToSelection && (
          <button
            className="btn btn--sm btn--primary"
            onClick={(e) => {
              e.stopPropagation();
              onAddToSelection();
            }}
            style={{
              marginLeft: "var(--space-8)",
            }}
          >
            Add to Final Selection
          </button>
        )}
        {status === "selected" && onRemoveFromSelection && (
          <button
            className="btn btn--sm btn--outline"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromSelection();
            }}
            style={{
              marginLeft: "var(--space-8)",
            }}
          >
            Remove from Final Selection
          </button>
        )}
      </div>
    </div>
  );
};

export const CandidateCard = memo(CandidateCardComponent);
