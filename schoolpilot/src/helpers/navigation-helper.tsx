import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/index';
// import { useAuth } from '../context/authContext';

const NavigationHandler = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/authentication/login');
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/authentication/login');
    };

    return (
        <>
            {children}
            {/* Example button for logout */}
            {/* <button onClick={handleLogout}>Logout</button> */}
        </>
    );
};

export default NavigationHandler;
