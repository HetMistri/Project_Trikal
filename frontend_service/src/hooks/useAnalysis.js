import { useState, useCallback } from "react";

export const useAnalysisState = () => {
  const [locationData, setLocationData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationCard, setShowLocationCard] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const startAnalysis = useCallback((coordinates) => {
    setShowLocationCard(true);
    setShowSummary(false);
    setIsLoading(false); // Don't start with loading state
    setSummaryData(null);
    setSelectedEntry(null);
  }, []);

  const setAnalysisData = useCallback((data) => {
    setLocationData(data);
    // Only set loading to false if we're not in a preliminary state
    if (data.address !== "Loading...") {
      setIsLoading(false);
    }
  }, []);

  const startFullAnalysis = useCallback(() => {
    setIsLoading(true);
  }, []);

  const setSummaryAnalysis = useCallback((summary) => {
    setSummaryData(summary);
    setShowSummary(true);
    setIsLoading(false);
  }, []);

  const addToHistory = useCallback((entry) => {
    setHistoryEntries((prev) => [entry, ...prev]);
  }, []);

  const selectHistoryEntry = useCallback((entry) => {
    setSelectedEntry(entry);
    setShowLocationCard(true);
    setShowSummary(true);
  }, []);

  const clearAnalysis = useCallback(() => {
    setLocationData(null);
    setSummaryData(null);
    setShowLocationCard(false);
    setShowSummary(false);
    setIsLoading(false);
    setSelectedEntry(null);
  }, []);

  const cancelAnalysis = useCallback(() => {
    setShowLocationCard(false);
    setShowSummary(false);
    setIsLoading(false);
    setSelectedEntry(null);
  }, []);

  return {
    // State
    locationData,
    summaryData,
    isLoading,
    showLocationCard,
    showSummary,
    historyEntries,
    selectedEntry,

    // Actions
    startAnalysis,
    setAnalysisData,
    setSummaryAnalysis,
    addToHistory,
    selectHistoryEntry,
    clearAnalysis,
    cancelAnalysis,
    startFullAnalysis,
  };
};
