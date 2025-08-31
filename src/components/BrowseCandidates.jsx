import { memo, useState } from "react";
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
  // AI functionality props
  isAIMode,
  setIsAIMode,
  isAILoading,
  onAIPrompt,
  apiKey,
  setApiKey,
  aiError,
  clearError,
  checkAPIKey,
}) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    // Only check for API key when actually submitting
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    clearError(); // Clear any previous errors
    await onAIPrompt(aiPrompt);
    setAiPrompt(""); // Clear the input after processing
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem("gemini_api_key", apiKey);
      setShowApiKeyInput(false);
    }
  };

  return (
    <div>
      {/* API Key Input Modal/Section */}
      {showApiKeyInput && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ padding: "1rem" }}>
            <h6 style={{ marginBottom: "0.5rem", color: "var(--color-text)" }}>
              Google Gemini API Key Required
            </h6>
            <p
              style={{
                marginBottom: "1rem",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              To use AI-powered search, please enter your Google Gemini API key:
            </p>
            <form
              onSubmit={handleApiKeySubmit}
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <input
                type="password"
                className="form-control"
                placeholder="Enter your Google Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn--primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowApiKeyInput(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="filter-panel">
        {/* Row 1: Search Bar */}
        <div
          className="search-bar"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          {!isAIMode ? (
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
          ) : (
            <form
              onSubmit={handleAISubmit}
              style={{ display: "flex", flex: 1, gap: "0.5rem" }}
            >
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe what you're looking for... (e.g., 'Senior React developers in New York with 5+ years experience')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isAILoading}
                />
                {isAILoading && (
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isAILoading || !aiPrompt.trim()}
              >
                Search
              </button>
            </form>
          )}
        </div>

        {/* AI Mode Toggle - Below search bar on the right */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "0.5rem",
            gap: "0.5rem",
            alignItems: "center",
            minHeight: "2rem", // Prevent layout shift
          }}
        >
          <label
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              whiteSpace: "nowrap",
              color: "var(--color-text)",
            }}
          >
            AI Mode
          </label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="aiModeToggle"
              checked={isAIMode}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsAIMode(checked);
                if (!checked) {
                  clearError(); // Clear errors when disabling AI mode
                } else {
                  // Check for API key when enabling AI mode
                  checkAPIKey(apiKey);
                }
              }}
            />
          </div>
          {isAIMode && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setShowApiKeyInput(true)}
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              {apiKey ? "Change API Key" : "Add API Key"}
            </button>
          )}
        </div>

        {/* Error Display for AI Mode */}
        {isAIMode && aiError && (
          <div
            className="status status--error"
            style={{
              padding: "0.625rem 0.75rem", // Reduced padding
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
              borderRadius: "0.75rem", // More curved corners
              fontSize: "var(--font-size-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
            }}
          >
            <span style={{ flex: 1, paddingRight: "0.5rem" }}>{aiError}</span>
            <button
              type="button"
              onClick={clearError}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: "1.75rem",
                height: "1.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "currentColor",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "scale(1)";
              }}
              title="Dismiss error"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

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
