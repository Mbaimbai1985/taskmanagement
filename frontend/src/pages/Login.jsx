import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ApiService from "../api/ApiService"


const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("please fill in all fields")
            return;
        }

        try {
            const res = await ApiService.loginUser(formData);
            if (res.statusCode === 200) {
                ApiService.saveToken(res.data)
                navigate("/tasks")
            } else {
                setError(res.message || "Login not successful")
            }

        } catch (error) {
            setError(error.response?.data?.message || error.message)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password" />
                    </div>
                    <button type="submit" className="auth-button">
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    )
}

export default Login;