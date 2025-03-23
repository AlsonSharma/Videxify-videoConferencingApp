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

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeeting() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let[screenSharing, setScreenSharing] = useState();
    let [showModal, setShowModal] = useState(true);
    let [screenShareAvailable, setScreenShareAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState(" ");
    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let[videos, setVideos] = useState([]);
    let routeTo = useNavigate();

//    if(isChrome() === false) {

//    }

// Media Utility Functions
let silence = () => {
  let ctx = new AudioContext()
  let oscillator = ctx.createOscillator();

  let dst = oscillator.connect(ctx.createMediaStreamDestination());

  oscillator.start();
  ctx.resume()
  return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false})
}
let black = ({width = 640, height = 480} = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {width, height});

  canvas.getContext('2d').fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], {enabled: false})
}


//Media Permissions and Initialization
const getPermissions = async () => {
    try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoPermission) {
            setVideoAvailable(true);
            console.log('Video permission granted');
        } else {
            setVideoAvailable(false);
            console.log('Video permission denied');
        }

        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioPermission) {
            setAudioAvailable(true);
            console.log('Audio permission granted');
        } else {
            setAudioAvailable(false);
            console.log('Audio permission denied');
        }

        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenShareAvailable(true);
        } else {
            setScreenShareAvailable(false);
        }

        if (videoAvailable || audioAvailable) {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
            if (userMediaStream) {
                window.localStream = userMediaStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userMediaStream;
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

let getMedia = () => {
  setVideo(videoAvailable);
  setAudio(audioAvailable);
  
 connectToSocketServer();
}

let connect = () => {
  setAskForUsername(false);
  getMedia();
}

// WEBRTC CONNECTION MANAGEMENT
let getUserMediaSuccess = (stream) => {
    try {
        window.localStream.getTracks().forEach(track => track.stop())
    }catch(e){console.log(e)}

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for(let id in connections) {
        if(id === socketIdRef.current) continue;

        connections[id].addTrack(window.localStream)

        connections[id].createOffer().then((description)=> {
            connections[id].setLocalDescription(description)
            .then(()=> {socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
        })
        .catch(e => console.log(e));
        })
    }
    stream.getTracks().forEach(track => track.onended = () => {
        setVideo(false);
        setAudio(false);

        try{
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        }catch(e) {console.log(e)}

        //TODO BLACK SILENCE

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        for(let id in connections) {

            connections[id].addTrack(window.localStream)
            connections[id].createOffer()
            .then((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                }).catch(e => console.log(e));
            })
        }
    })
}

let gotMessageFromServer = (fromId, message) => {
  var signal = JSON.parse(message)

  if(fromId !== socketIdRef.current) {
      if(signal.sdp) {
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
              if(signal.sdp.type === "offer") {
                  connections[fromId].createAnswer().then((description) => {
                      connections[fromId].setLocalDescription(description).then(() => {
                          socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
                      }).catch(e => console.log(e))
                  }).catch(e => console.log(e)) 
              }
          }).catch(e => console.log(e))
      }
      if(signal.ice) {
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
  }
}

// Media Control Functions

let getUserMedia = () => {
    if((video && videoAvailable) || (audio && audioAvailable)) {
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e)) //GTE USER JEDIA SUCCESS
    } else {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop());
        }catch(e) {

        }
    }
}


let handleVideo = () => {
  setVideo(!video);
}
let handleAudio = () => {
  setAudio(!audio);
}

let getDisplayMediaSuccess = (stream => {
  try {
      window.localStream.getTracks().forEach(track => track.stop())
  } catch (error) {
      console.log(error)
  }
  window.localStream = stream;
  localVideoRef.current.srcObject = stream;


  for (let id in connections) {
      if(id === socketIdRef.current) continue;

      connections[id].addTrack(window.localStream)
      connections[id].createOffer().then((description)=> [
          connections[id].setLocalDescription(description)
          .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch(e => console.log(e))
      ])
  }

  stream.getTracks().forEach(track => track.onended = () => {
      setScreenSharing(false);

      try{
          let tracks = localVideoRef.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
      }catch(e) {console.log(e)}

      //TODO BLACK SILENCE

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      getUserMedia();
  })

})
let getDisplayMedia = () => {
  if(screenSharing) {
      if(navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({video:true, audio:true})
          .then(getDisplayMediaSuccess) 
          .then((stream) => {})
          .catch((e) => console.log(e))
      }
  }
}

let handleScreen = () => {
  setScreenSharing(!screenSharing)
}


// Socket Communication
let connectToSocketServer = () => {
  socketRef.current = io.connect(server_url, { secure: true })

  socketRef.current.on('signal', gotMessageFromServer)

  socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href)
      socketIdRef.current = socketRef.current.id

      socketRef.current.on('chat-message', addMessage)

      socketRef.current.on('user-left', (id) => {
          setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })

      socketRef.current.on('user-joined', (id, clients) => {
          clients.forEach((socketListId) => {

              connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
              // Wait for their ice candidate       
              connections[socketListId].onicecandidate = function (event) {
                  if (event.candidate != null) {
                      socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                  }
              }

              // Wait for their video stream
              connections[socketListId].ontrack = (event) => {
                  // console.log("BEFORE:", videoRef.current);
                  // console.log("FINDING ID: ", socketListId);

                  let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                  if (videoExists) {
                      // console.log("FOUND EXISTING");

                      // Update the stream of the existing video
                      setVideos(videos => {
                          const updatedVideos = videos.map(video =>
                              video.socketId === socketListId ? { ...video, stream: event.stream } : video
                          );
                          videoRef.current = updatedVideos;
                          return updatedVideos;
                      });
                  } else {
                      // Create a new video
                      console.log("CREATING NEW");
                      let newVideo = {
                          socketId: socketListId,
                          stream: event.stream,
                          autoplay: true,
                          playsinline: true
                      };

                      setVideos(videos => {
                          const updatedVideos = [...videos, newVideo];
                          videoRef.current = updatedVideos;
                          return updatedVideos;
                      });
                  }
              };


              // Add the local video stream
              if (window.localStream !== undefined && window.localStream !== null) {
                  connections[socketListId].addTrack(window.localStream)
              } else {
                  let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                  window.localStream = blackSilence()
                  connections[socketListId].addTrack(window.localStream)
              }
          })

          if (id === socketIdRef.current) {
              for (let id2 in connections) {
                  if (id2 === socketIdRef.current) continue

                  try {
                      connections[id2].addTrack(window.localStream)
                  } catch (e) { }

                  connections[id2].createOffer().then((description) => {
                      connections[id2].setLocalDescription(description)
                          .then(() => {
                              socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                          })
                          .catch(e => console.log(e))
                  })
              }
          }
      })
  })
}

let addMessage = (data, sender, socketIdSender) => {
  setMessages((prevMessages) => [...prevMessages, {sender: sender, data: data}])

  if(socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
  }
}

let sendMessage = () => {
  socketRef.current.emit("chat-message", message, username);
  setMessage("");
}

// UI EVENT HANDLERS
let handleEndCall = () => {
  try{
      // Stop all local media tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }

       // Close all peer connections
       for (let id in connections) {
        if (connections[id]) {
          connections[id].close(); // Close the RTCPeerConnection
          delete connections[id]; // Remove the connection from the connections object
        }
      }
       // Notify the server that the user has left
    if (socketRef.current) {
      socketRef.current.emit('user-left', socketIdRef.current);
      socketRef.current.disconnect(); // Disconnect the socket
    }
    window.location.href = "/home";
  }catch(e) {
      console.error("Error stopping tracks:", error);
  }
}


// Hooks and Effects
useEffect(() => {
  getPermissions();
},[])

useEffect(() => {
    if(video !== undefined && audio !== undefined) {
        getUserMedia();
        // console.log("SET STATE HAS ", video, audio);
    }
}, [video, audio])


useEffect(() => {
  if(screenSharing !== undefined) {
      getDisplayMedia();
  }
}, [screenSharing])

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
        <video className={styles.localVideo} ref={localVideoRef} autoPlay muted></video>
        <div className={styles.remoteVideos}>
          {videos.map((video) => (
            <div key={video.socketId} className={styles.videoTile}>
              <video
                data-socket={video.socketId}
                ref={ref => {
                  if(ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
                className={styles.remoteVideo}
              ></video>
            </div>
          ))}
        </div>
      </div>
    </div>}
</div>
  )
}
