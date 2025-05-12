import React from 'react';

const ReviewSentimentChart = ({ sentimentData }) => {
  if (!sentimentData || !sentimentData.chart_image) {
    return <div>No sentiment data available</div>;
  }

  return (
    <div className="text-center w-100">
      <img 
        src={`data:image/png;base64,${sentimentData.chart_image}`} 
        alt="Review Sentiment Distribution" 
        className="img-fluid" 
        style={{ maxHeight: "300px" }}
      />
      
      <div className="mt-3 d-flex justify-content-around">
        <div className="text-center">
          <div className="font-weight-bold text-success">
            {sentimentData.sentiment_data.positive || 0}
          </div>
          <div className="small text-muted">Positive</div>
        </div>
        <div className="text-center">
          <div className="font-weight-bold text-warning">
            {sentimentData.sentiment_data.neutral || 0}
          </div>
          <div className="small text-muted">Neutral</div>
        </div>
        <div className="text-center">
          <div className="font-weight-bold text-danger">
            {sentimentData.sentiment_data.negative || 0}
          </div>
          <div className="small text-muted">Negative</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSentimentChart;