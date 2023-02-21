import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HideLoader, ShowLoader } from "../../../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import { BiSend } from "react-icons/bi";
import { GetMessages, SendMessage } from "../../../apiCalls/messages";
import moment from "moment";
import { ClearChatMessages } from "../../../apiCalls/chats";
import { SetAllChats } from "../../../redux/userSlice";
import store from "../../../redux/store";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { BiLinkAlt } from "react-icons/bi";
import ImageModal from "../../../components/modal/ImageModal";
import { Modal } from "antd";

function ChatArea({ socket }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReceipentTyping, setIsReceipentTyping] = useState(false);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState("");
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer
  );
  const [messages = [], setMessages] = useState([]);
  const receipentUser = selectedChat.members.find(
    (mem) => mem._id !== user._id
  );

  //image
  const [showModal, setShowModal] = useState(false);
  const [showImage, setShowImage] = useState("");

  const sendNewMessage = async (image = "") => {
    try {
      // dispatch(ShowLoader());
      // payload - sending to backend
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image,
      };

      // send message to server using socket
      socket.emit("send-message", {
        ...message,
        members: selectedChat.members.map((mem) => mem._id),
        createdAt: moment().format("DD-MM-YYYY hh:mm:ss"),
        read: false,
      });

      // send message to server to save in DB

      const response = await SendMessage(message);
      // dispatch(HideLoader());
      if (response.success) {
        setNewMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      // dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const getMessages = async () => {
    try {
      dispatch(ShowLoader());
      const response = await GetMessages(selectedChat._id);
      dispatch(HideLoader());
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chat: selectedChat._id,
        members: selectedChat.members.map((mem) => mem._id),
      });

      const response = await ClearChatMessages(selectedChat._id);
      if (response.success) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));
      }
    } catch (error) {
      toast.error(error.message);
    }
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

  const handleImage = (data) => {
    console.log("show image");
    dispatch(ShowLoader());
    setShowModal(true);
    dispatch(HideLoader());
    setShowImage(data);
  };

  useEffect(() => {
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    // receive message from server using socket
    socket.on("receive-message", (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat;
      if (tempSelectedChat._id === message.chat) {
        setMessages((messages) => [...messages, message]);
      }

      if (
        tempSelectedChat._id === message.chat &&
        message.sender !== user._id
      ) {
        clearUnreadMessages();
      }
    });

    // clear unread messages from server using socket
    socket.on("unread-messages-cleared", (data) => {
      const tempAllChats = store.getState().userReducer.allChats;
      const tempSelectedChat = store.getState().userReducer.selectedChat;

      if (data.chat === tempSelectedChat._id) {
        // update unreadmessages count in selected chat
        const updatedChats = tempAllChats.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            };
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));

        // set all messages as read
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            return {
              ...message,
              read: true,
            };
          });
        });
      }
    });

    // receipent typing
    socket.on("started-typing", (data) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      if (data.chat === selectedChat._id && data.sender !== user._id) {
        setIsReceipentTyping(true);
      }
      setTimeout(() => {
        setIsReceipentTyping(false);
      }, 1500);
    });
  }, [selectedChat]);

  useEffect(() => {
    // always scroll to bottom for messages id
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages]);

  const onUploadImageClick = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      sendNewMessage(reader.result);
    };
  };

  return (
    <div className="bg-white p-3 h-full border rounded-2xl w-full flex flex-col justify-between">
      {/* 1st part receipent user */}

      <div>
        {" "}
        <div className="flex gap-5 items-center mb-2">
          {receipentUser.profilePic && (
            <img
              src={receipentUser.profilePic}
              alt="profile pic"
              className="h-10 w-10 rounded-full"
            />
          )}
          {!receipentUser.profilePic && (
            <div className="bg-gray-400 text-white rounded-full h-10 w-10 pt-3 flex items-center justify-center">
              <h1 className="uppercase text-xl font-semibold text-white">
                {receipentUser.name[0]}
              </h1>
            </div>
          )}
          <h1 className="uppercase">
            {receipentUser.name}
            {isReceipentTyping && (
              <h1 className="text-primary text-xs lowercase">typing...</h1>
            )}
          </h1>
        </div>
        <hr />
      </div>

      {/* 2nd part chat message */}

      <div className="h-[66vh] overflow-y-scroll p-3" id="messages">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => {
            const isCurrentUserIsSender = message.sender === user._id;
            return (
              <div className={`flex ${isCurrentUserIsSender && "justify-end"}`}>
                <div className="flex flex-col gap-1">
                  {message.text && (
                    <span className="md:max-w-[350px] lg:max-w-[600px] h-full break-words">
                      <h1
                        className={`${
                          isCurrentUserIsSender
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-gray-300 text-primary rounded-bl-none"
                        } rounded-lg p-2`}
                      >
                        {message.text}
                      </h1>
                    </span>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="message image"
                      className="h-44 rounded-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        handleImage(message.image);
                      }}
                    />
                  )}
                  <Modal
                    title="Image preview"
                    open={showModal}
                    onCancel={() => setShowModal(false)}
                    footer={null}
                    maskStyle={{ backgroundColor: "transparent", boxShadow: "none", outline:"none"}}
                  >
                    <ImageModal showImage={showImage} />
                  </Modal>

                  <h1
                    className={`${
                      isCurrentUserIsSender ? "text-right" : "text-left"
                    } text-xs text-gray-500`}
                  >
                    {getDateInRegularFormat(message.createdAt)}
                  </h1>
                </div>
                {/* for messages is seen or not */}
                {isCurrentUserIsSender && message.read && (
                  <div className="pl-1 flex items-end ">
                    {receipentUser.profilePic && (
                      <div className="border border-gray-300 rounded-full h-4 w-4">
                        <img
                          src={receipentUser.profilePic}
                          alt="profile pic"
                          className="rounded-full object-fill"
                        />
                      </div>
                    )}
                    {!receipentUser.profilePic && (
                      <div className="relative bg-gray-400 text-white rounded-full h-4 w-4 pt-1 flex items-center justify-center">
                        <h1 className="uppercase text-xs font-semibold text-white shadow-gray-600">
                          {receipentUser.name[0]}
                        </h1>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3rd part chat input */}

      <div className="h-18 border border-gray-200 rounded-xl shadow flex justify-between items-center p-3 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 ">
            <EmojiPicker
              height={350}
              onEmojiClick={(e) => {
                setNewMessage(newMessage + e.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
        <div className="flex gap-2 text-xl">
          <label htmlFor="file">
            <BiLinkAlt className="text-xl cursor-pointer" />
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              accept="image/gif, image/jpeg, image/jpg, image/png"
              onChange={onUploadImageClick}
            />
          </label>

          <BsEmojiSmile
            className="cursor-pointer text-xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
        </div>
        <input
          type="text"
          placeholder="type message"
          className="w-[90%] border-0 h-full text-base rounded-full focus:border-none"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socket.emit("typing", {
              chat: selectedChat._id,
              members: selectedChat.members.map((mem) => mem._id),
              sender: user._id,
            });
          }}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              sendNewMessage("");
            }
          }}
        />
        <button className="pr-3 h-max" onClick={() => sendNewMessage("")}>
          <BiSend className="text-4xl text-gray-700" />
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
