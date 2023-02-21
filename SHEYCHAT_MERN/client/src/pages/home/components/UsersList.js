import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../../redux/loaderSlice";
import { SetAllChats, SetSelectedChat } from "../../../redux/userSlice";
import { CreateNewChat } from "../../../apiCalls/chats";
import moment from "moment";
import store from "../../../redux/store";

function UsersList({ searchKey, socket, onlineUsers, setSearchKey }) {
  const { allUsers, allChats, user, selectedChat } = useSelector(
    (state) => state.userReducer
  );

  const dispatch = useDispatch();
  const createNewChat = async (receipentUserId) => {
    try {
      dispatch(ShowLoader());
      const response = await CreateNewChat([user._id, receipentUserId]);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChats = [...allChats, newChat];
        dispatch(SetAllChats(updatedChats));
        dispatch(SetSelectedChat(newChat));
        setSearchKey("");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  // open chat area

  const openChat = (receipentUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((mem) => mem._id).includes(user._id) &&
        chat.members.map((mem) => mem._id).includes(receipentUserId)
    );
    if (chat) {
      dispatch(SetSelectedChat(chat));
    }
  };

  // get chat data

  const getData = () => {
    // if search key is empty then return all chats else return filtered chats and users
    try {
      if (searchKey === "") {
        return allChats || [];
      }
      return allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchKey.toLowerCase())
      );
    } catch (error) {
      return [];
    }
  };

  const getIsSelectedChatOrNot = (userObj) => {
    if (selectedChat) {
      return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
    }
    return false;
  };

  const getDateInRegularFormat = (date) => {
    let result = "";

    // if date is today return time
    if (moment(date).isSame(moment(), "day")) {
      result = moment(date).format("hh:mm");
    }
    // if date is yesterday return yesterday and time in hh:mm format
    else if (moment(date).isSame(moment().subtract(1, "day"), "day")) {
      result = `Yesterday ${moment(date).format("hh:mm")}`;
    }
    // if date is this year return date and time in MMM DD hh:mm format
    else if (moment(date).isSame(moment(), "year")) {
      result = moment(date).format("MMM DD hh:mm");
    }
    return result;
  };

  const getLastMessage = (userObj) => {
    const chat = allChats.find((chat) =>
      chat.members.map((mem) => mem._id).includes(userObj._id)
    );
    if (!chat || !chat.lastMessage) {
      return "";
    } else {
      const lastMessagePerson =
        chat?.lastMessage?.sender === user._id ? "You : " : "";
      return (
        <div className="flex justify-between text-xs w-full">
          <h1 className="text-gray-700 text-clip overflow-hidden">
            {lastMessagePerson} {chat?.lastMessage?.text}
          </h1>
          <h1 className="text-gray-400 flex justify-end float-right">
            {getDateInRegularFormat(chat?.lastMessage?.createdAt)}
          </h1>
        </div>
      );
    }
  };

  // unread notification on chat-list
  const getUnreadMessages = (userObj) => {
    const chat = allChats.find((chat) =>
      chat.members.map((mem) => mem._id).includes(userObj._id)
    );
    if (chat && chat?.unreadMessages && chat?.lastMessage.sender !== user._id) {
      return (
        <div className="bg-blue-400 text-white text-xs font-semibold rounded-full h-5 w-5 mt-1 flex items-center justify-center">
          {chat?.unreadMessages}
        </div>
      );
    }
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      // if the chat area opened is not equal to chat in message , then increase unread messages by 1 and update last message
      const tempSelectedChat = store.getState().userReducer.selectedChat;
      let tempAllChats = store.getState().userReducer.allChats;
      if (tempSelectedChat?._id !== message.chat) {
        const updatedAllChats = tempAllChats.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              unreadMessages: (chat?.unreadMessages || 0) + 1,
              lastMessage: message,
            };
          }
          return chat;
        });
        tempAllChats = updatedAllChats;
      }

      // always latest message chat will be on top
      const latestChat = tempAllChats.find((chat) => chat._id === message.chat);
      const otherChats = tempAllChats.filter(
        (chat) => chat._id !== message.chat
      );
      tempAllChats = [latestChat, ...otherChats];
      dispatch(SetAllChats(tempAllChats));
    });
  }, []);

  return (
    <div className="flex flex-col mt-3 rounded-2xl overflow-hidden border border-gray-200 w-full h-full">
      {getData().map((chatObjOruserObj) => {
        let userObj = chatObjOruserObj;

        if (chatObjOruserObj.members) {
          userObj = chatObjOruserObj.members.find(
            (mem) => mem._id !== user._id
          );
        }
        return (userObj && 
          <div
            className={`w-full flex justify-between border-gray-100 p-2 bg-white items-center cursor-pointer
            ${getIsSelectedChatOrNot(userObj) && "bg-gray-200"}
            `}
            key={userObj._id}
            onClick={() => openChat(userObj._id)}
          >
            <div className="flex w-full items-center space-x-4">
              {userObj.profilePic && (
                <img
                  src={userObj.profilePic}
                  alt="profile pic"
                  className="h-9 w-9 rounded-full"
                />
              )}
              {!userObj.profilePic && (
                <div className="relative bg-gray-400 text-white rounded-full h-9 w-11 pt-3 flex items-center justify-center">
                  <h1 className="uppercase text-xl font-semibold text-white">
                    {userObj.name[0]}
                  </h1>
                </div>
              )}
              <div className="flex flex-col w-full">
                <div className="flex ">
                  <div className="flex items-center ">
                    <h1>{userObj.name}</h1>
                    {onlineUsers.includes(userObj._id) && (
                      <div>
                        <div className=" bg-green-500 h-2 w-2 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getUnreadMessages(userObj)}
                </div>
                {getLastMessage(userObj)}
              </div>
            </div>
            <div onClick={() => createNewChat(userObj._id)}>
              {!allChats.find((chat) =>
                chat.members.map((mem) => mem._id).includes(userObj._id)
              ) && (
                <button className="border-primary border text-primary bg-white p-1 rounded">
                  Create Chat
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UsersList;
