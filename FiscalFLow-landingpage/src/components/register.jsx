import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'
import { setToken } from '../auth/auth'
import { registerUser } from '../api/client'

const RegisterPage = () => {
  // 1. Setup state to handle the form data
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await registerUser(formData)
      setToken(result.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-[#F8F9FA] flex items-center justify-center overflow-hidden fixed inset-0">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Get Started</h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">User Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 mt-2">
            <ShieldCheck className="text-blue-600 mt-0.5" size={18} />
            <p className="text-[11px] text-blue-800 leading-tight">
              By registering, you agree to our 256-bit Bank-Grade Security protocols and Privacy Policy.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 mt-4 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
          {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
        </form>

        <p className="text-center mt-8 text-sm text-slate-500">
          Already a member?
          {/* FIXED: Changed text-white to text-blue-600 so it is visible against the white background */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold ml-1 hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
};

export default RegisterPage