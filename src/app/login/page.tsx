"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAcceptInvitationMutation, useLoginMutation, useRegisterMutation } from "@/lib/features/auth/authApi";
import { BUSINESS_CATEGORIES, BUSINESS_HIGHLIGHTS, getBusinessCategory } from "@/lib/business/businessTypes";
import { useAppDispatch } from "@/lib/store";
import { setCredentials } from "@/lib/features/auth/authSlice";
import styles from "./login.module.css";

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD" | "ACCEPT_INVITE";

function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? '';
  const inviteEmail = searchParams.get('email') ?? '';
  const invitePromoCode = searchParams.get('promo_code') ?? '';
  const initialMode: AuthMode = inviteToken
    ? 'ACCEPT_INVITE'
    : searchParams.get('mode') === 'register'
      ? 'REGISTER'
      : 'LOGIN';

  const [mode, setMode] = useState<AuthMode>(() => initialMode);

  // Form states
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0].value);
  const [businessType, setBusinessType] = useState(BUSINESS_CATEGORIES[0].types[0]);
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState(invitePromoCode);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [acceptInvitation, { isLoading: isAcceptingInvitation }] = useAcceptInvitationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (mode === "LOGIN") {
        const response = await login({ email, password }).unwrap();
        if (response.success) {
          dispatch(setCredentials({
            businessId: response.business?.id ?? '',
            permissions: response.business?.permissions ?? [],
          }));
          router.push("/dashboard");
        }
      } else if (mode === "REGISTER") {
        if (password !== passwordConfirm) {
          setErrorMsg("Passwords do not match.");
          return;
        }

        if (!acceptTerms) {
          setErrorMsg("Please accept the Terms and Conditions to continue.");
          return;
        }

        const response = await register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          business_name: businessName,
          business_category: businessCategory,
          business_type: businessType,
          phone: phone || undefined,
          promo_code: promoCode.trim() || undefined,
        }).unwrap();
        
        if (response.success) {
          dispatch(setCredentials({
            businessId: response.business?.id ?? '',
            permissions: response.business?.permissions ?? [],
            businessName,
            userName: `${firstName} ${lastName}`.trim(),
            email,
          }));
          router.push("/dashboard");
        }
      } else if (mode === "ACCEPT_INVITE") {
        if (password !== passwordConfirm) {
          setErrorMsg("Passwords do not match.");
          return;
        }

        await acceptInvitation({ email, token: inviteToken, password }).unwrap();
        const response = await login({ email, password }).unwrap();
        if (response.success) {
          dispatch(setCredentials({
            businessId: response.business?.id ?? '',
            permissions: response.business?.permissions ?? [],
            email,
          }));
          router.push("/dashboard");
        }
      } else {
        // Handle forgot password mock
        setErrorMsg("Forgot password not implemented yet.");
      }
    } catch (err: unknown) {
      const error = err as {
        data?: { message?: string; error?: string };
        message?: string;
      };
      const msg =
        error.data?.message ||
        error.data?.error ||
        error.message ||
        "An error occurred";
      setErrorMsg(msg);
    }
  };

  const isLoading = isLoginLoading || isRegisterLoading || isAcceptingInvitation;
  const selectedCategory = getBusinessCategory(businessCategory);
  const selectedHighlights = BUSINESS_HIGHLIGHTS[selectedCategory.value] ?? BUSINESS_HIGHLIGHTS.other;

  const handleBusinessCategoryChange = (value: string) => {
    const nextCategory = getBusinessCategory(value);
    setBusinessCategory(nextCategory.value);
    setBusinessType(nextCategory.types[0]);
  };

  return (
    <div className={styles.container}>
      {/* Animated background shapes */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.topNav} aria-label="Public navigation">
        <Link href="/" className={styles.topNavLink}>Home</Link>
        <Link href="/#features" className={styles.topNavLink}>Features</Link>
        <Link href="/#pricing" className={styles.topNavLink}>Pricing</Link>
        <Link href="/signup" className={styles.topNavLink}>Sign up</Link>
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

                <div className={styles.row} style={{ marginBottom: "20px" }}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="businessCategory">Business Category</label>
                    <select
                      id="businessCategory"
                      className={styles.input}
                      value={businessCategory}
                      onChange={(e) => handleBusinessCategoryChange(e.target.value)}
                      required
                    >
                      {BUSINESS_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="businessType">Business Type</label>
                    <select
                      id="businessType"
                      className={styles.input}
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      required
                    >
                      {selectedCategory.types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.selectorSummary}>
                  <div className={styles.selectorSummaryCopy}>
                    <span className={styles.selectorSummaryLabel}>Recommended for</span>
                    <strong>{selectedCategory.description}</strong>
                  </div>
                  <div className={styles.selectorSummaryPills}>
                    {selectedHighlights.map((pill) => (
                      <span key={pill} className={styles.selectorSummaryPill}>
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                  <label htmlFor="promoCode">Promo Code (Optional)</label>
                  <input
                    id="promoCode"
                    type="text"
                    className={styles.input}
                    placeholder="INVITE-1234"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <p className={styles.fieldHint}>
                    If someone invited you to Vendora, enter the code they shared here.
                  </p>
                </div>

                <div className={styles.row} style={{ marginBottom: "20px" }}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="registerPassword">Password</label>
                    <div className={styles.passwordField}>
                      <input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        className={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3.98 8.223 2.707 6.95 4.12 5.536l2.022 2.022A11.2 11.2 0 0 1 12 6c5.5 0 9.5 4.5 10.3 6-.42.79-1.5 2.33-3.16 3.79l1.88 1.88-1.414 1.414-2.03-2.03A11.2 11.2 0 0 1 12 18c-5.5 0-9.5-4.5-10.3-6 .47-.9 1.8-2.76 4.28-3.78ZM8.5 11.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Zm2 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                            <path d="M20.707 3.293 3.293 20.707 1.879 19.293 19.293 1.879l1.414 1.414Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M12 6c5.5 0 9.5 4.5 10.3 6-.8 1.5-4.8 6-10.3 6S2.5 13.5 1.7 12C2.5 10.5 6.5 6 12 6Zm0 2C8.3 8 5.1 10.8 4 12c1.1 1.2 4.3 4 8 4s6.9-2.8 8-4c-1.1-1.2-4.3-4-8-4Zm0 1.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="confirmRegisterPassword">Confirm Password</label>
                    <input
                      id="confirmRegisterPassword"
                      type="password"
                      className={styles.input}
                      placeholder="Re-enter password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <label className={styles.consentRow} htmlFor="acceptTerms">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className={styles.consentInput}
                  />
                  <span className={styles.consentText}>
                    By creating an account, I agree to the{' '}
                    <Link href="/terms" className={styles.legalLink}>
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className={styles.legalLink}>
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

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
          
          {mode === "ACCEPT_INVITE" && (
            <>
              <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                <label htmlFor="inviteEmail">Email Address</label>
                <input
                  id="inviteEmail"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                <label htmlFor="invitePassword">Create Password</label>
                <div className={styles.passwordField}>
                  <input
                    id="invitePassword"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M3.98 8.223 2.707 6.95 4.12 5.536l2.022 2.022A11.2 11.2 0 0 1 12 6c5.5 0 9.5 4.5 10.3 6-.42.79-1.5 2.33-3.16 3.79l1.88 1.88-1.414 1.414-2.03-2.03A11.2 11.2 0 0 1 12 18c-5.5 0-9.5-4.5-10.3-6 .47-.9 1.8-2.76 4.28-3.78ZM8.5 11.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Zm2 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                        <path d="M20.707 3.293 3.293 20.707 1.879 19.293 19.293 1.879l1.414 1.414Z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M12 6c5.5 0 9.5 4.5 10.3 6-.8 1.5-4.8 6-10.3 6S2.5 13.5 1.7 12C2.5 10.5 6.5 6 12 6Zm0 2C8.3 8 5.1 10.8 4 12c1.1 1.2 4.3 4 8 4s6.9-2.8 8-4c-1.1-1.2-4.3-4-8-4Zm0 1.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: "20px" }}>
                <label htmlFor="invitePasswordConfirm">Confirm Password</label>
                <input
                  id="invitePasswordConfirm"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            </>
          )}

            {/* Password field for Login */}
            {mode === "LOGIN" && (
              <div className={styles.inputGroup} style={{ marginBottom: "8px" }}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordField}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M3.98 8.223 2.707 6.95 4.12 5.536l2.022 2.022A11.2 11.2 0 0 1 12 6c5.5 0 9.5 4.5 10.3 6-.42.79-1.5 2.33-3.16 3.79l1.88 1.88-1.414 1.414-2.03-2.03A11.2 11.2 0 0 1 12 18c-5.5 0-9.5-4.5-10.3-6 .47-.9 1.8-2.76 4.28-3.78ZM8.5 11.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Zm2 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                        <path d="M20.707 3.293 3.293 20.707 1.879 19.293 19.293 1.879l1.414 1.414Z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M12 6c5.5 0 9.5 4.5 10.3 6-.8 1.5-4.8 6-10.3 6S2.5 13.5 1.7 12C2.5 10.5 6.5 6 12 6Zm0 2C8.3 8 5.1 10.8 4 12c1.1 1.2 4.3 4 8 4s6.9-2.8 8-4c-1.1-1.2-4.3-4-8-4Zm0 1.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                Don&apos;t have an account?{" "}
                <span onClick={() => setMode("REGISTER")}>Register your business</span>
              </p>
          )}
          {mode === "REGISTER" && (
            <p>
              Already have an account?{" "}
              <span onClick={() => setMode("LOGIN")}>Sign in instead</span>
            </p>
          )}
          {mode === "ACCEPT_INVITE" && (
            <p>
              Want to use a different account?{" "}
              <span onClick={() => setMode("LOGIN")}>Back to login</span>
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
