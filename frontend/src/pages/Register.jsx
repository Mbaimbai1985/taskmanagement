import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ApiService from "../api/ApiService"


const Register = () => {

    const [formData, setFormData] = useState({
        username: '',
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

        if (!formData.username || !formData.email || !formData.password) {
            setError("Please fill in all fields")
            return;
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await ApiService.registerUser(formData);
            if (res.statusCode === 200) {
                setSuccess("Registration successful! Redirecting to login...")
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            } else {
                setError(res.message || "Registration not successful")
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

                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username" 
                            disabled={isLoading || success} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
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
                        {isLoading ? 'Registering...' : success ? 'Redirecting...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    )
}

export default Register;