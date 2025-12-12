import React from "react";

import SuggestionPill from "./SuggestionPill";

type Props = {
  onSuggest: () => void;
};

const DateAssistButton: React.FC<Props> = ({ onSuggest }) => {
  return <SuggestionPill onPress={onSuggest} />;
};

export default DateAssistButton;
