import React, { useState, useRef, useEffect } from 'react';
import useTest from '../hooks/useTest';
import TestCard from '../components/TestCard';
import { FaPlus } from "react-icons/fa6";
import './Test.css';
import CreateTestPopup from '../components/CreateTestPopup';

const Test = () => {
  const { tests, loading } = useTest();
  const [createTestPopup, setCreateTestPopup] = useState(false);
  const popupRef = useRef(null); // Ref for the popup
  const createTestRef = useRef(null); // Ref for the "Create test" button

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        createTestRef.current && 
        !createTestRef.current.contains(event.target)
      ) {
        setCreateTestPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    loading ? (
      <div className="loading">
        <div className="loader"></div>
      </div>
    ) : (
      <div className='test-page'>
        
        <div 
          className="create-test" 
          onClick={() => setCreateTestPopup(true)}
          ref={createTestRef}
        >
          <FaPlus className='plus-icon'/>
          <div className="hover-text">Create test</div>
        </div>

        <div className='test-card-container'>
          {tests.map((test, idx) => (
            <TestCard key={test?._id || idx} test={test} idx={idx} />
          ))}
        </div>
        {createTestPopup && (
          <div className="create-test-popup" ref={popupRef}>
            <CreateTestPopup onClose={()=>setCreateTestPopup(false)} />
          </div>
        )}
      </div>
    )
  );
};

export default Test;