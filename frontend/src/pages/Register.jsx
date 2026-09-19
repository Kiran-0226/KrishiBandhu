import React, { useState } from 'react';

import {
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Sprout,
  Store,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [role, setRole] = useState('farmer');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    district: '',
    state: '',
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE ROLE
  // ==========================================

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    // Required fields
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError(
        'Please fill in all required fields.',
      );

      return;
    }

    // Password
    if (formData.password.length < 6) {
      setError(
        'Password must contain at least 6 characters.',
      );

      return;
    }

    // Phone
    const cleanPhone =
      formData.phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      setError(
        'Please enter a valid phone number.',
      );

      return;
    }

    try {
      setLoading(true);

      const data = await register({
        name: formData.name.trim(),

        email: formData.email
          .trim()
          .toLowerCase(),

        phone: cleanPhone,

        password: formData.password,

        role,

        location: {
          city: formData.city.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
        },
      });

      if (!data.success) {
        throw new Error(
          data.message ||
            'Registration failed.',
        );
      }

      // ======================================
      // REDIRECT BASED ON ROLE
      // ======================================

      if (data.user?.role === 'trader') {
        navigate('/trader', {
          replace: true,
        });
      } else {
        navigate('/dashboard', {
          replace: true,
        });
      }
    } catch (registrationError) {
      setError(
        registrationError.message ||
          'Unable to create your account.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div className="register-background-shape register-shape-one" />

      <div className="register-background-shape register-shape-two" />

      <div className="register-container">

        {/* ====================================
            BRAND
        ==================================== */}

        <div className="register-brand">

          <div className="register-brand-icon">
            <Leaf
              size={26}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h1>
              KrishiBandhu
            </h1>

            <p>
              Smart farming platform
            </p>
          </div>

        </div>

        {/* ====================================
            CARD
        ==================================== */}

        <div className="register-card">

          <div className="register-header">

            <h2>
              Create your account 🌱
            </h2>

            <p>
              Join KrishiBandhu and connect
              with the agricultural marketplace.
            </p>

          </div>

          {/* ==================================
              ERROR
          ================================== */}

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          {/* ==================================
              ROLE
          ================================== */}

          <div className="role-section">

            <label className="role-label">
              I am a...
            </label>

            <div className="role-options">

              {/* FARMER */}

              <button
                type="button"
                className={`role-option ${
                  role === 'farmer'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleRoleChange(
                    'farmer',
                  )
                }
              >

                <div className="role-icon">
                  <Sprout size={22} />
                </div>

                <div className="role-content">

                  <strong>
                    Farmer
                  </strong>

                  <span>
                    Sell crops and track
                    agricultural transactions
                  </span>

                </div>

                <div className="role-radio">

                  {role === 'farmer' && (
                    <div />
                  )}

                </div>

              </button>

              {/* TRADER */}

              <button
                type="button"
                className={`role-option ${
                  role === 'trader'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleRoleChange(
                    'trader',
                  )
                }
              >

                <div className="role-icon">
                  <Store size={22} />
                </div>

                <div className="role-content">

                  <strong>
                    Trader
                  </strong>

                  <span>
                    Find crops, place bids
                    and purchase produce
                  </span>

                </div>

                <div className="role-radio">

                  {role === 'trader' && (
                    <div />
                  )}

                </div>

              </button>

            </div>

          </div>

          {/* ==================================
              FORM
          ================================== */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="register-input-wrapper">

                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <Mail size={18} />

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

            {/* PHONE */}

            <div className="register-field">

              <label htmlFor="phone">
                Phone number
              </label>

              <div className="register-input-wrapper">

                <Phone size={18} />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  maxLength="15"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous,
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

              <small>
                Minimum 6 characters
              </small>

            </div>

            {/* =================================
                LOCATION
            ================================= */}

            <div className="location-heading">

              <MapPin size={17} />

              <span>
                Location
              </span>

              <small>
                Optional
              </small>

            </div>

            <div className="location-grid">

              {/* CITY */}

              <div className="register-field">

                <label htmlFor="city">
                  City
                </label>

                <input
                  className="location-input"
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />

              </div>

              {/* DISTRICT */}

              <div className="register-field">

                <label htmlFor="district">
                  District
                </label>

                <input
                  className="location-input"
                  id="district"
                  name="district"
                  type="text"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* STATE */}

            <div className="register-field">

              <label htmlFor="state">
                State
              </label>

              <input
                className="location-input"
                id="state"
                name="state"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
              />

            </div>

            {/* =================================
                SUBMIT
            ================================= */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create Account'}
            </button>

          </form>

          {/* ==================================
              LOGIN
          ================================== */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

        {/* FOOTER */}

        <p className="register-footer">
          © {new Date().getFullYear()}{' '}
          KrishiBandhu
        </p>

      </div>

    </div>
  );
};

export default Register;