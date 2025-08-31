import { memo, useEffect } from "react";

const CandidateModalComponent = ({
  candidate,
  onClose,
  status,
  onAddToShortlist,
  onRemoveFromShortlist,
  onAddToSelection,
  onRemoveFromSelection,
  onAddToRejected,
  onRemoveFromRejected,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save current overflow style
    const originalOverflow = document.body.style.overflow;

    // Disable scroll
    document.body.style.overflow = "hidden";

    // Restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{candidate.name}</h2>
          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal__body">
          <div className="candidate-section">
            <h3>Basic Information</h3>
            <p>
              <strong>Location:</strong> {candidate.location}
            </p>
            <p>
              <strong>Email:</strong> {candidate.email}
            </p>
            <p>
              <strong>Phone:</strong> {candidate.phone}
            </p>
            <p>
              <strong>Experience Level:</strong>{" "}
              {candidate.work_experiences?.length >= 5
                ? "Senior"
                : candidate.work_experiences?.length >= 2
                ? "Mid-level"
                : "Junior"}
              {` - (Exp. Count: ${candidate.work_experiences?.length || 0})`}
            </p>
            <p>
              <strong>Education Level:</strong>{" "}
              {candidate.education?.highest_level || "Not specified"}
            </p>
            <p>
              <strong>Salary Expectation:</strong>{" "}
              {candidate.annual_salary_expectation?.["full-time"]
                ? candidate.annual_salary_expectation["full-time"]
                : "Not specified"}
            </p>
            <p>
              <strong>Work Availability:</strong>{" "}
              {(candidate.work_availability || []).join(", ")}
            </p>
          </div>

          <div className="candidate-section">
            <h3>Skills</h3>
            <div
              className="flex"
              style={{ flexWrap: "wrap", gap: "var(--space-8)" }}
            >
              {(candidate.skills || []).map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="candidate-section">
            <h3>Work Experience</h3>
            {(candidate.work_experiences || []).map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="experience-item__company">{exp.company}</div>
                <div className="experience-item__role">{exp.roleName}</div>
              </div>
            ))}
          </div>

          <div className="candidate-section">
            <h3>Education</h3>
            {(candidate.education?.degrees || []).map((degree, index) => (
              <div key={index} className="education-item">
                <div className="education-item__degree">
                  {degree.degree} in {degree.subject}
                </div>
                <div className="education-item__details">
                  {degree.school} • {degree.startDate} - {degree.endDate} •{" "}
                  {degree.gpa}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-8" style={{ marginTop: "var(--space-20)" }}>
            {status === "available" && (
              <button className="btn btn--primary" onClick={onAddToShortlist}>
                Add to Shortlist
              </button>
            )}
            {(status === "shortlisted" || status === "selected") && (
              <button
                className="btn btn--outline"
                onClick={onRemoveFromShortlist}
              >
                Remove from Shortlist
              </button>
            )}
            {status === "shortlisted" && (
              <button className="btn btn--primary" onClick={onAddToSelection}>
                Add to Final Selection
              </button>
            )}
            {status === "selected" && (
              <button
                className="btn btn--outline"
                onClick={onRemoveFromSelection}
              >
                Remove from Final Selection
              </button>
            )}
            {status === "available" && (
              <button className="btn btn--reject" onClick={onAddToRejected}>
                Reject Candidate
              </button>
            )}
            {status === "rejected" && (
              <button
                className="btn btn--outline"
                onClick={onRemoveFromRejected}
              >
                Remove from Rejected
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const CandidateModal = memo(CandidateModalComponent);
