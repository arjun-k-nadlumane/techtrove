import React from 'react';

const ReviewRatingChart = ({ ratingData }) => {
  if (!ratingData || !ratingData.chart_image) {
    return <div>No rating data available</div>;
  }

  return (
    <div className="text-center w-100">
      <img 
        src={`data:image/png;base64,${ratingData.chart_image}`} 
        alt="Review Rating Distribution" 
        className="img-fluid" 
        style={{ maxHeight: "300px" }}
      />
      
      <div className="mt-3 d-flex flex-wrap justify-content-around">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="text-center px-2">
            <div className="font-weight-bold">
              {ratingData.rating_data[rating] || 0}
            </div>
            <div className="small text-muted">
              {rating} {rating === 1 ? 'Star' : 'Stars'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewRatingChart;