import { memo, useRef, useState } from "react";

const ChipInputComponent = ({
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

export const ChipInput = memo(ChipInputComponent);
