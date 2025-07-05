import React from 'react'
import useTest from '../hooks/useTest'
import TestCard from '../components/TestCard';
import './Test.css';

const Test = () => {
  const {tests, loading} = useTest();
  console.log("Test data: ", tests)
  return (
      loading? 
      (
        <>
          <div className="loading">
            <div className="loader"></div>
          </div>
        </>
      )

      :
      
      (
        <>
        <div className='test-page'>
            <div className='test-card-container'>
            {tests.map((test, idx)=>{
              return (
                <><TestCard key={test?._id || idx} test={test} idx={idx}/></>
              )
            })}
            </div>
        </div>
        </>
      )
    
  )
}

export default Test
