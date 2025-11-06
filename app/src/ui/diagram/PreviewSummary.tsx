import type React from 'react';
import './PreviewSummary.css';

export interface RoutePreviewData {
  routeName: string;
  totalStops: number;
  totalDistance?: number;
  estimatedDuration?: number;
  consists: Array<{
    name: string;
    vehicleTypeName: string;
    carCount: number;
    totalLength: number;
    speedCategory: 'slow' | 'standard' | 'fast';
  }>;
}

interface PreviewSummaryProps {
  previewData: RoutePreviewData;
}

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({ previewData }) => {
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters.toFixed(0)}m`;
  };

  const totalConsists = previewData.consists.length;
  const totalCarCount = previewData.consists.reduce((sum, c) => sum + c.carCount, 0);
  const averageLength =
    totalConsists > 0
      ? previewData.consists.reduce((sum, c) => sum + c.totalLength, 0) / totalConsists
      : 0;

  const speedCategoryCounts = {
    slow: previewData.consists.filter((c) => c.speedCategory === 'slow').length,
    standard: previewData.consists.filter((c) => c.speedCategory === 'standard').length,
    fast: previewData.consists.filter((c) => c.speedCategory === 'fast').length,
  };

  return (
    <section className="preview-summary" aria-label="Route preview summary">
      <div className="summary-header">
        <h3>Route Preview Summary</h3>
        <p className="summary-subtitle">Overview of {previewData.routeName}</p>
      </div>

      <div className="summary-sections">
        <div className="summary-section route-info">
          <h4>Route Information</h4>
          <dl className="info-list">
            <div className="info-item">
              <dt>Total Stops:</dt>
              <dd>{previewData.totalStops}</dd>
            </div>
            <div className="info-item">
              <dt>Total Distance:</dt>
              <dd>{formatDistance(previewData.totalDistance)}</dd>
            </div>
            <div className="info-item">
              <dt>Estimated Duration:</dt>
              <dd>{formatDuration(previewData.estimatedDuration)}</dd>
            </div>
          </dl>
        </div>

        <div className="summary-section consist-overview">
          <h4>Consists Overview</h4>
          <dl className="info-list">
            <div className="info-item">
              <dt>Total Consists:</dt>
              <dd>{totalConsists}</dd>
            </div>
            <div className="info-item">
              <dt>Total Cars:</dt>
              <dd>{totalCarCount}</dd>
            </div>
            <div className="info-item">
              <dt>Average Length:</dt>
              <dd>{averageLength.toFixed(1)}m</dd>
            </div>
          </dl>
        </div>

        <div className="summary-section speed-breakdown">
          <h4>Speed Categories</h4>
          <div className="speed-categories">
            <div className="speed-category-item">
              <span className="category-label speed-slow">Slow</span>
              <span className="category-count">{speedCategoryCounts.slow}</span>
            </div>
            <div className="speed-category-item">
              <span className="category-label speed-standard">Standard</span>
              <span className="category-count">{speedCategoryCounts.standard}</span>
            </div>
            <div className="speed-category-item">
              <span className="category-label speed-fast">Fast</span>
              <span className="category-count">{speedCategoryCounts.fast}</span>
            </div>
          </div>
        </div>
      </div>

      {totalConsists > 0 && (
        <div className="consists-detail">
          <h4>Consist Details</h4>
          <div className="consists-table-wrapper">
            <table className="consists-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle Type</th>
                  <th>Cars</th>
                  <th>Length</th>
                  <th>Speed</th>
                </tr>
              </thead>
              <tbody>
                {previewData.consists.map((consist, index) => (
                  <tr key={`${consist.name}-${index}`}>
                    <td className="consist-name">{consist.name}</td>
                    <td>{consist.vehicleTypeName}</td>
                    <td className="numeric">{consist.carCount}</td>
                    <td className="numeric">{consist.totalLength.toFixed(1)}m</td>
                    <td>
                      <span className={`speed-badge speed-${consist.speedCategory}`}>
                        {consist.speedCategory}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
