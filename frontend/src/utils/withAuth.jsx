import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import server from "../environment";

const client = axios.create({
    baseURL: `${server}api/v1/users`,
    withCredentials: true  // Include cookies in requests
})

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        const checkAuthentication = async () => {
            try {
                // Make a request to check if the user is authenticated
                const response = await client.get("/validateSession");
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setIsAuthenticated(false);
                router("/auth");
            }
        }

        useEffect(() => {
            checkAuthentication();
        }, []);

        if (!isAuthenticated) return null; // Or add a loading spinner
        return <WrappedComponent {...props} />;
    }
    return AuthComponent;
}

export default withAuth;
