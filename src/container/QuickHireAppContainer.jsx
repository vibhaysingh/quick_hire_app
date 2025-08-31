import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash-es";

import { Header } from "../components/Header";
import { Dashboard } from "../components/Dashboard";
import { BrowseCandidates } from "../components/BrowseCandidates";
import { ShortlistView } from "../components/ShortlistView";
import { RejectedView } from "../components/RejectedView";
import { FinalSelection } from "../components/FinalSelection";
import { CandidateModal } from "../components/CandidateModal";
import { INITIAL_FILTERS } from "../constants/common.constants";
import { useCandidates } from "../hooks/useCandidates";
import { useFilteredCandidates } from "../hooks/useFilteredCandidates";

// Main App Component
const QuickHireAppContainer = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [shortlist, setShortlist] = useState([]);
  const [finalSelection, setFinalSelection] = useState([]);
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [selectionReasons, setSelectionReasons] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { candidates, isLoading, uniqueLocations, uniqueSkills } =
    useCandidates();

  const filteredCandidates = useFilteredCandidates(
    candidates,
    filters,
    shortlist,
    finalSelection,
    rejectedCandidates
  );

  // Debounced search
  const debouncedSearch = debounce((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  }, 200);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const addToShortlist = (candidate) => {
    if (!shortlist.find((c) => c.id === candidate.id)) {
      setShortlist((prev) => [...prev, candidate]);
    }
  };

  const removeFromShortlist = (candidate) => {
    setShortlist((prev) => prev.filter((c) => c.id !== candidate.id));
    setFinalSelection((prev) => prev.filter((c) => c.id !== candidate.id));
    setSelectionReasons((prev) => {
      const newReasons = { ...prev };
      delete newReasons[candidate.id];
      return newReasons;
    });
  };

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
