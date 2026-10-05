'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  User,
  Phone,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { apiGetRegisteredGuides } from '@/lib/supabaseService';

export default function SignupView() {
  const { setScreen, signUp, isLiveBackend } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Role: Folk Boy vs Folk Guide
  const [role, setRole] = useState<'folk_boy' | 'folk_guide'>('folk_boy');
  const [guidePasscode, setGuidePasscode] = useState('');
  const [guidePasscodeError, setGuidePasscodeError] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Guides from Supabase
  const [registeredGuides, setRegisteredGuides] = useState<{ id: string; name: string }[]>([]);
  const [selectedGuide, setSelectedGuide] = useState('');

  // Load real registered guides from Supabase
  useEffect(() => {
    if (typeof apiGetRegisteredGuides === 'function') {
      apiGetRegisteredGuides()
        .then(({ data }) => {
          if (data && data.length > 0) {
            setRegisteredGuides(data);
            setSelectedGuide(data[0].name);
          }
        })
        .catch(() => {});
    }

    if (typeof window !== 'undefined') {
      const prefillRaw = sessionStorage.getItem('folk_prefill_signup') || '';
      if (prefillRaw) {
        try {
          const parsed = JSON.parse(prefillRaw);
          if (parsed.identifier) {
            if (parsed.identifier.includes('@')) {
              setEmail(parsed.identifier);
            } else {
              setPhone(parsed.identifier.replace(/\D/g, '').slice(0, 10));
            }
          }
          if (parsed.role) {
            setRole(parsed.role);
          }
        } catch {
          if (prefillRaw.includes('@')) {
            setEmail(prefillRaw);
          } else {
            setPhone(prefillRaw.replace(/\D/g, '').slice(0, 10));
          }
        }
        sessionStorage.removeItem('folk_prefill_signup');
      }
    }
  }, []);

  // Phone 10-digit validation check
  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.length > 10 && cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
    cleaned = cleaned.slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const expectedPasscode = process.env.NEXT_PUBLIC_GUIDE_SECRET_PASSCODE || 'FOLK@GUIDE108';

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (step === 1) {
      if (phone.length !== 10) {
        setPhoneError('Please enter a valid 10-digit mobile number');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      setPasswordError('');
      setStep(3);
      return;
    }

    if (step === 3) {
      // Guide verification passcode check
      if (role === 'folk_guide') {
        if (!guidePasscode.trim()) {
          setGuidePasscodeError('Guide security code is required');
          return;
        }
        if (guidePasscode.trim() !== expectedPasscode) {
          setGuidePasscodeError('Invalid Guide Passcode. Only authorized temple counselors can create a Guide account.');
          return;
        }
        setGuidePasscodeError('');
      } else {
        // Devotee must select a registered Guide
        if (!selectedGuide || registeredGuides.length === 0) {
          setAuthError('Your Guide must register their account first. Once they register, you can select them from the list.');
          return;
        }
      }

      setLoading(true);
      setAuthError(null);
      const userEmail = email.trim() || `${phone.trim()}@folk.org`;
      const matchedGuide = registeredGuides.find((g) => g.name === selectedGuide);

      const { error } = await signUp({
        email: userEmail,
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        role: role,
        guideName: role === 'folk_guide' ? null : selectedGuide,
        guideId: role === 'folk_guide' ? null : (matchedGuide?.id || null),
      });

      setLoading(false);
      if (error) {
        setAuthError(error.message || 'Registration failed. Please check your credentials.');
        return;
      }

      // User created and signed in
      if (typeof window !== 'undefined') {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        localStorage.setItem(`folk_phone_map_${cleanPhone}`, userEmail);
        localStorage.setItem(`folk_phone_map_${cleanPhone.slice(-10)}`, userEmail);
        localStorage.setItem('folk_last_login_identifier', userEmail);

        if (role === 'folk_guide') {
          try {
            const raw = localStorage.getItem('folk_registered_guides');
            const list = raw ? JSON.parse(raw) : [];
            if (!list.some((g: any) => g.name.toLowerCase() === fullName.trim().toLowerCase())) {
              list.push({ id: crypto.randomUUID(), name: fullName.trim() });
              localStorage.setItem('folk_registered_guides', JSON.stringify(list));
            }
          } catch {}
        }
      }

      setScreen('home');
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between p-6 select-none max-w-md mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 right-6 w-64 h-64 bg-[#E07A2B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Step Progress */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as 1 | 2 | 3) : setScreen('welcome'))}
            className="text-xs font-semibold text-[#786E65] hover:text-[#1B1917] flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-xs font-bold text-[#8C460D] bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200/50">
            Step {step} of 3
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-1.5 mb-5">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#1B1917]">
          {step === 1 && 'Account Details'}
          {step === 2 && 'Security Credentials'}
          {step === 3 && (role === 'folk_guide' ? 'Guide Authorization' : 'Select FOLK Guide')}
        </h1>
        <p className="text-xs text-[#6E665E] mt-0.5">
          {step === 1 && 'Enter your contact information'}
          {step === 2 && 'Create a secure password'}
          {step === 3 && (role === 'folk_guide' ? 'Verify your Guide passcode' : 'Connect with your Guide')}
        </p>

        {authError && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}
      </div>

      {/* Multi-step Form */}
      <form onSubmit={handleNext} className="space-y-4 my-auto py-4">
        {step === 1 && (
          <>
            {/* Role Selector: Devotee vs Guide */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Registering As
              </label>
              <div className="p-1 rounded-2xl bg-white/70 border border-white/80 shadow-xs flex gap-1">
                <button
                  type="button"
                  onClick={() => setRole('folk_boy')}
                  className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'folk_boy'
                      ? 'bg-[#E07A2B] text-white shadow-xs'
                      : 'text-[#6E665E] hover:text-[#1B1917]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Folk Boy / Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('folk_guide')}
                  className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'folk_guide'
                      ? 'bg-[#1B1917] text-white shadow-xs'
                      : 'text-[#6E665E] hover:text-[#1B1917]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>FOLK Guide</span>
                </button>
              </div>
            </div>

            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Pratik"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            {/* 3. Phone Number with 10-digit check */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-[#59534E]">
                  Mobile Number
                </label>
                <span className="text-[10px] text-[#8E867F]">
                  {phone.length}/10 digits
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  className={`w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border focus:ring-2 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs ${
                    phoneError
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-white focus:border-[#E07A2B] focus:ring-[#E07A2B]/15'
                  }`}
                />
              </div>
              {phoneError && (
                <p className="text-[11px] font-medium text-red-500 ml-1">
                  {phoneError}
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
              {passwordError && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 ml-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#7A4B1A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E07A2B] shrink-0" />
              <span>Passwords are encrypted and secured in Supabase PostgreSQL.</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {role === 'folk_guide' ? (
              // Guide Authorization Passcode verification
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C460D] mb-1">
                    <KeyRound className="w-4 h-4 text-[#E07A2B]" />
                    <span>Guide Authorization Required</span>
                  </div>
                  <p className="text-[11px] text-[#786E65] leading-relaxed">
                    Only authorized temple counselors can create a Guide account to oversee boys and monitor Sādhana. Enter the security code provided by Temple Leadership.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#59534E] ml-1">
                    Guide Passcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                      <KeyRound className="w-4 h-4 text-[#E07A2B]" />
                    </div>
                    <input
                      type="password"
                      value={guidePasscode}
                      onChange={(e) => {
                        setGuidePasscode(e.target.value);
                        setGuidePasscodeError('');
                      }}
                      placeholder="Enter secret Guide passcode"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs font-mono"
                    />
                  </div>
                  {guidePasscodeError && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 ml-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{guidePasscodeError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Devotee Guide Selection from Live Database
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#59534E] ml-1">
                  Who is your FOLK Guide?
                </label>

                {registeredGuides.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                        <Shield className="w-4 h-4 text-[#E07A2B]" />
                      </div>
                      <select
                        value={selectedGuide}
                        onChange={(e) => setSelectedGuide(e.target.value)}
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#1B1917] outline-none shadow-xs cursor-pointer focus:ring-2 focus:ring-[#E07A2B]/15"
                      >
                        {registeredGuides.map((g) => (
                          <option key={g.id} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-[#786E65] ml-1">
                      Showing authorized temple guides registered in the database.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#9C4507] shrink-0 mt-0.5" />
                      <div className="text-xs font-medium text-[#7A4B1A] leading-relaxed">
                        <span className="font-bold block text-[#9C4507] mb-0.5">No Registered Guides Yet</span>
                        Your Guide must register their account first using the Guide Passcode. Once registered, their name will appear here for you to select.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-white"
          >
            {loading ? (
              <span>Registering {role === 'folk_guide' ? 'Guide' : 'Devotee'}...</span>
            ) : step < 3 ? (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="text-center pb-6">
        <p className="text-xs text-[#6E665E]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setScreen('login')}
            className="font-bold text-[#C86315] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
