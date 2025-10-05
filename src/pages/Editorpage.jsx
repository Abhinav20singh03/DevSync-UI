import React, { act, useEffect, useRef, useState } from 'react';
import './Editorpage.css';
import { useLocation, useParams } from 'react-router-dom';
import devsynclogo from '../assets/DevSync_logo_cyan_text.png';
import Clients from '../Components/Clients';
import Editor from '../Components/Editor';
import { initSocket } from '../socket';
import { toast } from 'react-toastify';
import { useNavigate ,Navigate} from 'react-router-dom';
import ACTIONS from '../actions.js';
import { PiUsersThreeFill } from "react-icons/pi";

const EditorPage = () => {
  const location = useLocation();
  const username = location.state?.username || 'Guest';
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const navigatorr = useNavigate();
  const {roomId} = useParams();
  console.log(roomId);
  
  const onCodeChange = (code)=>{
    codeRef.current = code;
  }

  useEffect(()=>{
    const init = async ()=>{
        socketRef.current =  await initSocket();
        socketRef.current.on("connect_error",(err)=> handleError(err));
        socketRef.current.on("connect_failed",(err)=> handleError(err));

        const handleError = (e)=>{
          console.log("socket error", e );
          toast.error("Socket connection failed, try agin later.");
          navigatorr("/");
        }

        socketRef.current.emit(ACTIONS.JOIN,{
          roomId,
          username : location.state?.username,
        });

        socketRef.current.on(ACTIONS.JOINED,({client,username,socketid})=>{
          if(username!==location.state?.username){
            toast.success(`${username} joined the room`);
            console.log(`${username} joined the room`);
          }
          setClients(client);
          socketRef.current.emit(ACTIONS.SYNC_CODE,{
            code:codeRef.current,
            socketid:socketid
          });
        });

        



        socketRef.current.on(ACTIONS.DISCONNECTED,({socketid,username})=>{
          toast.success(`${username} left the room`);
          setClients((prev) =>{
            return prev.filter((client)=>{
              return client.socketid!=socketid;
            })
          })
        });

    }
    init();
    


    

  },[])
  
  const leaveRoom = () => {
    if (socketRef.current) {
        socketRef.current.disconnect();
    }
    navigatorr('/'); 
};


  const copyHandler = async ()=>{
    const text = "Hello, Clipboard!";
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room ID Copied");
        } catch (err) {
            toast.error("Failed to copy Room ID");
        }
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = roomId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Room ID Copied");
    }
  }

  // Sample clients data
  const [clients, setClients] = useState([]);

  if(!location.state){
    return <Navigate to="/"/>
  }

  return (
    <div className="main-container">
      <aside className="profile-side">
        <div className="logo-img">
          <img className="profile-logo" src={devsynclogo} alt="DevSync Logo" />
        </div>
        <div className="mid-section">
          <div className='connect'>
            Currently Online
            <PiUsersThreeFill size={20} color='#32CD32' />
            </div>
          <div className="profiles">
            {clients.map((ele) => (
              <Clients key={ele.socketid} username={ele.username}/>
            ))}
          </div>
        </div>
        <div className="buttons">
          <button className="copy-button" onClick={copyHandler}>Copy Room ID</button>
          <button className="leave-button" onClick={leaveRoom}>Leave</button>
        </div>
      </aside>
      <div className="editor-side">
        
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange}/>
        </div>
    </div>
  );
};

export default EditorPage;
