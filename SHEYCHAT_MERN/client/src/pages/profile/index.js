import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { UpadateProfilePicture } from "../../apiCalls/users";
import { toast } from "react-hot-toast";
import { SetUser } from "../../redux/userSlice";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image = "", setImage] = useState("");
  const dispatch = useDispatch();
  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      console.log(reader.result);
      setImage(reader.result);
    };
  };

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  const updateProfilePic = async () => {
    try {
      dispatch(ShowLoader());
      const response = await UpadateProfilePicture(image);
      dispatch(HideLoader());
      if (response.success) {
        toast.success("Profile Pic Updated");
        dispatch(SetUser(response.data));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  return (
    user && (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-xl font-semibold text-gray-500 flex flex-col gap-2 p-3 shadow-md border w-max rounded-md">
          <h1>Name : {user.name}</h1>
          <h1>Email : {user.email}</h1>
          <h1>
            CreatedAt :{" "}
            {moment(user.createdAt).format("MMMM Do YYYY, hh:mm:ss a")}
          </h1>
          {image && (
            <img
              src={image}
              alt="profile pic"
              className="w-32 h-32 rounded-full"
            />
          )}

          <div className="flex gap-2">
            <label
              htmlFor="file-input"
              className="cursor-pointer text-lg font-semibold"
            >
              Update Profile Pic
            </label>
            <input
              type="file"
              onChange={onFileSelect}
              className="file-input border-0"
              id="file-input"
            />
            <button
              className="contained-btn rounded-md"
              onClick={updateProfilePic}
            >
              update
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default Profile;
