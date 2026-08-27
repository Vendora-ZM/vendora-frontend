"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAcceptInvitationMutation,
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
} from "@/lib/features/auth/authApi";
import { BUSINESS_CATEGORIES, BUSINESS_HIGHLIGHTS, getBusinessCategory } from "@/lib/business/businessTypes";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/store";
import styles from "./login.module.css";

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD" | "RESET_PASSWORD" | "ACCEPT_INVITE";

const AUTH_COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  LOGIN: {
    title: "Sign in to your workspace",
    subtitle: "Welcome back. Check in on your business in seconds.",
  },
  REGISTER: {
    title: "Start your Vendora journey",
    subtitle: "Set up your workspace and get selling fast.",
  },
  FORGOT_PASSWORD: {
    title: "Reset password",
    subtitle: "Enter your email to get a reset link.",
  },
  RESET_PASSWORD: {
    title: "Choose a new password",
    subtitle: "Create a fresh password for your account.",
  },
  ACCEPT_INVITE: {
    title: "Join your workspace",
    subtitle: "Create your password to accept the invite.",
  },
};

function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? "";
  const inviteEmail = searchParams.get("email") ?? "";
  const invitePromoCode = searchParams.get("promo_code") ?? "";
  const loginBusinessId = searchParams.get("business_id") ?? "";
  const resetToken = searchParams.get("reset") ?? "";
  const initialMode: AuthMode = inviteToken
    ? "ACCEPT_INVITE"
    : resetToken
      ? "RESET_PASSWORD"
      : searchParams.get("mode") === "register"
        ? "REGISTER"
        : "LOGIN";

  const [mode, setMode] = useState<AuthMode>(() => initialMode);
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
  const [successMsg, setSuccessMsg] = useState("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [acceptInvitation, { isLoading: isAcceptingInvitation }] = useAcceptInvitationMutation();
  const [forgotPassword, { isLoading: isSendingResetLink }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const isLoading = isLoginLoading || isRegisterLoading || isAcceptingInvitation || isSendingResetLink || isResettingPassword;
  const selectedCategory = getBusinessCategory(businessCategory);
  const selectedHighlights = BUSINESS_HIGHLIGHTS[selectedCategory.value] ?? BUSINESS_HIGHLIGHTS.other;
  const headerCopy = AUTH_COPY[mode];

  const footerPrompt = useMemo(() => {
    switch (mode) {
      case "LOGIN":
        return { label: "Don't have an account?", action: "Register your business", nextMode: "REGISTER" as const };
      case "REGISTER":
        return { label: "Already have an account?", action: "Sign in instead", nextMode: "LOGIN" as const };
      case "ACCEPT_INVITE":
        return { label: "Want to use a different account?", action: "Back to login", nextMode: "LOGIN" as const };
      case "FORGOT_PASSWORD":
        return { label: "Remember your password?", action: "Back to login", nextMode: "LOGIN" as const };
      case "RESET_PASSWORD":
        return { label: "Have a new reset link?", action: "Request another", nextMode: "FORGOT_PASSWORD" as const };
      default:
        return null;
    }
  }, [mode]);

  const handleBusinessCategoryChange = (value: string) => {
    const nextCategory = getBusinessCategory(value);
    setBusinessCategory(nextCategory.value);
    setBusinessType(nextCategory.types[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "LOGIN") {
        const response = await login({ email, password, business_id: loginBusinessId || undefined }).unwrap();
        if (response.success) {
          dispatch(setCredentials({
            businessId: response.business?.id ?? "",
            permissions: response.business?.permissions ?? [],
          }));
          router.push("/dashboard");
        }
        return;
      }

      if (mode === "REGISTER") {
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
            businessId: response.business?.id ?? "",
            permissions: response.business?.permissions ?? [],
            businessName,
            userName: `${firstName} ${lastName}`.trim(),
            email,
          }));
          router.push("/dashboard");
        }
        return;
      }

      if (mode === "ACCEPT_INVITE") {
        if (password !== passwordConfirm) {
          setErrorMsg("Passwords do not match.");
          return;
        }

        const accepted = await acceptInvitation({ email, token: inviteToken, password }).unwrap();
        const response = await login({
          email,
          password,
          business_id: accepted.business_id || loginBusinessId || undefined,
        }).unwrap();

        if (response.success) {
          dispatch(setCredentials({
            businessId: response.business?.id ?? "",
            permissions: response.business?.permissions ?? [],
            email,
          }));
          router.push("/dashboard");
        }
        return;
      }

      if (mode === "FORGOT_PASSWORD") {
        const response = await forgotPassword({ email }).unwrap();
        setSuccessMsg(response.message || "If an account exists for that email, a reset link has been sent.");
        return;
      }

      if (password !== passwordConfirm) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      if (!resetToken) {
        setErrorMsg("Reset token is missing. Please request a new password reset link.");
        return;
      }

      const response = await resetPassword({ token: resetToken, new_password: password }).unwrap();
      setPassword("");
      setPasswordConfirm("");
      setMode("LOGIN");
      setSuccessMsg(response.message || "Password reset successfully. Please sign in with your new password.");
    } catch (err: unknown) {
      const error = err as {
        data?: { message?: string; error?: string };
        message?: string;
      };
      setErrorMsg(error.data?.message || error.data?.error || error.message || "An error occurred");
    }
  };

  const renderPasswordField = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    confirm,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    confirm?: boolean;
  }) => (
    <div className={styles.inputGroup}>
      <label htmlFor={id}>{label}</label>
      {confirm ? (
        <input
          id={id}
          type="password"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
        />
      ) : (
        <div className={styles.passwordField}>
          <input
            id={id}
            type={showPassword ? "text" : "password"}
            className={styles.input}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
      )}
    </div>
  );

  return (
    <div className={styles.container}>
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
          <h1>{headerCopy.title}</h1>
          <p>{headerCopy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div key={mode} className={styles.fadeEnter}>
            {errorMsg ? <div className={styles.errorAlert}>{errorMsg}</div> : null}
            {successMsg ? <div className={styles.successAlert}>{successMsg}</div> : null}

            <div className={styles.inputStack}>
              {mode !== "ACCEPT_INVITE" ? (
                <div className={styles.inputGroup}>
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
              ) : null}

              {mode === "REGISTER" ? (
                <>
                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="firstName">First Name</label>
                      <input id="firstName" type="text" className={styles.input} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="lastName">Last Name</label>
                      <input id="lastName" type="text" className={styles.input} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="businessName">Business Name</label>
                    <input id="businessName" type="text" className={styles.input} placeholder="Acme Corp" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="businessCategory">Business Category</label>
                      <select id="businessCategory" className={styles.input} value={businessCategory} onChange={(e) => handleBusinessCategoryChange(e.target.value)} required>
                        {BUSINESS_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="businessType">Business Type</label>
                      <select id="businessType" className={styles.input} value={businessType} onChange={(e) => setBusinessType(e.target.value)} required>
                        {selectedCategory.types.map((type) => (
                          <option key={type} value={type}>{type}</option>
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
                        <span key={pill} className={styles.selectorSummaryPill}>{pill}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="promoCode">Promo Code (Optional)</label>
                    <input id="promoCode" type="text" className={styles.input} placeholder="INVITE-1234" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    <p className={styles.fieldHint}>Use an invite or promo code if you have one.</p>
                  </div>

                  <div className={styles.row}>
                    {renderPasswordField({
                      id: "registerPassword",
                      label: "Password",
                      value: password,
                      onChange: setPassword,
                      placeholder: "••••••••",
                    })}
                    {renderPasswordField({
                      id: "confirmRegisterPassword",
                      label: "Confirm Password",
                      value: passwordConfirm,
                      onChange: setPasswordConfirm,
                      placeholder: "Re-enter password",
                      confirm: true,
                    })}
                  </div>

                  <label className={styles.consentRow} htmlFor="acceptTerms">
                    <input id="acceptTerms" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className={styles.consentInput} />
                    <span className={styles.consentText}>
                      By creating an account, I agree to the <Link href="/terms" className={styles.legalLink}>Terms and Conditions</Link> and <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>.
                    </span>
                  </label>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input id="phone" type="tel" className={styles.input} placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </>
              ) : null}

              {mode === "ACCEPT_INVITE" ? (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="inviteEmail">Email Address</label>
                    <input id="inviteEmail" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  {renderPasswordField({
                    id: "invitePassword",
                    label: "Create Password",
                    value: password,
                    onChange: setPassword,
                    placeholder: "••••••••",
                  })}
                  {renderPasswordField({
                    id: "invitePasswordConfirm",
                    label: "Confirm Password",
                    value: passwordConfirm,
                    onChange: setPasswordConfirm,
                    placeholder: "••••••••",
                    confirm: true,
                  })}
                </>
              ) : null}

              {mode === "RESET_PASSWORD" ? (
                <>
                  {renderPasswordField({
                    id: "resetPassword",
                    label: "New Password",
                    value: password,
                    onChange: setPassword,
                    placeholder: "••••••••",
                  })}
                  {renderPasswordField({
                    id: "resetPasswordConfirm",
                    label: "Confirm New Password",
                    value: passwordConfirm,
                    onChange: setPasswordConfirm,
                    placeholder: "Re-enter password",
                    confirm: true,
                  })}
                </>
              ) : null}

              {mode === "LOGIN" ? (
                <>
                  {renderPasswordField({
                    id: "password",
                    label: "Password",
                    value: password,
                    onChange: setPassword,
                    placeholder: "••••••••",
                  })}
                  <div className={styles.options}>
                    <span></span>
                    <button type="button" className={styles.link} onClick={() => setMode("FORGOT_PASSWORD")}>
                      Forgot password?
                    </button>
                  </div>
                </>
              ) : null}

              {mode === "FORGOT_PASSWORD" ? <div className={styles.formSpacer}></div> : null}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Please wait..." : mode === "LOGIN"
                ? "Sign In"
                : mode === "REGISTER"
                  ? "Create Account"
                  : mode === "FORGOT_PASSWORD"
                    ? "Send Reset Link"
                    : mode === "RESET_PASSWORD"
                      ? "Reset Password"
                      : "Accept Invite"}
            </button>
          </div>
        </form>

        {footerPrompt ? (
          <div className={styles.footer}>
            <p>
              {footerPrompt.label} <span onClick={() => setMode(footerPrompt.nextMode)}>{footerPrompt.action}</span>
            </p>
          </div>
        ) : null}
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

