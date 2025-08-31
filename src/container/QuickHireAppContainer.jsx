import { useState, useEffect, useMemo } from "react";
import { uniqueId, debounce } from "lodash-es";

import candidatesData from "../data/candidates.json";
import { Header } from "../components/Header";
import { Dashboard } from "../components/Dashboard";
import { BrowseCandidates } from "../components/BrowseCandidates";
import { ShortlistView } from "../components/ShortlistView";
import { RejectedView } from "../components/RejectedView";
import { FinalSelection } from "../components/FinalSelection";
import { CandidateModal } from "../components/CandidateModal";
import { getSalaryRange } from "../utils/common.utils";
import { INITIAL_FILTERS } from "../constants/common.constants";

// Main App Component
const QuickHireAppContainer = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shortlist, setShortlist] = useState([]);
  const [finalSelection, setFinalSelection] = useState([]);
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [selectionReasons, setSelectionReasons] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setIsLoading(false);
    const loadCandidates = () => {
      try {
        if (
          candidatesData &&
          Array.isArray(candidatesData) &&
          candidatesData.length > 0
        ) {
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

  const addToRejected = (candidate) => {
    if (!rejectedCandidates.find((c) => c.id === candidate.id)) {
      setRejectedCandidates((prev) => [...prev, candidate]);
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

  const getCandidateStatus = (candidate) => {
    if (rejectedCandidates.find((c) => c.id === candidate.id))
      return "rejected";
    if (finalSelection.find((c) => c.id === candidate.id)) return "selected";
    if (shortlist.find((c) => c.id === candidate.id)) return "shortlisted";
    return "available";
  };

  const navigate = (view) => {
    setCurrentView(view);
    setSelectedCandidate(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
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

export default QuickHireAppContainer;
