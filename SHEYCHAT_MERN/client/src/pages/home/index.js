import React, { useEffect, useState } from "react";
import ChatArea from "./components/ChatArea";
import UserSearch from "./components/UserSearch";
import UsersList from "./components/UsersList";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Chat from "../../Images/chat.png";
const socket = io("http://localhost:5000");

localStorage.setItem("socket", socket);
function Home() {
  const [searchKey, setSearchKey] = useState("");
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // join the room
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("came-online", user._id);

      socket.on("online-users-updated", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full md:flex-row space-y-3 md:space-x-2 md:space-y-0">
      {/* 1st part user search, userList/ chatList */}
      <div className="w-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
        <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
        <UsersList
          searchKey={searchKey}
          socket={socket}
          onlineUsers={onlineUsers}
          setSearchKey={setSearchKey}
        />
      </div>

      {/* 2nd part chatArea */}
      {selectedChat && (
        <div className="w-full">
          {/* {" "} */}
          <ChatArea socket={socket} />
        </div>
      )}
      {!selectedChat && (
        <div className="w-full rounded-2xl bg-white flex flex-col items-center justify-center">
          <img src={Chat} alt="" className="w-[50%] lg:w-[30%] z-0" />
          <h1 className="text-gray-500 text-2xl">Select a user to chat</h1>
        </div>
      )}
    </div>
  );
}

export default Home;
