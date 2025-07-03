import React, { useState, useRef } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom';
import './Register.css'
import { FaGoogle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { toast } from 'react-hot-toast';



const Register = () => {
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    role: "admin"
  })

  const [signinData, setSigninData] = useState({
    email: "",
    password: ""
  })

  const [withEmail, setWithEmail] = useState(false);
  const [signin, setSignin] = useState(false);

  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const cardsRef = useRef([]);
  // const animationRef = useRef(null);

  const handleSignupChange = (e) => {
    setSignupData({...signupData, [e.target.name] : e.target.value});
  }

  const handleSigninChange = (e) => {
    setSigninData({...signinData, [e.target.name] : e.target.value});
  }

  const handleSignup = async(e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', signupData);
      toast.success("User Registered Successfully",{
        style: {
          fontFamily: 'Satoshi',
          fontWeight: '300'
        },
      })
      console.log("Response : ", res.data.token);

      if (res.data.token && res.data.user.role === 'admin') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('admin_token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  const handleSignin = async(e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', signinData);
      toast.success("User Logged In Successfully",{
        style: {
          fontFamily: 'Satoshi',
          fontWeight: '300'
        },
      })
      console.log("Response : ", res.data.token);

      if (res.data.token && res.data.user.role === 'admin') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('admin_token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="register-form">
      <div className="left-side-register" ref={sliderRef}>
        <div className="slider">
          <div className="register-card register-card1" ref={el => cardsRef.current[0] = el}></div>
          <div className="register-card register-card2" ref={el => cardsRef.current[1] = el}></div>
          <div className="register-card register-card3" ref={el => cardsRef.current[2] = el}></div>
          <div className="register-card register-card1" ref={el => cardsRef.current[3] = el}></div>
          <div className="register-card register-card2" ref={el => cardsRef.current[4] = el}></div>
          <div className="register-card register-card3" ref={el => cardsRef.current[5] = el}></div>
        </div>
      </div>

      <div className="right-side-register">
        { !withEmail? (
          <>
          <div className="logo"></div>
          <div className="signup-heading">
            <h2 className='signup-h2'>Let's get <br /> started</h2>
            <p className='signup-p'>Bring your personal email, <br /> connect your work later</p>
          </div>
          <div className="signup-options">
            <button className='with-google'><FaGoogle className='google-icon' /> Continue with Google</button>
            <button className='with-email' onClick={()=>setWithEmail(true)}><IoMdMail className='mail-icon'/>Continue with email</button>
          </div> </>
        ):(
          <>
          <p><IoMdClose onClick={()=>setWithEmail(false)} className='cross-icon'/></p>
          { !signin? 
            (
              <>
                <h2>Signup with <br /> email address</h2>
                <form onSubmit={handleSignup}>
                  <input name="firstName" placeholder="First Name" onChange={handleSignupChange} required />
                  <input name="lastName" placeholder="Last Name" onChange={handleSignupChange} required />
                  <input name="email" type="email" placeholder="Email" onChange={handleSignupChange} required />
                  <input name="password" type="password" placeholder="Password" onChange={handleSignupChange} required />
                  <input name="confirmPassword" type='password' placeholder="Confirm password" onChange={handleSignupChange} required />
                  <button type="submit">Signup</button>
                </form>
                <p className='signup-signin-p'>Already have an account? <span onClick={()=>setSignin(true)}>Signin</span></p>
              </>
            ):(
              <>
                <h2>Signin with <br /> email address</h2>
                <form onSubmit={handleSignin}>
                  <input name="email" type="email" placeholder="Email" onChange={handleSigninChange} required />
                  <input name="password" type="password" placeholder="Password" onChange={handleSigninChange} required />
                  <button type="submit">Signin</button>
                </form>
                <p className='signup-signin-p'>Don't have an account? <span onClick={()=>setSignin(false)}>Signup</span></p>
              </>
            )
          }
          </>
        )
        }
          
      </div>
    </div>
  )
}

export default Register