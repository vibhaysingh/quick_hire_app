export const getSalaryRange = (rangeValue) => {
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
