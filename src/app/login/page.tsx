"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "@/lib/features/auth/authApi";
import { useAppDispatch } from "@/lib/store";
import { setCredentials } from "@/lib/features/auth/authSlice";
import styles from "./login.module.css";

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD";

function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'REGISTER' : 'LOGIN';

  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (mode === "LOGIN") {
        const response = await login({ email, password }).unwrap();
        if (response.success) {
          dispatch(setCredentials({ businessId: response.business?.id ?? '' }));
          router.push("/dashboard");
        }
      } else if (mode === "REGISTER") {
        const response = await register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          business_name: businessName,
          phone: phone || undefined,
        }).unwrap();
        
        if (response.success) {
          dispatch(setCredentials({ businessId: response.business?.id ?? '' }));
          router.push("/dashboard");
        }
      } else {
        // Handle forgot password mock
        setErrorMsg("Forgot password not implemented yet.");
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.data?.error || "An error occurred");
    }
  };

  const isLoading = isLoginLoading || isRegisterLoading;

  return (
    <div className={styles.container}>
      {/* Animated background shapes */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.glassCard}>
        <div className={styles.logo}>
          <Image
            src="/logos/vendora_logo_trans_background.png"
            alt="Vendora Logo"
            width={200}
            height={60}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        <div className={styles.header}>
          {mode === "LOGIN" && (
            <>
              <h1>Welcome Back</h1>
              <p>Enter your details to access your account.</p>
            </>
          )}
          {mode === "REGISTER" && (
            <>
              <h1>Create Business Account</h1>
              <p>Join Vendora and grow your business today.</p>
            </>
          )}
          {mode === "FORGOT_PASSWORD" && (
            <>
              <h1>Reset Password</h1>
              <p>Enter your email to receive reset instructions.</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div key={mode} className={styles.fadeEnter}>
            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
            
            {/* Common fields (Email) */}
            <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Register specific fields */}
            {mode === "REGISTER" && (
              <>
                <div className={styles.row} style={{ marginBottom: "20px" }}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      className={styles.input}
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      className={styles.input}
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    id="businessName"
                    type="text"
                    className={styles.input}
                    placeholder="Acme Corp"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    className={styles.input}
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Password field for Login & Register */}
            {(mode === "LOGIN" || mode === "REGISTER") && (
              <div className={styles.inputGroup} style={{ marginBottom: "8px" }}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "REGISTER" ? 8 : undefined}
                />
              </div>
            )}

            {/* Forgot Password Link only for Login */}
            {mode === "LOGIN" && (
              <div className={styles.options} style={{ marginBottom: "20px" }}>
                <span></span>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => setMode("FORGOT_PASSWORD")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Forgot Password doesn't have password field, so add margin to email if needed, but it's handled above */}
            {mode === "FORGOT_PASSWORD" && <div style={{ height: "20px" }}></div>}

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Please wait..." : (
                <>
                  {mode === "LOGIN" && "Sign In"}
                  {mode === "REGISTER" && "Create Account"}
                  {mode === "FORGOT_PASSWORD" && "Send Reset Link"}
                </>
              )}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          {mode === "LOGIN" && (
            <p>
              Don't have an account?{" "}
              <span onClick={() => setMode("REGISTER")}>Register your business</span>
            </p>
          )}
          {mode === "REGISTER" && (
            <p>
              Already have an account?{" "}
              <span onClick={() => setMode("LOGIN")}>Sign in instead</span>
            </p>
          )}
          {mode === "FORGOT_PASSWORD" && (
            <p>
              Remember your password?{" "}
              <span onClick={() => setMode("LOGIN")}>Back to login</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
