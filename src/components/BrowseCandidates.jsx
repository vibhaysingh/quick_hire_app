import { memo } from "react";
import { Pagination } from "./Pagination";
import { CandidateCard } from "./CandidateCard";
import { ChipInput } from "./ChipInput";

const BrowseCandidatesComponent = ({
  candidates,
  filteredCount,
  totalCount,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  uniqueLocations,
  uniqueSkills,
  currentPage,
  totalPages,
  setCurrentPage,
  resetFilters,
  getCandidateStatus,
  onCandidateClick,
  addToShortlist,
  removeFromShortlist,
  addToRejected,
  removeFromRejected,
  addToFinalSelection,
  removeFromFinalSelection,
}) => {
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="filter-panel">
        {/* Row 1: Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, location, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Row 2: Location and Skills Chip Inputs */}
        <div className="filter-row-chips">
          <ChipInput
            label="Location"
            placeholder="Type to search locations..."
            options={uniqueLocations}
            selectedChips={filters.locations}
            onAddChip={(location) => {
              setFilters((prev) => ({
                ...prev,
                locations: [...prev.locations, location],
              }));
              setCurrentPage(1);
            }}
            onRemoveChip={(location) => {
              setFilters((prev) => ({
                ...prev,
                locations: prev.locations.filter((loc) => loc !== location),
              }));
            }}
          />

          <ChipInput
            label="Skills"
            placeholder="Type to search skills..."
            options={uniqueSkills}
            selectedChips={filters.skills}
            onAddChip={(skill) => {
              setFilters((prev) => ({
                ...prev,
                skills: [...prev.skills, skill],
              }));
              setCurrentPage(1);
            }}
            onRemoveChip={(skill) => {
              setFilters((prev) => ({
                ...prev,
                skills: prev.skills.filter((s) => s !== skill),
              }));
            }}
          />
        </div>

        {/* Row 3: Other Dropdown Filters */}
        <div className="filter-grid">
          <div>
            <label className="form-label">Education Level</label>
            <select
              className="form-control"
              value={filters.educationLevel}
              onChange={(e) =>
                handleFilterChange("educationLevel", e.target.value)
              }
            >
              <option value="">All Levels</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="High School">High School</option>
            </select>
          </div>

          <div>
            <label className="form-label">Experience Level</label>
            <select
              className="form-control"
              value={filters.experienceLevel}
              onChange={(e) =>
                handleFilterChange("experienceLevel", e.target.value)
              }
            >
              <option value="">All Levels</option>
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="form-label">Work Availability</label>
            <select
              className="form-control"
              value={filters.workAvailability}
              onChange={(e) =>
                handleFilterChange("workAvailability", e.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>

          <div>
            <label className="form-label">Salary Expectation</label>
            <select
              className="form-control"
              value={filters.salaryExpectation}
              onChange={(e) =>
                handleFilterChange("salaryExpectation", e.target.value)
              }
            >
              <option value="">All Ranges</option>
              <option value="$0 - $50k">$0 - $50k</option>
              <option value="$50k - $100k">$50k - $100k</option>
              <option value="$100k - $150k">$100k - $150k</option>
              <option value="$150k - $200k">$150k - $200k</option>
              <option value="$200k - $250k">$200k - $250k</option>
              <option value="$250k+">$250k+</option>
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Final Selected">Final Selected</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <div className="filter-summary">
            Showing {filteredCount} of {totalCount} candidates
          </div>
          <button className="btn btn--outline" onClick={resetFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            status={getCandidateStatus(candidate)}
            onClick={() => onCandidateClick(candidate)}
            onAddToShortlist={() => addToShortlist(candidate)}
            onRemoveFromShortlist={() => removeFromShortlist(candidate)}
            onAddToRejected={() => addToRejected(candidate)}
            onRemoveFromRejected={() => removeFromRejected(candidate)}
            onAddToSelection={() => addToFinalSelection(candidate)}
            onRemoveFromSelection={() => removeFromFinalSelection(candidate)}
          />
        ))}
      </div>

      {candidates.length === 0 && filteredCount === 0 && (
        <div className="empty-state">
          <h3>No candidates found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export const BrowseCandidates = memo(BrowseCandidatesComponent);
