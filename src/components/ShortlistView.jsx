import { memo } from "react";
import { CandidateCard } from "./CandidateCard";

const ShortlistViewComponent = ({
  shortlist,
  getCandidateStatus,
  onCandidateClick,
  removeFromShortlist,
  addToFinalSelection,
  removeFromFinalSelection,
}) => {
  return (
    <div>
      <div className="shortlist-header">
        <h2>Shortlisted Candidates</h2>
        <div className="shortlist-count">{shortlist.length}</div>
      </div>

      {shortlist.length === 0 ? (
        <div className="empty-state">
          <h3>No candidates shortlisted yet</h3>
          <p>
            Start browsing candidates and add promising ones to your shortlist.
          </p>
        </div>
      ) : (
        <div className="candidates-grid">
          {shortlist.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              status={getCandidateStatus(candidate)}
              onClick={() => onCandidateClick(candidate)}
              onAddToShortlist={() => addToFinalSelection(candidate)}
              onRemoveFromShortlist={() => removeFromShortlist(candidate)}
              onAddToRejected={undefined}
              onRemoveFromRejected={undefined}
              onAddToSelection={() => addToFinalSelection(candidate)}
              onRemoveFromSelection={() => removeFromFinalSelection(candidate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export const ShortlistView = memo(ShortlistViewComponent);
