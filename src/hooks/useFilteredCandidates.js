import { useMemo } from "react";
import { getSalaryRange } from "../utils/common.utils";

export const useFilteredCandidates = (
  candidates,
  filters,
  shortlist,
  finalSelection,
  rejectedCandidates
) => {
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

  return filteredCandidates;
};
