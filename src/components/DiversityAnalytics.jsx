import { memo, useMemo } from "react";

const DiversityAnalyticsComponent = ({ finalSelection }) => {
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

export const DiversityAnalytics = memo(DiversityAnalyticsComponent);
