import { memo } from "react";
import quickHireLogoDark from "../data/quick-hire-logo-dark.svg";

const _Header = ({
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

export const Header = memo(_Header);
