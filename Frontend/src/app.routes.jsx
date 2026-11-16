import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Landing from "./features/landing/pages/Landing";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";


export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/app",
        element: <Home />
    },
    {
        path:"/interview/:interviewId",
        element: <Interview />
    }
])