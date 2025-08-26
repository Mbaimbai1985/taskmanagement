import React, { useState, useEffect } from "react";
import {Link,  useNavigate } from "react-router-dom";
import ApiService from "../api/ApiService"

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const getDisplayName = (username) => {
        console.log('getDisplayName called with username:', username); // Debug
        
        if (!username || username.trim() === '') {
            console.log('Username is empty, returning User');
            return 'User';
        }
        const trimmedUsername = username.trim();
        const firstName = trimmedUsername.split(' ')[0];
        console.log('Returning first name:', firstName);
        return firstName || 'User';
    };

    useEffect(() => {
        const checkAuth = async () => {
            const authStatus = ApiService.isAuthenticated();
            console.log('Navbar auth check - authenticated:', authStatus);
            setIsAuthenticated(authStatus);
            
            if (authStatus) {
                try {
                    const adminStatus = await ApiService.isAdmin();
                    setIsAdmin(adminStatus);
                    
                    const currentUser = await ApiService.getUserRole();
                    setUserInfo(currentUser);
                    console.log('Navbar auth check - user info loaded:', currentUser);
                } catch (error) {
                    console.error('Error fetching user info:', error);
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    setUserInfo(null);
                }
            } else {
                setIsAdmin(false);
                setUserInfo(null);
            }
        };

        checkAuth();
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                console.log('Token storage changed, re-checking auth');
                checkAuth();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        const handleAuthChange = () => {
            console.log('Auth change event triggered');
            checkAuth();
        };
        
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const handleLogout = () => {
        const isLogout = window.confirm("Are you sure you want to logout?");
        if (isLogout) {
            ApiService.logout();
            window.dispatchEvent(new Event('authChange'));
            
            navigate("/");
        }
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/" className="logo-link">
                    TaskManager App
                </Link>
            </div>
            <div className="nav-links">
                {isAuthenticated ? (
                    <>
                        <Link to="/tasks" className="nav-link">My Tasks</Link>
                        {isAdmin && (
                            <Link to="/admin/tasks" className="nav-link admin-link">All Tasks</Link>
                        )}
                        {userInfo ? (
                            <div className="user-info">
                                <span className="user-name">
                                    {getDisplayName(userInfo.username)}
                                </span>
                            </div>
                        ) : (
                            <div className="user-info">
                                <span className="user-name">Loading...</span>
                            </div>
                        )}
                        <button onClick={handleLogout} className="nav-button">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;