import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ApiService from "../api/ApiService"


const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (error) setError('')
        if (success) setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields")
            return;
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await ApiService.loginUser(formData);
            if (res.statusCode === 200) {
                setSuccess("Login successful! Redirecting to dashboard...")
                ApiService.saveToken(res.data)
                window.dispatchEvent(new Event('authChange'));
                setTimeout(() => {
                    navigate("/tasks")
                }, 1500)
            } else {
                setError(res.message || "Login not successful")
            }

        } catch (error) {
            setError(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email" 
                            disabled={isLoading || success} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password" 
                            disabled={isLoading || success} />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading || success}>
                        {isLoading ? 'Logging in...' : success ? 'Redirecting...' : 'Login'}
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