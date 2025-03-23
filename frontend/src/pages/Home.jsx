import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import RestoreIcon from "@mui/icons-material/Restore";
import { Button, IconButton, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import Footer from "./Footer";

function Home() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const {addToUserHistory} = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/meet/${meetingCode}`);
  };
  return (
    <>
       <div className="homeContainer">
      <nav className="navContainer">
        <div className="navHeader">
          <h2 className="logo">videxify</h2>
        </div>
        <div className="navList">
          <div className="historyButton" onClick={() => navigate("/history")}>
            <IconButton sx={{ color: '#2563eb' }}>
              <RestoreIcon />
            </IconButton>
            <p className="navItem">History</p>
          </div>
          <Button
            className="logoutButton"
            onClick={() => {
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      <div className="meetContainer">
        <div className="heroContent">
          <div className="heroText">
            <h1>
              Providing <span className="gradientText">Quality Video Call</span><br />
              As Real As Life
            </h1>
            <div className="joinContainer">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter meeting code"
                onChange={e => setMeetingCode(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused fieldset': {
                      borderColor: '#2563eb',
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleJoinVideoCall}
                sx={{
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  color: 'white',
                  px: 4.5,
                  py: 1.8,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  width: "40%",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 15px rgba(37,99,235,0.2)'
                  }
                }}
              >
                Join Call
              </Button>
            </div>
          </div>
          <div className="heroImage">
            <img src="./homeLogo.png" alt="Video Call Illustration" />
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default withAuth(Home);
