import React, { useEffect, useRef, useState } from 'react'
import { Badge, Button, IconButton, TextField } from '@mui/material';
import {io} from "socket.io-client";
import VideoCamIcon from "@mui/icons-material/Videocam";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";

import styles from "../styles/videoComponent.module.css";
import { useNavigate } from 'react-router-dom';
import server from '../environment';

const server_url = server;



const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeeting() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const remoteStreams = useRef({}); // Track remote streams
  const connections = useRef({}); // Track peer connections
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [screenShareAvailable, setScreenShareAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  // Media Utilities
  const createBlackSilence = ({ width = 640, height = 480 } = {}) => {
      const canvas = Object.assign(document.createElement("canvas"), { width, height });
      canvas.getContext('2d').fillRect(0, 0, width, height);
      const stream = canvas.captureStream();
      return new MediaStream([stream.getVideoTracks()[0], new MediaStreamTrack()]);
  };

  // Media Initialization
  const getPermissions = async () => {
      try {
          const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
          setVideoAvailable(!!videoPermission);
          
          const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
          setAudioAvailable(!!audioPermission);
          
          setScreenShareAvailable(!!navigator.mediaDevices.getDisplayMedia);
          
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: videoAvailable, 
              audio: audioAvailable 
          });
          window.localStream = stream;
          localVideoRef.current.srcObject = stream;
      } catch (error) {
          console.error("Media error:", error);
          window.localStream = createBlackSilence();
          localVideoRef.current.srcObject = window.localStream;
      }
  };

  // WebRTC Connections
  const createPeerConnection = (id) => {
      const pc = new RTCPeerConnection(peerConfigConnections);
      
      pc.onicecandidate = (e) => {
          if (e.candidate) {
              socketRef.current.emit("signal", id, JSON.stringify({ ice: e.candidate }));
          }
      };

      pc.ontrack = (e) => {
          if (!remoteStreams.current[id]) {
              remoteStreams.current[id] = new MediaStream();
          }
          
          e.streams[0].getTracks().forEach(track => {
              remoteStreams.current[id].addTrack(track);
          });

          setVideos(prev => {
              const exists = prev.some(v => v.socketId === id);
              return exists ? prev : [...prev, { 
                  socketId: id, 
                  stream: remoteStreams.current[id],
                  autoplay: true,
                  playsinline: true
              }];
          });
      };

      pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'disconnected') {
              setVideos(prev => prev.filter(v => v.socketId !== id));
              delete remoteStreams.current[id];
              delete connections[id];
          }
      };

      return pc;
  };

  // Socket Handling
  const connectToSocketServer = () => {
      socketRef.current = io(server_url, { secure: true });
      
      socketRef.current.on('connect', () => {
          socketIdRef.current = socketRef.current.id;
          socketRef.current.emit('join-call', window.location.href);
      });

      socketRef.current.on('user-joined', (id, clients) => {
          clients.forEach(clientId => {
              if (clientId !== socketIdRef.current && !connections[clientId]) {
                  connections[clientId] = createPeerConnection(clientId);
                  window.localStream.getTracks().forEach(track => {
                      connections[clientId].addTrack(track, window.localStream);
                  });
                  
                  connections[clientId].createOffer()
                      .then(offer => connections[clientId].setLocalDescription(offer))
                      .then(() => {
                          socketRef.current.emit("signal", clientId, 
                              JSON.stringify({ sdp: connections[clientId].localDescription }));
                      });
              }
          });
      });

      socketRef.current.on('signal', (fromId, message) => {
          const signal = JSON.parse(message);
          const pc = connections[fromId];
          
          if (signal.sdp) {
              pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                  .then(() => {
                      if (signal.sdp.type === 'offer') {
                          pc.createAnswer()
                              .then(answer => pc.setLocalDescription(answer))
                              .then(() => {
                                  socketRef.current.emit("signal", fromId, 
                                      JSON.stringify({ sdp: pc.localDescription }));
                              });
                      }
                  });
          } else if (signal.ice) {
              pc.addIceCandidate(new RTCIceCandidate(signal.ice));
          }
      });

      socketRef.current.on('user-left', (id) => {
          if (connections[id]) {
              connections[id].close();
              delete connections[id];
              setVideos(prev => prev.filter(v => v.socketId !== id));
          }
      });
  };

  // Media Controls
  const updateMediaTracks = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: video && videoAvailable, 
              audio: audio && audioAvailable 
          });
          
          window.localStream.getTracks().forEach(track => track.stop());
          window.localStream = stream;
          localVideoRef.current.srcObject = stream;

          Object.values(connections).forEach(pc => {
              const sender = pc.getSenders();
              sender.forEach(s => pc.removeTrack(s));
              stream.getTracks().forEach(track => pc.addTrack(track, stream));
              pc.createOffer().then(offer => pc.setLocalDescription(offer))
                  .then(() => {
                      socketRef.current.emit("signal", pc.id, JSON.stringify({ sdp: pc.localDescription }))
                  });
          });
      } catch (error) {
          console.error("Media update error:", error);
      }
  };

  // Cleanup
  const handleEndCall = () => {
      Object.values(connections).forEach(pc => pc.close());
      socketRef.current?.disconnect();
      window.localStream?.getTracks().forEach(track => track.stop());
      navigate('/home');
  };

  useEffect(() => {
      getPermissions();
      return () => handleEndCall();
  }, []);

  useEffect(() => {
      if (video !== undefined && audio !== undefined) {
          updateMediaTracks();
      }
  }, [video, audio]);


  return (
    <div className={styles.container}>
  {askForUsername === true ? 
    <div className={styles.lobbyContainer}>
      <div className={styles.glassCard}>
        <h2 className={styles.gradientHeading}>Enter the Meeting Lobby</h2>
        <div className={styles.formGroup}>
          <TextField 
            fullWidth
            variant="outlined"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
            onClick={connect}
            sx={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 15px rgba(37,99,235,0.2)'
              }
            }}
          >
            Join Meeting
          </Button>
        </div>
        <div className={styles.videoPreview}>
          <video ref={localVideoRef} autoPlay muted className={styles.previewVideo}></video>
        </div>
      </div>
    </div> : 
    <div className={styles.meetVideoContainer}>
      {showModal && <div className={styles.chatRoom}>
        <div className={styles.chatContainer}>
          <h2 className={styles.gradientHeading}>Chat Room</h2>
          <div className={styles.chattingDisplay}>
            {messages.length > 0 ? messages.map((item, index) => (
              <div key={index} className={styles.messageBubble}>
                <p className={styles.sender}>{item.sender}</p>
                <p className={styles.messageText}>{item.data}</p>
              </div>
            )) : <p className={styles.noMessages}>No messages yet. Start the conversation!</p>}
          </div>
          <div className={styles.chattingArea}>
            <TextField 
              fullWidth
              variant="outlined"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
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
              onClick={sendMessage}
              sx={{
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 15px rgba(37,99,235,0.2)'
                }
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>}

      <div className={styles.buttonContainers}>
        <div className={styles.controlsGlass}>
          <IconButton onClick={handleVideo} className={styles.controlButton}>
            {(video === true) ? <VideoCamIcon fontSize="large" /> : <VideoCamOffIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={handleEndCall} className={styles.endCallButton}>
            <CallEndIcon fontSize="large" />
          </IconButton>
          <IconButton onClick={handleAudio} className={styles.controlButton}>
            {(audio === true) ? <MicIcon fontSize="large" /> : <MicOffIcon fontSize="large" />}
          </IconButton>

          {(screenShareAvailable === true) && (
            <IconButton onClick={handleScreen} className={styles.controlButton}>
              {(screenSharing === true) ? <ScreenShareIcon fontSize="large" /> : <StopScreenShareIcon fontSize="large" />}
            </IconButton>
          )}

          <Badge badgeContent={newMessages} color="secondary" overlap="circular">
            <IconButton onClick={() => setShowModal(!showModal)} className={styles.controlButton}>
              <ChatIcon fontSize="large" />
            </IconButton>
          </Badge>
        </div>
      </div>

      <div className={styles.videoGrid}>
      <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={styles.localVideo}
            ></video>

        <div className={styles.remoteVideos}>
        {videos.map(({ socketId, stream }) => (
                <div key={socketId} className={styles.videoTile}>
                    <video
                        ref={ref => {
                            if (ref && stream) {
                                ref.srcObject = stream;
                                ref.play().catch(() => {});
                            }
                        }}
                        autoPlay
                        playsInline
                        className={styles.remoteVideo}
                    />
                </div>
            ))}
        </div>
      </div>
    </div>}
</div>
  )
}
