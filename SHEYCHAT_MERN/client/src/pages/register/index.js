import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../../apiCalls/users";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { BsChatDots } from "react-icons/bs";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errMessage, setErrMessage] = useState("");

  const register = async () => {
    try {
      dispatch(ShowLoader());
      const response = await RegisterUser(user);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
      } else {
        setErrMessage(response.message);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  return (
    <div className="h-screen bg-primary flex justify-center items-center">
      <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
        <div className="flex gap-2">
          <BsChatDots className="text-3xl text-primary" />
          <h1 className="text-2xl uppercase font-semibold text-primary">
            SheyChat Register
          </h1>
        </div>

        <hr />
        <input
          type="text"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Enter your Name"
        />
        <input
          type="text"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Enter your password"
        />
        <p className="text-sm text-red-500" timeout={1300}>{errMessage}</p>
        <button
          className={
            user.email && user.password ? "contained-btn" : "disabled-btn"
          }
          onClick={register}
        >
          Register
        </button>

        <Link to="/login" className="underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
