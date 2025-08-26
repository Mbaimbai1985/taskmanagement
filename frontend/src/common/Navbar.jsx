import React, { useState, useEffect } from "react";
import {Link,  useNavigate } from "react-router-dom";
import ApiService from "../api/ApiService"

const Navbar = () => {
    const isAuthenticated = ApiService.isAthenticated();
    const navigate = useNavigate()
    const [userInfo, setUserInfo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserInfo();
        }
    }, [isAuthenticated]);
    
    const fetchUserInfo = async () => {
        try {
            const currentUser = await ApiService.getCurrentUser();
            setUserInfo(currentUser);
            const adminStatus = await ApiService.isAdmin();
            setIsAdmin(adminStatus);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const handleLogout = () => {
        const isLogout = window.confirm("Are you sure you want to logout?")
        if (isLogout) {
            ApiService.logout();
            navigate("/login")
        }
    }


    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/" className="logo-link">
                    TaskManager App
                </Link>
            </div>

            <div className="desktop-nav">
                {isAuthenticated ? (
                    <>
                        <Link to="/tasks" className="nav-link">My Tasks</Link>
                        {isAdmin && (
                            <Link to="/admin/tasks" className="nav-link admin-link">All Tasks</Link>
                        )}
                        <div className="user-info">
                            <span className="user-role">{userInfo?.role || 'USER'}</span>
                            <span className="user-name">{userInfo?.username || 'User'}</span>
                        </div>
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