import { memo } from "react";
import { CandidateCard } from "./CandidateCard";

const RejectedViewComponent = ({
  rejectedCandidates,
  getCandidateStatus,
  onCandidateClick,
  removeFromRejected,
}) => {
  return (
    <div>
      <div className="shortlist-header">
        <h2>Rejected Candidates</h2>
        <div className="shortlist-count">{rejectedCandidates.length}</div>
      </div>

      {rejectedCandidates.length === 0 ? (
        <div className="empty-state">
          <h3>No candidates rejected yet</h3>
          <p>Candidates you reject will appear here for future reference.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {rejectedCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              status={getCandidateStatus(candidate)}
              onClick={() => onCandidateClick(candidate)}
              onAddToShortlist={() => {}} // Disabled for rejected candidates
              onRemoveFromShortlist={() => {}} // Not used for rejected candidates
              onRemoveFromRejected={() => removeFromRejected(candidate)}
              onAddToRejected={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const RejectedView = memo(RejectedViewComponent);
