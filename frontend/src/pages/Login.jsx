import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const data = await login(
        formData.email,
        formData.password,
      );

      if (!data.success) {
        throw new Error(
          data.message || 'Login failed.',
        );
      }

      const role = data.user?.role;

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'trader') {
        navigate('/trader');
      } else {
        navigate('/dashboard');
      }
    } catch (loginError) {
      setError(
        loginError.message ||
          'Unable to login. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-shape login-shape-one" />
      <div className="login-background-shape login-shape-two" />

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Leaf size={26} strokeWidth={2.2} />
          </div>

          <div>
            <h1>KrishiBandhu</h1>
            <p>Smart farming platform</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back 👋</h2>

            <p>
              Login to continue to your KrishiBandhu
              account.
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="login-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">
                <Lock size={19} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous,
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-register">
            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>
          </div>
        </div>

        <p className="login-footer">
          © {new Date().getFullYear()} KrishiBandhu
        </p>
      </div>
    </div>
  );
};

export default Login;