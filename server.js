import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv"; 
import ACTIONS from "./src/actions.js";

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


const userSocketMap = {};

function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map((socketid)=>{
        return {
            socketid,
            username : userSocketMap[socketid],
        };
    });
}

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    console.log(socket.rooms)
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const client = getAllConnectedClients(roomId);
        console.log(client);
        client.forEach(({socketid})=>{
            io.to(socketid).emit(ACTIONS.JOINED,{
                client,
                username:username,
                socketid:socket.id
            });
        });
    });


    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code})
      });

    socket.on(ACTIONS.SYNC_CODE,({socketid,code})=>{
        io.to(socketid).emit(ACTIONS.CODE_CHANGE,{code})
    });

    socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
  socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
});


    socket.on("disconnecting",()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketid:socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });


});

server.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});