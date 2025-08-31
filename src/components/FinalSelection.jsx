import { memo } from "react";

const FinalSelectionComponent = ({
  finalSelection,
  selectionReasons,
  updateSelectionReason,
  removeFromFinalSelection,
  shortlist,
  addToFinalSelection,
}) => {
  const availableForSelection = shortlist.filter(
    (candidate) =>
      !finalSelection.find((selected) => selected.id === candidate.id)
  );

  return (
    <div>
      <div className="shortlist-header">
        <h2>Final Selection</h2>
        <div className="shortlist-count">{finalSelection.length}</div>
      </div>

      {availableForSelection.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-24)" }}>
          <div className="card__body">
            <h3>Add from Shortlist</h3>
            <div className="candidates-grid">
              {availableForSelection.slice(0, 6).map((candidate) => (
                <div key={candidate.id} className="candidate-card">
                  <div className="candidate-card__name">{candidate.name}</div>
                  <div className="candidate-card__location">
                    {candidate.location ?? "Not Specified"}
                  </div>
                  <div className="candidate-card__experience">
                    {candidate.work_experiences?.length || 0} experiences
                  </div>
                  <button
                    className="btn btn--primary btn--sm"
                    style={{ marginTop: "var(--space-12)" }}
                    onClick={() => addToFinalSelection(candidate)}
                  >
                    Add to Final Selection
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {finalSelection.map((candidate) => (
        <div key={candidate.id} className="selection-item">
          <div className="selection-item__header">
            <div className="selection-item__name">{candidate.name}</div>
            <button
              className="remove-selection-btn"
              onClick={() => removeFromFinalSelection(candidate)}
            >
              Remove
            </button>
          </div>
          <div style={{ marginBottom: "var(--space-12)" }}>
            <strong>Location:</strong> {candidate.location} •{" "}
            <strong>Experience:</strong>{" "}
            {candidate.work_experiences?.length >= 5
              ? "Senior"
              : candidate.work_experiences?.length >= 2
              ? "Mid-level"
              : "Junior"}
            {` - (Exp. Count: ${candidate.work_experiences?.length || 0})`} •{" "}
            <strong>Salary:</strong>{" "}
            {candidate.annual_salary_expectation?.["full-time"]
              ? candidate.annual_salary_expectation["full-time"]
              : "Not specified"}
          </div>
          <div>
            <label className="form-label">
              Why are you hiring this candidate?
            </label>
            <textarea
              className="form-control reasoning-input"
              placeholder="Explain your reasoning for selecting this candidate..."
              value={selectionReasons[candidate.id] || ""}
              onChange={(e) =>
                updateSelectionReason(candidate.id, e.target.value)
              }
            />
          </div>
        </div>
      ))}

      {finalSelection.length === 0 && (
        <div className="empty-state">
          <h3>No candidates selected yet</h3>
          <p>Add candidates from your shortlist to build your final team.</p>
        </div>
      )}
    </div>
  );
};

export const FinalSelection = memo(FinalSelectionComponent);
