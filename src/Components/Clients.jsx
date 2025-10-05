import React, { useEffect, useState } from 'react'
import "./Clients.css"
const Clients = ({username}) => {
    const [name,setName] = useState("");
    const nameFilter = ()=>{
        let dummyName = "" ;
        dummyName+=username[0];
        for(let i=1;i<username.length;i++){
            if(username[i-1]==" "){
                dummyName+=username[i];
            }
        }
        setName(dummyName);
    }

    useEffect(()=>{
        nameFilter();
    },[]);

  return (
    <div className='client-wrapper'>
      <div className='client-container'>
      {name}
    </div>
     {username.length > 8 ? username.slice(0,8)+".." : username}
    </div>
   
  )
}

export default Clients
