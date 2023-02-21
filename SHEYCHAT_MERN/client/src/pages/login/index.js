import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../apiCalls/users";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { BsChatDots } from "react-icons/bs";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [flag, setFlag] = useState("");

  const login = async () => {
    try {
      dispatch(ShowLoader());
      const response = await LoginUser(user);
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        localStorage.setItem("token", response.data);
        window.location.href = "/";
      } else {
        toast.error(response.message);
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
    return console.log(true);
  }, []);

  return (
    <div className="h-screen bg-primary flex justify-center items-center">
      <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
        <div className="flex gap-2">
          <BsChatDots className="text-3xl text-primary" />
          <h1 className="text-2xl uppercase font-semibold text-primary">
            SheyChat Login
          </h1>
        </div>
        <hr />
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
        <button
          className={
            user.email && user.password ? "contained-btn" : "disabled-btn"
          }
          onClick={login}
        >
          Login
        </button>

        <Link to="/register" className="underline">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
}

export default Login;
