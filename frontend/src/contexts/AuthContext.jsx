import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users",
    withCredentials: true
})

export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const navigate = useNavigate();

    const handleRegister = async(name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name, 
                username: username,
                password: password
            })

            if(request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }
    const handleLogin = async(username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password)
            console.log(request.data)

            if(request.status === httpStatus.OK) {
                navigate("/home");
            }
        }catch(e){
            throw e;
        }
    }

    const getHistoryOfUser = async() => {
        try {
            let req = await client.get("/getAllActivity");
            return req.data;
        }catch(e) {
            throw e;
        }
    }

    const addToUserHistory = async(meetingCode) => {
        try {
            let req = await client.post("/addActivity", {
                meeting_code: meetingCode
            })
            return req;
        }catch(e) {
            throw e;
        }
    }
    const data = {
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin
    }
    return (
        <AuthContext.Provider value={data}>{children}</AuthContext.Provider>
    )
}