import React from 'react'
import { useLocation } from 'react-router-dom';

const UploadTestQuestions = () => {

  const { state } = useLocation();
  const testId = state?.testId;  

  return (
    <div>
      Upload test questions {testId}
    </div>
  )
}

export default UploadTestQuestions
