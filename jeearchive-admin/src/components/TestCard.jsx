import React, { useEffect, useRef, useState } from 'react'
import "./TestCard.css"
import { BsThreeDotsVertical } from "react-icons/bs";
import { TbMenu } from "react-icons/tb";
import CardOptionPopup from './CardOptionPopup';


const TestCard = ({ test, idx }) => {
  // Define gradient colors based on index
  const getGradientStyle = (index) => {
    const gradients = [
      "linear-gradient(to right, #3F5EFB, #FC466B)",  // Gradient 1 (default)
      "linear-gradient(to right, #00c6ff, #0072ff)",  // Gradient 2
      "linear-gradient(to right, #f46b45, #eea849)",  // Gradient 3
      "linear-gradient(to right, #4776E6, #8E54E9)",  // Gradient 4
      "linear-gradient(to right, #1D976C, #93F9B9)",  // Gradient 5
    ];
    return {
      background: gradients[index % gradients.length]
    };
  };

  const tiltClass = idx % 2 === 0 ? "even" : "odd";

  const [showCardOptionPopup, setShowCardOptionPopup] = useState(false);

  const popupRef = useRef(null);

  /* 3️⃣ close the popup when the user clicks anywhere outside it */
  useEffect(() => {
    if (!showCardOptionPopup) return;                        // run only when open

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowCardOptionPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCardOptionPopup]);


  return (
    <div className={`test-card ${tiltClass}`}>
        <TbMenu className='dots-icon' onClick={()=>setShowCardOptionPopup(true)}/>
        {
            showCardOptionPopup && (<div className='options-popup' ref={popupRef}>
                <CardOptionPopup testId={test._id} />
            </div>)
        }
      <div className="test-top">
        <div className="gradient">
          <div 
            className="test-gradient" 
            style={getGradientStyle(idx)}
          >
            {test.type}
          </div>
        </div>
        <div className="test-title">{test.title}</div>
      </div>
      <div className="test-bottom">
        <div className="test-date">{test.date}</div>
        <div className="test-shift">{test.shift}</div>
      </div>
    </div>
  )
}

export default TestCard