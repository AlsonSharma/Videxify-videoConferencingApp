import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import Footer from "./Footer";

export default function LandingPage() {

  const router = useNavigate();
  return (
    <div className='landingContainer'>
       <nav className="navContainer">
        <div className="navHeader">
            <h2 className="logo">videxify</h2>
        </div>
        <div className="navList">
            <p className="navItem" onClick={() => {
              router("/meet/assdsdfsdlfmoepw");
            }}>Join as Guest</p>
            <p className="navItem" onClick={() => {
              router("/auth");
            }}>Register</p>
            <div role='button' className="loginButton" onClick={() => {
              router("/auth");
            }}>
                <p>Login</p>
            </div>
            <i className="fa-solid fa-crown" id='proIcon' onClick={() => { router("/pricing")}}></i>
        </div>
       </nav>

       <div className="landingMainContainer">
        <div className="heroText">
            <h1> 
              <span className="gradientText">Connect</span> with your loved Ones
            </h1>
            <p className="subText">Bridge distances instantly with Videxify's HD video calling and messaging</p>
            <div role='button' className="ctaButton">
                <Link to={"/auth"}>Get Started 🚀</Link>
            </div>
        </div>
        <div className="heroImage">
            <img src="./chatApp.png" alt="Video Chat Interface" />
        </div>
       </div>
       <Footer />
    </div>
  )
}