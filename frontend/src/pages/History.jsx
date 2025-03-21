import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';

import { IconButton } from '@mui/material';
export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR Later
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className="historyContainer">
        <div className="historyHeader">
          <IconButton 
            onClick={() => routeTo("/home")}
            sx={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              color: 'white',
              p: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(37,99,235,0.3)'
              }
            }}
          >
            <HomeIcon />
          </IconButton>
          <h2 className="historyTitle">Meeting History</h2>
        </div>
  
        <div className="meetingsGrid">
          {meetings.length > 0 ? (
            meetings.map((e, i) => (
              <Card 
                key={i} 
                sx={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 15px rgba(37,99,235,0.2)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Meeting Code: {e.meetingCode}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1,
                      color: '#64748b'
                    }}
                  >
                    Date: {formatDate(e.date)}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="emptyState">
              <img src="../public/empties.jpeg" alt="No meetings" />
              <Typography variant="h6" sx={{ color: '#64748b', mt: 2 }}>
                No meetings found
              </Typography>
            </div>
          )}
        </div>
      </div>
    )
}