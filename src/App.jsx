import { useState, useEffect, useMemo, useRef } from "react";
import { uniqueId, debounce } from "lodash-es";

import candidatesData from "./data/candidates.json";
import quickHireLogoDark from "./data/quick-hire-logo-dark.svg";

// Utility functions

// Helper function to check if salary falls within expectation range
const getSalaryRange = (rangeValue) => {
  switch (rangeValue) {
    case "$0 - $50k":
      return { min: 0, max: 50000 };
    case "$50k - $100k":
      return { min: 50000, max: 100000 };
    case "$100k - $150k":
      return { min: 100000, max: 150000 };
    case "$150k - $200k":
      return { min: 150000, max: 200000 };
    case "$200k - $250k":
      return { min: 200000, max: 250000 };
    case "$250k+":
      return { min: 250000, max: Infinity };
    default:
      return null;
  }
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shortlist, setShortlist] = useState([]);
  const [finalSelection, setFinalSelection] = useState([]);
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [selectionReasons, setSelectionReasons] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    locations: [], // Changed to array for chips
    skills: [],
    educationLevel: "",
    experienceLevel: "",
    salaryExpectation: "", // Changed to salary expectation range
    workAvailability: "",
    status: "", // Added status filter
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load candidates data with retry mechanism
  useEffect(() => {
    setIsLoading(false);
    const loadCandidates = () => {
      try {
        if (
          candidatesData &&
          Array.isArray(candidatesData) &&
          candidatesData.length > 0
        ) {
          // Create unique candidates and assign unique IDs using lodash uniqueId
          const candidatesWithUniqueIds = candidatesData.map((candidate) => ({
            ...candidate,
            id: uniqueId(`${Date.now()}-${candidate.email}`),
          }));
          setCandidates(candidatesWithUniqueIds);
        } else {
          throw new Error("No candidates data found");
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    loadCandidates();
  }, []);

  // Get unique values for filters
  const uniqueLocations = useMemo(() => {
    return [...new Set(candidates.map((c) => c.location))]
      .filter(Boolean)
      .sort();
  }, [candidates]);

  const uniqueSkills = useMemo(() => {
    const allSkills = candidates.flatMap((c) => c.skills || []);
    return [...new Set(allSkills)].filter(Boolean).sort();
  }, [candidates]);

  // Debounced search
  const debouncedSearch = debounce((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  }, 200);

  // Update search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        !filters.search ||
        candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.location
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (candidate.skills || []).some((skill) =>
          skill.toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesLocation =
        filters.locations.length === 0 ||
        filters.locations.includes(candidate.location);

      const matchesSkills =
        filters.skills.length === 0 ||
        filters.skills.some((skill) =>
          (candidate.skills || []).includes(skill)
        );

      const matchesEducation =
        !filters.educationLevel ||
        candidate.education?.highest_level === filters.educationLevel;

      const matchesExperience =
        !filters.experienceLevel ||
        (candidate.work_experiences?.length > 0 &&
          filters.experienceLevel === "Senior" &&
          candidate.work_experiences.length >= 5) ||
        (candidate.work_experiences?.length > 0 &&
          filters.experienceLevel === "Mid-level" &&
          candidate.work_experiences.length >= 2 &&
          candidate.work_experiences.length < 5) ||
        (candidate.work_experiences?.length > 0 &&
          filters.experienceLevel === "Junior" &&
          candidate.work_experiences.length < 2);

      const salary =
        parseInt(
          candidate.annual_salary_expectation?.["full-time"]?.replace("$", "")
        ) || 0;

      const matchesSalary =
        !filters.salaryExpectation ||
        (() => {
          const range = getSalaryRange(filters.salaryExpectation);
          return range && salary >= range.min && salary <= range.max;
        })();

      const matchesAvailability =
        !filters.workAvailability ||
        (candidate.work_availability || []).includes(filters.workAvailability);

      const matchesStatus =
        !filters.status ||
        (() => {
          const candidateId = candidate.id;
          switch (filters.status) {
            case "Final Selected":
              return finalSelection.some((c) => c.id === candidateId);
            case "Shortlisted":
              return shortlist.some((c) => c.id === candidateId);
            case "Rejected":
              return rejectedCandidates.some((c) => c.id === candidateId);
            default:
              return true;
          }
        })();

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSkills &&
        matchesEducation &&
        matchesExperience &&
        matchesSalary &&
        matchesAvailability &&
        matchesStatus
      );
    });
  }, [candidates, filters, shortlist, finalSelection, rejectedCandidates]);

  // Paginated candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  // Shortlist management
  const addToShortlist = (candidate) => {
    if (!shortlist.find((c) => c.id === candidate.id)) {
      setShortlist((prev) => [...prev, candidate]);
    }
  };

  const removeFromShortlist = (candidate) => {
    setShortlist((prev) => prev.filter((c) => c.id !== candidate.id));
    // Also remove from final selection if present
    setFinalSelection((prev) => prev.filter((c) => c.id !== candidate.id));
    setSelectionReasons((prev) => {
      const newReasons = { ...prev };
      delete newReasons[candidate.id];
      return newReasons;
    });
  };

  // Final selection management
  const addToFinalSelection = (candidate) => {
    if (!finalSelection.find((c) => c.id === candidate.id)) {
      setFinalSelection((prev) => [...prev, candidate]);
      // Also add to shortlist if not already there
      if (!shortlist.find((c) => c.id === candidate.id)) {
        setShortlist((prev) => [...prev, candidate]);
      }
    }
  };

  const removeFromFinalSelection = (candidate) => {
    setFinalSelection((prev) => prev.filter((c) => c.id !== candidate.id));
    setSelectionReasons((prev) => {
      const newReasons = { ...prev };
      delete newReasons[candidate.id];
      return newReasons;
    });
  };

  const updateSelectionReason = (candidateId, reason) => {
    setSelectionReasons((prev) => ({ ...prev, [candidateId]: reason }));
  };

  // Reject management
  const addToRejected = (candidate) => {
    if (!rejectedCandidates.find((c) => c.id === candidate.id)) {
      setRejectedCandidates((prev) => [...prev, candidate]);
      // Remove from shortlist and final selection if present
      setShortlist((prev) => prev.filter((c) => c.id !== candidate.id));
      setFinalSelection((prev) => prev.filter((c) => c.id !== candidate.id));
      setSelectionReasons((prev) => {
        const newReasons = { ...prev };
        delete newReasons[candidate.id];
        return newReasons;
      });
    }
  };

  const removeFromRejected = (candidate) => {
    setRejectedCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
  };

  // Get candidate status
  const getCandidateStatus = (candidate) => {
    if (rejectedCandidates.find((c) => c.id === candidate.id))
      return "rejected";
    if (finalSelection.find((c) => c.id === candidate.id)) return "selected";
    if (shortlist.find((c) => c.id === candidate.id)) return "shortlisted";
    return "available";
  };

  // Navigation - Fixed to properly update view
  const navigate = (view) => {
    setCurrentView(view);
    setSelectedCandidate(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      locations: [], // Changed to array
      skills: [],
      educationLevel: "",
      experienceLevel: "",
      salaryExpectation: "", // Changed to salary expectation range
      workAvailability: "",
      status: "", // Added status filter
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="hiring-dashboard">
        <div className="loading">Loading hiring dashboard...</div>
      </div>
    );
  }

  return (
    <div className="hiring-dashboard">
      <Header
        currentView={currentView}
        navigate={navigate}
        shortlistCount={shortlist.length}
        selectionCount={finalSelection.length}
        rejectedCount={rejectedCandidates.length}
      />

      <main className="main-content">
        {currentView === "dashboard" && (
          <Dashboard
            candidates={candidates}
            navigate={navigate}
            shortlistCount={shortlist.length}
            selectionCount={finalSelection.length}
            rejectedCount={rejectedCandidates.length}
            finalSelection={finalSelection}
          />
        )}

        {currentView === "browse" && (
          <BrowseCandidates
            candidates={paginatedCandidates}
            filteredCount={filteredCandidates.length}
            totalCount={candidates.length}
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            uniqueLocations={uniqueLocations}
            uniqueSkills={uniqueSkills}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            resetFilters={resetFilters}
            getCandidateStatus={getCandidateStatus}
            onCandidateClick={setSelectedCandidate}
            addToShortlist={addToShortlist}
            removeFromShortlist={removeFromShortlist}
            addToRejected={addToRejected}
            removeFromRejected={removeFromRejected}
            addToFinalSelection={addToFinalSelection}
            removeFromFinalSelection={removeFromFinalSelection}
          />
        )}

        {currentView === "shortlist" && (
          <ShortlistView
            shortlist={shortlist}
            getCandidateStatus={getCandidateStatus}
            onCandidateClick={setSelectedCandidate}
            removeFromShortlist={removeFromShortlist}
            addToFinalSelection={addToFinalSelection}
            removeFromFinalSelection={removeFromFinalSelection}
          />
        )}

        {currentView === "rejected" && (
          <RejectedView
            rejectedCandidates={rejectedCandidates}
            getCandidateStatus={getCandidateStatus}
            onCandidateClick={setSelectedCandidate}
            removeFromRejected={removeFromRejected}
          />
        )}

        {currentView === "selection" && (
          <FinalSelection
            finalSelection={finalSelection}
            selectionReasons={selectionReasons}
            updateSelectionReason={updateSelectionReason}
            removeFromFinalSelection={removeFromFinalSelection}
            shortlist={shortlist}
            addToFinalSelection={addToFinalSelection}
          />
        )}
      </main>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          status={getCandidateStatus(selectedCandidate)}
          onAddToShortlist={() => addToShortlist(selectedCandidate)}
          onRemoveFromShortlist={() => removeFromShortlist(selectedCandidate)}
          onAddToSelection={() => addToFinalSelection(selectedCandidate)}
          onRemoveFromSelection={() =>
            removeFromFinalSelection(selectedCandidate)
          }
          onAddToRejected={() => addToRejected(selectedCandidate)}
          onRemoveFromRejected={() => removeFromRejected(selectedCandidate)}
        />
      )}
    </div>
  );
};

// Header Component
const Header = ({
  currentView,
  navigate,
  shortlistCount,
  selectionCount,
  rejectedCount,
}) => {
  return (
    <header className="header">
      <div className="header__content">
        <div className="header__brand">
          <img
            src={quickHireLogoDark}
            alt="Quick Hire"
            className="header__logo"
            onClick={() => navigate("dashboard")}
          />
        </div>
        <nav className="header__nav">
          <div
            className={`nav-item ${
              currentView === "dashboard" ? "active" : ""
            }`}
            onClick={() => navigate("dashboard")}
          >
            Dashboard
          </div>
          <div
            className={`nav-item ${currentView === "browse" ? "active" : ""}`}
            onClick={() => navigate("browse")}
          >
            Browse Candidates
          </div>
          <div
            className={`nav-item ${
              currentView === "shortlist" ? "active" : ""
            }`}
            onClick={() => navigate("shortlist")}
          >
            Shortlist ({shortlistCount})
          </div>
          <div
            className={`nav-item ${currentView === "rejected" ? "active" : ""}`}
            onClick={() => navigate("rejected")}
          >
            Rejected ({rejectedCount})
          </div>
          <div
            className={`nav-item ${
              currentView === "selection" ? "active" : ""
            }`}
            onClick={() => navigate("selection")}
          >
            Final Selection ({selectionCount})
          </div>
        </nav>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = ({
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

// Browse Candidates Component
const BrowseCandidates = ({
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
  // Chip Input Component for locations and skills
  const ChipInput = ({
    label,
    placeholder,
    options,
    selectedChips,
    onAddChip,
    onRemoveChip,
  }) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
      const value = e.target.value;
      setInput(value);

      if (value.trim()) {
        const filtered = options
          .filter(
            (option) =>
              option.toLowerCase().includes(value.toLowerCase()) &&
              !selectedChips.includes(option)
          )
          .slice(0, 10);
        setSuggestions(filtered);
        setIsOpen(true); // Always show dropdown when typing
      } else {
        // Show first 10 options when input is empty but focused
        const defaultSuggestions = options
          .filter((option) => !selectedChips.includes(option))
          .slice(0, 10);
        setSuggestions(defaultSuggestions);
        setIsOpen(defaultSuggestions.length > 0);
      }
    };

    const handleFocus = () => {
      if (!input.trim()) {
        const defaultSuggestions = options
          .filter((option) => !selectedChips.includes(option))
          .slice(0, 10);
        setSuggestions(defaultSuggestions);
        setIsOpen(defaultSuggestions.length > 0);
      } else {
        setIsOpen(suggestions.length > 0);
      }
    };

    const addChip = (option) => {
      onAddChip(option);
      setInput("");
      setSuggestions([]);
      setIsOpen(false);
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    const removeChip = (chip) => {
      onRemoveChip(chip);
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Backspace" && !input && selectedChips.length > 0) {
        removeChip(selectedChips[selectedChips.length - 1]);
      }
    };

    return (
      <div className="chip-input-container">
        <label className="form-label">{label}</label>
        <div className="chip-input-wrapper" style={{ position: "relative" }}>
          <div className="chip-input-field">
            {selectedChips.map((chip) => (
              <span key={chip} className="input-chip">
                {chip}
                <button
                  className="input-chip__remove"
                  onClick={() => removeChip(chip)}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              className="chip-input"
              placeholder={selectedChips.length === 0 ? placeholder : ""}
              value={input}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => setIsOpen(false), 200);
              }}
            />
          </div>

          {isOpen && (
            <div className="autocomplete-dropdown">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="autocomplete-option"
                    onClick={() => addChip(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="autocomplete-no-results">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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

// Candidate Card Component
const CandidateCard = ({
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
      <div className="candidate-card__location">{`📍 ${candidate.location}`}</div>

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

// Candidate Modal Component
const CandidateModal = ({
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

// Shortlist View Component
const ShortlistView = ({
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

// Final Selection Component
const FinalSelection = ({
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
                    {candidate.location}
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

// Diversity Analytics Component
const DiversityAnalytics = ({ finalSelection }) => {
  const metrics = useMemo(() => {
    if (finalSelection.length === 0) return null;

    const locations = {};
    const experienceLevels = {};
    const educationLevels = {};
    const skills = {};

    finalSelection.forEach((candidate) => {
      if (candidate.location) {
        locations[candidate.location] =
          (locations[candidate.location] || 0) + 1;
      }

      // Map experience level based on work experiences count
      const expCount = candidate.work_experiences?.length || 0;
      let experienceLevel = "Junior";
      if (expCount >= 5) experienceLevel = "Senior";
      else if (expCount >= 2) experienceLevel = "Mid-level";

      experienceLevels[experienceLevel] =
        (experienceLevels[experienceLevel] || 0) + 1;

      if (candidate.education?.highest_level) {
        educationLevels[candidate.education.highest_level] =
          (educationLevels[candidate.education.highest_level] || 0) + 1;
      }

      (candidate.skills || []).forEach((skill) => {
        skills[skill] = (skills[skill] || 0) + 1;
      });
    });

    return {
      locations: Object.entries(locations).sort((a, b) => b[1] - a[1]),
      experienceLevels: Object.entries(experienceLevels).sort(
        (a, b) => b[1] - a[1]
      ),
      educationLevels: Object.entries(educationLevels).sort(
        (a, b) => b[1] - a[1]
      ),
      skills: Object.entries(skills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }, [finalSelection]);

  if (finalSelection.length === 0) {
    return (
      <div className="empty-state">
        <h3>No team selected yet</h3>
        <p>Complete your final selection to see diversity analytics.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "var(--space-24)" }}>
        Team Diversity Analytics
      </h2>

      <div className="diversity-grid">
        <div className="diversity-metric">
          <div className="diversity-metric__title">Geographic Distribution</div>
          {metrics.locations.map(([location, count]) => (
            <div key={location} className="diversity-item">
              <div className="diversity-item__label">{location}</div>
              <div className="diversity-item__value">{count}</div>
            </div>
          ))}
        </div>

        <div className="diversity-metric">
          <div className="diversity-metric__title">Experience Levels</div>
          {metrics.experienceLevels.map(([level, count]) => (
            <div key={level} className="diversity-item">
              <div className="diversity-item__label">{level}</div>
              <div className="diversity-item__value">{count}</div>
            </div>
          ))}
        </div>

        <div className="diversity-metric">
          <div className="diversity-metric__title">Education Levels</div>
          {metrics.educationLevels.map(([level, count]) => (
            <div key={level} className="diversity-item">
              <div className="diversity-item__label">{level}</div>
              <div className="diversity-item__value">{count}</div>
            </div>
          ))}
        </div>

        <div className="diversity-metric">
          <div className="diversity-metric__title">Top Skills</div>
          {metrics.skills.map(([skill, count]) => (
            <div key={skill} className="diversity-item">
              <div className="diversity-item__label">{skill}</div>
              <div className="diversity-item__value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={uniqueId([Date.now(), index])}
            className="pagination-btn"
            style={{ cursor: "default" }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

// Rejected View Component
const RejectedView = ({
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

export default App;
