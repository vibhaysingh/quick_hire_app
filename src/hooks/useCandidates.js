import { useState, useEffect, useMemo } from "react";
import { uniqueId } from "lodash-es";
import candidatesData from "../data/candidates.json";

export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    candidates,
    isLoading,
    uniqueLocations,
    uniqueSkills,
  };
};
