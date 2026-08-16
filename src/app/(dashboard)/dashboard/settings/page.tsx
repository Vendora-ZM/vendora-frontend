'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useLogoutMutation } from '@/lib/features/auth/authApi';
import { logout } from '@/lib/features/auth/authSlice';
import { useGetBusinessQuery, useUpdateBusinessMutation } from '@/lib/features/business/businessApi';
import { BUSINESS_CATEGORIES, BUSINESS_HIGHLIGHTS, getBusinessCategory } from '@/lib/business/businessTypes';
import {
  SALES_CHANNEL_OPTIONS,
  SALES_CHANNEL_STORAGE_PREFIX,
  getRecommendedSalesChannels,
  normalizeSalesChannels,
  type SalesChannelId,
} from '@/lib/business/salesChannels';
import {
  BILLING_PAYMENT_METHODS,
  BILLING_PLANS,
  type BillingPaymentMethodId,
  type BillingPlanId,
} from '@/lib/billing/billingStorage';
import {
  useDeleteAccountMutation,
  useGetAccountsQuery,
  type Account,
} from '@/lib/features/accounts/accountsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import styles from './page.module.css';

const currencyOptions = ['USD', 'ZMW', 'GBP', 'EUR', 'KES', 'TZS', 'UGX', 'NGN'];

const timezoneOptions = [
  'Africa/Lusaka',
  'Africa/Johannesburg',
  'Africa/Nairobi',
  'Africa/Lagos',
  'Europe/London',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

const languageOptions = ['English', 'Swahili', 'French', 'Portuguese'];
const SETTINGS_LANGUAGE_STORAGE_KEY = 'vendora.settings.language.v1';

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return languageOptions[0];
  }

  const storedLanguage = window.localStorage.getItem(SETTINGS_LANGUAGE_STORAGE_KEY);
  return storedLanguage && languageOptions.includes(storedLanguage) ? storedLanguage : languageOptions[0];
}

function getInitialSalesChannels(storageKey: string, businessCategory: string) {
  if (typeof window === 'undefined') {
    return getRecommendedSalesChannels(businessCategory);
  }

  const storedSalesChannels = window.localStorage.getItem(storageKey);
  if (storedSalesChannels) {
    try {
      return normalizeSalesChannels(JSON.parse(storedSalesChannels));
    } catch {
      // Ignore malformed local preferences and fall back to the recommended set below.
    }
  }

  return getRecommendedSalesChannels(businessCategory);
}

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number | string }).status === 401
  );
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  if ('data' in error && error.data && typeof error.data === 'object') {
    const payload = error.data as { message?: unknown; error?: unknown };
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  }

  if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
    return (error as { error: string }).error;
  }

  return null;
}

function WorkspaceProfileCard({
  businessId,
  initialName,
  initialCurrencyCode,
  initialTimezone,
  initialBusinessCategory,
  initialBusinessType,
  initialPaymentTypes,
  initialReceiptShowLogo,
  initialReceiptHeaderText,
  initialReceiptFooterText,
  initialPlanId,
  initialMethodId,
  initialApplyToAllLocations,
  initialBillingIsActive,
  trialDaysRemaining,
  trialExpiresAt,
  trialIsExpired,
  fullName,
  email,
  roleName,
  businessName,
  businessSlug,
  language,
  initial,
  currentMembershipId,
  canDeleteCurrentAccount,
  isDeletingAccount,
  onSignOut,
  onLanguageChange,
  onDeleteCurrentAccount,
}: {
  businessId: string;
  initialName: string;
  initialCurrencyCode: string;
  initialTimezone: string;
  initialBusinessCategory: string;
  initialBusinessType: string;
  initialPaymentTypes: string[];
  initialReceiptShowLogo: boolean;
  initialReceiptHeaderText: string;
  initialReceiptFooterText: string;
  initialPlanId: BillingPlanId;
  initialMethodId: BillingPaymentMethodId;
  initialApplyToAllLocations: boolean;
  initialBillingIsActive: boolean;
  trialDaysRemaining: number;
  trialExpiresAt: string;
  trialIsExpired: boolean;
  fullName: string;
  email: string;
  roleName: string;
  businessName: string;
  businessSlug: string;
  language: string;
  initial: string;
  currentMembershipId: string | null;
  canDeleteCurrentAccount: boolean;
  isDeletingAccount: boolean;
  onSignOut: () => void;
  onLanguageChange: (value: string) => void;
  onDeleteCurrentAccount: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [currencyCode, setCurrencyCode] = useState(initialCurrencyCode);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [businessCategory, setBusinessCategory] = useState(initialBusinessCategory);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [paymentTypes, setPaymentTypes] = useState(initialPaymentTypes);
  const [paymentTypeDraft, setPaymentTypeDraft] = useState('');
  const salesChannelStorageKey = `${SALES_CHANNEL_STORAGE_PREFIX}.${businessId}`;
  const [salesChannels, setSalesChannels] = useState<SalesChannelId[]>(() =>
    getInitialSalesChannels(salesChannelStorageKey, initialBusinessCategory)
  );
  const [receiptShowLogo, setReceiptShowLogo] = useState(initialReceiptShowLogo);
  const [receiptHeaderText, setReceiptHeaderText] = useState(initialReceiptHeaderText);
  const [receiptFooterText, setReceiptFooterText] = useState(initialReceiptFooterText);
  const [planId, setPlanId] = useState<BillingPlanId>(initialPlanId);
  const [paymentMethodId, setPaymentMethodId] = useState<BillingPaymentMethodId>(initialMethodId);
  const [applyToAllLocations, setApplyToAllLocations] = useState(initialApplyToAllLocations);
  const [billingIsActive, setBillingIsActive] = useState(initialBillingIsActive);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const selectedPlan = BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[1];
  const selectedMethod =
    BILLING_PAYMENT_METHODS.find((method) => method.id === paymentMethodId) ?? BILLING_PAYMENT_METHODS[0];
  const selectedCategory = getBusinessCategory(businessCategory);
  const selectedHighlights = BUSINESS_HIGHLIGHTS[selectedCategory.value] ?? BUSINESS_HIGHLIGHTS.other;
  const expiresText = new Date(trialExpiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const addPaymentType = () => {
    const label = paymentTypeDraft.trim();
    if (!label) {
      return;
    }

    const exists = paymentTypes.some((entry) => entry.toLowerCase() === label.toLowerCase());
    if (exists) {
      setPaymentTypeDraft('');
      return;
    }

    setPaymentTypes((current) => [...current, label]);
    setPaymentTypeDraft('');
  };

  const removePaymentType = (label: string) => {
    setPaymentTypes((current) => current.filter((entry) => entry !== label));
  };

  const persistSalesChannels = (nextSalesChannels: SalesChannelId[]) => {
    setSalesChannels(nextSalesChannels);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(salesChannelStorageKey, JSON.stringify(nextSalesChannels));
    }
  };

  const toggleSalesChannel = (channelId: SalesChannelId) => {
    persistSalesChannels(
      salesChannels.includes(channelId)
        ? salesChannels.filter((entry) => entry !== channelId)
        : [...salesChannels, channelId]
    );
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const updated = await updateBusiness({
        businessId,
        body: {
          name: name.trim() || null,
          currency_code: currencyCode.trim().toUpperCase() || null,
          timezone: timezone.trim() || null,
          business_category: businessCategory,
          business_type: businessType,
          payment_types: paymentTypes,
          receipt_show_logo: receiptShowLogo,
          receipt_header_text: receiptHeaderText.trim() || null,
          receipt_footer_text: receiptFooterText.trim() || null,
          billing_plan_id: planId,
          billing_payment_method_id: paymentMethodId,
          billing_apply_to_all_locations: applyToAllLocations,
        },
      }).unwrap();

      setName(updated.name);
      setCurrencyCode(updated.currency_code);
      setTimezone(updated.timezone);
      setBusinessCategory(updated.business_category);
      setBusinessType(updated.business_type);
      setPaymentTypes(updated.payment_types ?? []);
      setReceiptShowLogo(updated.receipt_show_logo);
      setReceiptHeaderText(updated.receipt_header_text);
      setReceiptFooterText(updated.receipt_footer_text);
      setBillingIsActive(updated.billing_is_active);
      persistSalesChannels(getInitialSalesChannels(salesChannelStorageKey, updated.business_category));
      setStatusMessage('Workspace settings saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workspace settings.';
      setStatusMessage(message);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');

    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordMessage('Please enter both your current password and a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage('Your new password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('The new passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : null) ?? 'Password updated successfully.';

      if (!response.ok) {
        setPasswordMessage(message);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordMessage('Password updated. Please sign in again with your new password.');
      await onSignOut();
    } catch {
      setPasswordMessage('Unable to update your password right now. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={styles.pageBody}>
      <section className={styles.statusStrip}>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Business</span>
          <strong className={styles.statusValue}>{businessName}</strong>
          <small>{businessSlug}</small>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Trial</span>
          <strong className={styles.statusValue}>
            {trialIsExpired ? 'Expired' : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left`}
          </strong>
          <small>{expiresText}</small>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Access</span>
          <strong className={styles.statusValue}>{billingIsActive ? 'Unlocked' : 'Locked'}</strong>
          <small>{billingIsActive ? 'POS is available' : 'Billing needs attention'}</small>
        </div>
      </section>

      <section className={styles.identityGrid}>
        <article className={styles.identityCard}>
          <span className={styles.cardKicker}>Company profile</span>
          <h2 className={styles.identityTitle}>{businessName}</h2>
          <p className={styles.identityText}>
            This is the company being represented across the dashboard, receipts, and billing.
          </p>
          <div className={styles.identityDetails}>
            <div>
              <span className={styles.detailLabel}>Slug</span>
              <strong>{businessSlug}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Category</span>
              <strong>{selectedCategory.label}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Type</span>
              <strong>{businessType}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Currency / time zone</span>
              <strong>
                {currencyCode} · {timezone}
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.identityCard}>
          <span className={styles.cardKicker}>Signed-in account</span>
          <h2 className={styles.identityTitle}>{fullName}</h2>
          <p className={styles.identityText}>
            This is the personal login currently using Vendora, separate from the company profile.
          </p>
          <div className={styles.identityDetails}>
            <div>
              <span className={styles.detailLabel}>Email</span>
              <strong>{email}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Role</span>
              <strong>{roleName}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Language</span>
              <strong>{language}</strong>
            </div>
            <div>
              <span className={styles.detailLabel}>Session</span>
              <strong>Stays signed in until sign out</strong>
            </div>
          </div>
        </article>
      </section>

      <div className={styles.grid}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <span className={styles.cardKicker}>Company settings</span>
            <h2 className={styles.cardTitle}>Edit the company details that appear across the platform.</h2>
            <p className={styles.cardText}>
              This controls how the company is named in the dashboard, receipts, and future operational settings.
            </p>
          </div>
        </div>

        {statusMessage ? <div className={styles.notice}>{statusMessage}</div> : null}

        <form className={styles.form} onSubmit={handleSave}>
          <Input
            id="business-name"
            label="Company name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helpText="The company name shown to staff and in the dashboard."
          />

          <div className={styles.formGrid}>
            <Select
              id="currency-code"
              label="Currency"
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value)}
              helpText="Used for pricing, reporting, and sales totals."
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Select
              id="timezone"
              label="Time zone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              helpText="Used for daily summaries and report cutoffs."
            >
              {timezoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Select
              id="business-category"
              label="Business category"
              value={businessCategory}
              onChange={(event) => {
                const nextCategory = getBusinessCategory(event.target.value);
                setBusinessCategory(nextCategory.value);
                setBusinessType(nextCategory.types[0]);
                persistSalesChannels(getInitialSalesChannels(salesChannelStorageKey, nextCategory.value));
              }}
              helpText="The main business group you operate in."
            >
              {BUSINESS_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>

            <Select
              id="business-type"
              label="Business type"
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value)}
              helpText="The more specific type that best describes your business."
            >
              {selectedCategory.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>

            <Select
              id="billing-plan"
              label="Billing plan"
              value={planId}
              onChange={(event) => setPlanId(event.target.value as BillingPlanId)}
              helpText="Choose the plan that matches the size of the business."
            >
              {BILLING_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.priceLabel}
                </option>
              ))}
            </Select>

            <Select
              id="billing-method"
              label="Payment method"
              value={paymentMethodId}
              onChange={(event) => setPaymentMethodId(event.target.value as BillingPaymentMethodId)}
              helpText="How the business prefers to pay for Vendora."
            >
              {BILLING_PAYMENT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles.paymentTypesCard}>
            <div className={styles.paymentTypesHeader}>
              <div>
                <span className={styles.cardKicker}>Sales payment types</span>
                <h3 className={styles.paymentTypesTitle}>What payment labels should the POS show?</h3>
                <p className={styles.cardText}>
                  Add the tender names your team actually uses. These are saved on the business profile and can later
                  power the POS payment options and reporting.
                </p>
              </div>
              <span className={styles.paymentTypesCount}>
                {paymentTypes.length} type{paymentTypes.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className={styles.paymentTypesInputRow}>
              <Input
                id="payment-type-draft"
                label="Add payment type"
                value={paymentTypeDraft}
                onChange={(event) => setPaymentTypeDraft(event.target.value)}
                placeholder="Cash, Card, Airtel Money"
                helpText="Use plain labels your staff will recognize."
              />
              <Button type="button" variant="outline" onClick={addPaymentType}>
                Add
              </Button>
            </div>

            <div className={styles.paymentTypesList}>
              {paymentTypes.length > 0 ? (
                paymentTypes.map((paymentType) => (
                  <span key={paymentType} className={styles.paymentTypeChip}>
                    {paymentType}
                    <button
                      type="button"
                      className={styles.paymentTypeRemove}
                      onClick={() => removePaymentType(paymentType)}
                      aria-label={`Remove ${paymentType}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className={styles.paymentTypesEmpty}>
                  No payment types yet. Add at least one so the POS has clear choices.
                </p>
              )}
            </div>
          </div>

          <div className={styles.salesChannelsCard}>
            <div className={styles.paymentTypesHeader}>
              <div>
                <span className={styles.cardKicker}>Sales channel</span>
                <h3 className={styles.paymentTypesTitle}>What order types should appear on the POS?</h3>
                <p className={styles.cardText}>
                  Choose the channels that fit this business. The POS will use the saved list to help staff label sales.
                </p>
              </div>
              <span className={styles.paymentTypesCount}>
                {salesChannels.length} enabled
              </span>
            </div>

            <div className={styles.salesChannelGrid}>
              {SALES_CHANNEL_OPTIONS.map((channel) => {
                const checked = salesChannels.includes(channel.id);
                const isRecommended = getRecommendedSalesChannels(selectedCategory.value).includes(channel.id);

                return (
                  <label key={channel.id} className={`${styles.salesChannelItem} ${checked ? styles.salesChannelItemActive : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSalesChannel(channel.id)}
                    />
                    <div>
                      <strong>
                        {channel.label}
                        {isRecommended ? <span className={styles.salesChannelRecommended}>Recommended</span> : null}
                      </strong>
                      <span>{channel.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.businessTypeCard}>
            <div className={styles.businessTypeHeader}>
              <div>
                <span className={styles.cardKicker}>Business type</span>
                <h3 className={styles.paymentTypesTitle}>Keep the workspace tailored to your industry.</h3>
                <p className={styles.cardText}>
                  Vendora can use the selected category and type to frame the workspace and future setup guidance.
                </p>
              </div>
              <span className={styles.paymentTypesCount}>
                {selectedCategory.label}
              </span>
            </div>

            <div className={styles.businessTypeSummary}>
              <div>
                <span className={styles.detailLabel}>Category</span>
                <strong>{selectedCategory.label}</strong>
              </div>
              <div>
                <span className={styles.detailLabel}>Type</span>
                <strong>{businessType}</strong>
              </div>
            </div>

            <div className={styles.selectorPills}>
              {selectedCategory.types.slice(0, 4).map((type) => (
                <span key={type} className={styles.selectorSummaryPill}>
                  {type}
                </span>
              ))}
            </div>

            <div className={styles.selectorPills}>
              {selectedHighlights.map((highlight) => (
                <span key={highlight} className={styles.selectorSummaryPill}>
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <div>
                <span className={styles.cardKicker}>Receipt branding</span>
                <h3 className={styles.receiptTitle}>Customize what prints on the receipt.</h3>
                <p className={styles.cardText}>
                  Add the header and footer text your staff should see on printed and downloadable receipts.
                </p>
              </div>
            </div>

            <label className={styles.checkboxRow} htmlFor="receipt-show-logo">
              <input
                id="receipt-show-logo"
                type="checkbox"
                checked={receiptShowLogo}
                onChange={(event) => setReceiptShowLogo(event.target.checked)}
              />
              <span>Show receipt logo area</span>
            </label>

            <div className={styles.formGrid}>
              <Input
                id="receipt-header-text"
                label="Receipt header"
                value={receiptHeaderText}
                onChange={(event) => setReceiptHeaderText(event.target.value)}
                helpText="A short line that appears near the top of the receipt."
              />
              <Input
                id="receipt-footer-text"
                label="Receipt footer"
                value={receiptFooterText}
                onChange={(event) => setReceiptFooterText(event.target.value)}
                helpText="A note, support line, or returns reminder for the customer."
              />
            </div>
          </div>

          <label className={styles.checkboxRow} htmlFor="billing-apply-all">
            <input
              id="billing-apply-all"
              type="checkbox"
              checked={applyToAllLocations}
              onChange={(event) => setApplyToAllLocations(event.target.checked)}
            />
            <span>Apply billing method to all locations</span>
          </label>

          <div className={styles.preferenceSummary}>
            <div>
              <span>Selected plan</span>
              <strong>{selectedPlan.name}</strong>
            </div>
            <div>
              <span>Selected payment method</span>
              <strong>{selectedMethod.name}</strong>
            </div>
            <div>
              <span>Plan scope</span>
              <strong>{applyToAllLocations ? 'All locations' : 'Selected locations'}</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save workspace settings'}
            </Button>
            <Link href="/dashboard/billing" className={styles.linkButton}>
              Open billing
            </Link>
          </div>
        </form>
      </section>

      <aside className={styles.sidebar}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>My account</span>
              <h2 className={styles.cardTitle}>The person logged in is separate from the business.</h2>
              <p className={styles.cardText}>
                This is your personal login, while the business profile above is the company you are representing.
              </p>
            </div>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.profileCopy}>
              <strong>{fullName}</strong>
              <span>{email}</span>
              <span>{roleName}</span>
              <span>{businessName}</span>
            </div>
          </div>

          <div className={styles.profileActions}>
            <Button type="button" variant="outline" onClick={onSignOut}>
              Sign out
            </Button>
            <Link href="/terms" className={styles.linkButton}>
              View Terms
            </Link>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>Security</span>
              <h2 className={styles.cardTitle}>Change the password for this account.</h2>
              <p className={styles.cardText}>
                Enter your current password and confirm the new one so the account stays secure.
              </p>
            </div>
          </div>

          <form className={styles.sidebarForm} onSubmit={handleChangePassword}>
            <Input
              id="current-password"
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              helpText="We use this to verify it is really you."
              required
            />
            <Input
              id="new-password"
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              helpText="Use at least 8 characters."
              required
            />
            <Input
              id="confirm-new-password"
              label="Confirm new password"
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              helpText="Re-enter the new password to avoid mistakes."
              required
            />

            {passwordMessage ? <div className={styles.notice}>{passwordMessage}</div> : null}

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>Personal preferences</span>
              <h2 className={styles.cardTitle}>Tailor the interface to the signed-in account.</h2>
              <p className={styles.cardText}>
                These settings stay on this device and help the account feel separate from the company profile.
              </p>
            </div>
          </div>

          <div className={styles.sidebarForm}>
            <Select
              id="app-language"
              label="App language"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              helpText="Stored locally on this browser."
            >
              {languageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <div className={styles.preferenceCallout}>
              <strong>Your login and company stay separate.</strong>
              <span>Language and session preferences follow the signed-in account on this device.</span>
            </div>
          </div>
        </section>

        {canDeleteCurrentAccount ? (
          <section className={styles.dangerCard}>
            <div>
              <span className={styles.dangerEyebrow}>Danger zone</span>
              <h2>Delete my account</h2>
              <p>
                Remove the signed-in employee account from this business.
                {currentMembershipId ? ' The action is tied to your current employee membership.' : ''}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className={styles.dangerButton}
              onClick={onDeleteCurrentAccount}
              disabled={!canDeleteCurrentAccount || isDeletingAccount}
            >
              {isDeletingAccount ? 'Deleting…' : 'Delete my account'}
            </Button>
          </section>
        ) : null}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>Quick access</span>
              <h2 className={styles.cardTitle}>Move to the main operational areas faster.</h2>
            </div>
          </div>

          <div className={styles.quickLinks}>
            <Link href="/dashboard/accounts" className={styles.quickLink}>
              Employees
              <span>Manage roles, invites, and location access.</span>
            </Link>
            <Link href="/dashboard/billing" className={styles.quickLink}>
              Billing
              <span>Review plans, trial status, and payment methods.</span>
            </Link>
            <Link href="/dashboard/locations" className={styles.quickLink}>
              Locations
              <span>Keep branches organized and editable.</span>
            </Link>
            <Link href="/dashboard/products" className={styles.quickLink}>
              Products
              <span>Control the catalog and pricing.</span>
            </Link>
            <Link href="/dashboard/pos" className={styles.quickLink}>
              POS
              <span>Return to the selling screen.</span>
            </Link>
          </div>
        </section>
      </aside>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const { data: me, error: meError } = useGetMeQuery();
  const { data: business, error: businessError } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    const unauthorized = isUnauthorizedError(meError) || isUnauthorizedError(businessError);

    if (unauthorized) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [businessError, dispatch, meError, router]);

  const loadError = isUnauthorizedError(meError) || isUnauthorizedError(businessError)
    ? null
    : getErrorMessage(meError) ?? getErrorMessage(businessError);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_LANGUAGE_STORAGE_KEY, value);
    }
  };

  const fullName = useMemo(
    () => `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || authState.userName || 'Signed-in user',
    [authState.userName, me]
  );

  const roleName = me?.role_name ?? authState.roleName ?? 'Team member';
  const businessName = business?.name ?? authState.businessName ?? 'Merchant Store';
  const businessSlug = business?.slug ?? business?.name?.toLowerCase().replace(/\s+/g, '-') ?? 'merchant-store';
  const email = me?.email ?? authState.email ?? 'No email loaded';
  const initial = fullName ? fullName[0].toUpperCase() : 'M';
  const paymentTypes = business?.payment_types?.length ? business.payment_types : ['Cash', 'Card', 'Mobile Money'];
  const receiptShowLogo = business?.receipt_show_logo ?? true;
  const receiptHeaderText = business?.receipt_header_text ?? 'Thanks for shopping with us.';
  const receiptFooterText =
    business?.receipt_footer_text ?? 'Please keep this receipt for returns or support.';
  const canManageAccounts = Boolean(me?.permissions?.includes('users.manage') || authState.permissions.includes('users.manage'));
  const { data: accounts = [] } = useGetAccountsQuery(undefined, {
    skip: !me?.business_id || !canManageAccounts,
  });
  const currentMembershipId = useMemo(
    () => accounts.find((account: Account) => account.user_id === me?.id)?.membership_id ?? null,
    [accounts, me?.id]
  );
  const canDeleteCurrentAccount = Boolean(canManageAccounts && currentMembershipId);

  const handleSignOut = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch {
      // Clear local auth even if the backend call fails.
    }

    dispatch(logout());
    router.push('/login');
  };

  const handleDeleteCurrentAccount = async () => {
    if (!currentMembershipId) {
      window.alert('Your employee record is not available right now. Please refresh and try again.');
      return;
    }

    const confirmed = window.confirm(
      'Delete your own employee account? You will be signed out after this action.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAccount(currentMembershipId).unwrap();

      try {
        await logoutApi({}).unwrap();
      } catch {
        // Clear local auth even if the backend logout request fails.
      }

      dispatch(logout());
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete your account.';
      window.alert(message);
    }
  };

  if (!business) {
    if (loadError) {
      return (
        <div className={styles.page}>
          <div className={styles.hero}>
            <div>
              <span className={styles.eyebrow}>Settings</span>
              <h1 className={styles.title}>We could not load workspace settings.</h1>
              <p className={styles.subtitle}>
                {loadError} Please check the backend connection and refresh the page.
              </p>
            </div>
          </div>
          <div className={styles.notice}>
            The company profile will appear here again once the business endpoint responds.
          </div>
        </div>
      );
    }

    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Settings</span>
            <h1 className={styles.title}>Workspace settings, kept simple.</h1>
            <p className={styles.subtitle}>Please wait while we load the company profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Settings</span>
          <h1 className={styles.title}>Workspace settings, kept simple.</h1>
          <p className={styles.subtitle}>
            Keep the company profile, your personal profile, and operational shortcuts in separate places so the
            workspace stays understandable.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Business</span>
            <strong className={styles.statValue}>{businessName}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Signed in as</span>
            <strong className={styles.statValue}>{fullName}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Role</span>
            <strong className={styles.statValue}>{roleName}</strong>
          </div>
        </div>
      </div>

      <WorkspaceProfileCard
        key={business.id}
        businessId={business.id}
        initialName={business.name}
        initialCurrencyCode={business.currency_code}
        initialTimezone={business.timezone}
        initialBusinessCategory={business.business_category}
        initialBusinessType={business.business_type}
        initialPaymentTypes={paymentTypes}
        initialReceiptShowLogo={receiptShowLogo}
        initialReceiptHeaderText={receiptHeaderText}
        initialReceiptFooterText={receiptFooterText}
        initialPlanId={business.billing_plan_id}
        initialMethodId={business.billing_payment_method_id}
        initialApplyToAllLocations={business.billing_apply_to_all_locations}
        initialBillingIsActive={business.billing_is_active}
        trialDaysRemaining={business.trial_days_remaining}
        trialExpiresAt={business.trial_expires_at}
        trialIsExpired={business.trial_is_expired}
        fullName={fullName}
        email={email}
        roleName={roleName}
        businessName={businessName}
        businessSlug={businessSlug}
        language={language}
        initial={initial}
        currentMembershipId={currentMembershipId}
        canDeleteCurrentAccount={canDeleteCurrentAccount}
        isDeletingAccount={isDeletingAccount}
        onSignOut={handleSignOut}
        onLanguageChange={handleLanguageChange}
        onDeleteCurrentAccount={handleDeleteCurrentAccount}
      />
    </div>
  );
}
