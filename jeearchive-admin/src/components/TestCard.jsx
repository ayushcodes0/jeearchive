import React from 'react'
import "./TestCard.css"

const TestCard = () => {
  return (
    <div className='test-card'>
      <div className="test-top">
        <div className="test-gradient"></div>
        <div className="test-titile"></div>
      </div>
      <div className="test-bottom">
        <div className="test-date"></div>
        <div className="test-shift"></div>
      </div>
    </div>
  )
}

export default TestCard
