import React, { useEffect, useState } from "react";
import { GetAllUsers, GetCurrentUser } from "../apiCalls/users";
import { GetAllChats } from "../apiCalls/chats";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../redux/loaderSlice";
import { SetAllChats, SetAllUsers, SetUser } from "../redux/userSlice";
import { BsChatDots } from "react-icons/bs";
import { RiShieldUserLine } from "react-icons/ri";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getCurrentUser = async () => {
    try {
      dispatch(ShowLoader());
      const response = await GetCurrentUser();
      const allUsersResponse = await GetAllUsers();
      const allChatsResponse = await GetAllChats();
      dispatch(HideLoader());
      if (response.success) {
        dispatch(SetUser(response.data));
        dispatch(SetAllUsers(allUsersResponse.data));
        dispatch(SetAllChats(allChatsResponse.data));
      } else {
        toast.error(response.message);
        // navigate("/login");
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
      // navigate("/login");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getCurrentUser();
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="h-full md:h-screen w-screen bg-gray-100 p-2 z-10">
      {/* header */}
      <div className="flex flex-col space-y-2 md:items-center md:flex-row md:space-y-0 justify-between p-5 bg-primary rounded">
        <div className="flex align-middle space-x-3 text-white">
          <BsChatDots className="text-3xl" />
          <h1
            className="text-2xl uppercase font-semibold cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            SHEYCHAT
          </h1>
        </div>
        <div className="flex align-middle space-x-3 text-md p-1 bg-violet-100 items-center rounded-lg w-full md:w-fit">
          {user?.profilePic && (
            <img
              src={user?.profilePic}
              alt="profile"
              className="h-8 w-8 rounded-full object-cover ml-3"
            />
          )}
          {!user?.profilePic && (
            <RiShieldUserLine className="text-2xl text-primary" />
          )}
          <h1
            className="underline pt-2 text-2xl cursor-pointer text-primary"
            onClick={() => {
              navigate("/profile");
            }}
          >
            {user?.name}
          </h1>
          <RiLogoutCircleRLine
            className="ml-5 md:mr-2 text-xl text-primary"
            onClick={() => {
              socket.emit("went-offline", user._id);
              localStorage.removeItem("token");
              navigate("/login");
            }}
          />
        </div>
      </div>

      {/* content (pages) */}
      <div className="py-3">{children}</div>
    </div>
  );
}

export default ProtectedRoute;
