import useAppStore from "../store/appStore";

export default function SatelliteInfo() {
  const backendResponse = useAppStore((s) => s.backendResponse);

  if (!backendResponse) {
    return (
      <div className="sat-info card">
        <h4>Analysis</h4>
        <p>No analysis yet. Select an area on the map to run analysis.</p>
      </div>
    );
  }

  const aoi = backendResponse.aoi || "N/A";
  const start = backendResponse.input_date?.start || "N/A";
  const end = backendResponse.input_date?.end || "N/A";

  return (
    <div className="sat-info card">
      <h4>Analysis Result</h4>
      <div>
        <strong>AOI (WKT)</strong>
        <pre
          style={{ maxHeight: 120, overflow: "auto", whiteSpace: "pre-wrap" }}
        >
          {aoi}
        </pre>
      </div>
      <div>
        <strong>Date Range</strong>
        <div>
          {start.substring(0, 10)} → {end.substring(0, 10)}
        </div>
      </div>

      {/* Optional fields from backend MLRequest result */}
      {backendResponse.heatmap && (
        <div>
          <strong>Heatmap Point</strong>
          <div>
            Lat: {backendResponse.heatmap.lat}, Lon:{" "}
            {backendResponse.heatmap.lon}
          </div>
          <div>Intensity: {backendResponse.heatmap.intensity}</div>
        </div>
      )}

      {backendResponse.risk_score && (
        <div>
          <strong>Risk Score</strong>
          <div>{backendResponse.risk_score}</div>
        </div>
      )}

      {backendResponse.hypothesis_text && (
        <div>
          <strong>Hypothesis</strong>
          <div>{backendResponse.hypothesis_text}</div>
        </div>
      )}
    </div>
  );
}
