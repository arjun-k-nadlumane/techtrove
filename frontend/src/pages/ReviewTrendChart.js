import React from 'react';

const ReviewTrendChart = ({ trendData }) => {
  if (!trendData || !trendData.chart_image) {
    return <div>No trend data available</div>;
  }

  return (
    <div className="text-center">
      <img 
        src={`data:image/png;base64,${trendData.chart_image}`} 
        alt="Rating Trend Over Time" 
        className="img-fluid" 
        style={{ maxHeight: "400px", width: "100%" }}
      />
      
      {trendData.trend_data && trendData.trend_data.length > 0 && (
        <div className="mt-3 small text-muted">
          Based on {trendData.trend_data.length} data points
        </div>
      )}
    </div>
  );
};

export default ReviewTrendChart;