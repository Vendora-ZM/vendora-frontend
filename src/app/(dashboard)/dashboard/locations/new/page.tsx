'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateLocationMutation } from '@/lib/features/locations/locationsApi';
import type { CreateLocationPayload } from '@/lib/features/locations/locationsApi';
import styles from './page.module.css';

interface FormState {
  name: string;
  code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  pos_terminal_limit: string;
  access_pin: string;
  is_default: boolean;
}

const defaultForm: FormState = {
  name: '',
  code: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country_code: 'ZM',
  pos_terminal_limit: '1',
  access_pin: '',
  is_default: false,
};

export default function NewLocationPage() {
  const router = useRouter();
  const [createLocation, { isLoading }] = useCreateLocationMutation();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Location name is required.';
    if (!form.country_code.trim()) nextErrors.country_code = 'Country code is required.';
    if (form.country_code.trim().length !== 2) {
      nextErrors.country_code = 'Use a 2-letter country code, like ZM.';
    }
    const terminalLimit = Number.parseInt(form.pos_terminal_limit, 10);
    if (!Number.isInteger(terminalLimit) || terminalLimit < 1) {
      nextErrors.pos_terminal_limit = 'Enter at least 1 POS terminal.';
    }
    const pin = form.access_pin.trim();
    if (pin.length > 0 && (!/^\d{4}$/.test(pin))) {
      nextErrors.access_pin = 'Use a 4-digit PIN.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);

    try {
      const payload: CreateLocationPayload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        address_line1: form.address_line1.trim() || null,
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country_code: form.country_code.trim().toUpperCase(),
        pos_terminal_limit: Number.parseInt(form.pos_terminal_limit, 10) || 1,
        access_pin: form.access_pin.trim() || null,
        is_default: form.is_default,
      };

      const createdLocation = await createLocation(payload).unwrap();
      router.push(`/dashboard/locations/${createdLocation.id}`);
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setApiError(message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s6-4.35 6-10a6 6 0 0 0-12 0c0 5.65 6 10 6 10Z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Create Location</h1>
            <p className={styles.subtitle}>Add a new branch and set up the address details that will power location analytics.</p>
          </div>
        </div>

        <Link className={styles.backLink} href="/dashboard/locations">
          Back to locations
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.apiError}>{apiError}</div>}

        <div className={styles.formLayout}>
          <div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Location Details</h2>
              </div>

              <div className={styles.formGrid}>
                <Input
                  id="location-name"
                  label="Location Name *"
                  placeholder="e.g. Lusaka Central"
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />
                <Input
                  id="location-code"
                  label="Location Code"
                  placeholder="e.g. LUS-01"
                  value={form.code}
                  onChange={set('code')}
                  helpText="Optional short code for internal reference."
                />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Address</h2>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                  <Input
                    id="location-address-line1"
                    label="Address Line 1"
                    placeholder="Street address"
                    value={form.address_line1}
                    onChange={set('address_line1')}
                  />
                </div>
                <div className={styles.fullWidth}>
                  <Input
                    id="location-address-line2"
                    label="Address Line 2"
                    placeholder="Apartment, suite, or landmark"
                    value={form.address_line2}
                    onChange={set('address_line2')}
                  />
                </div>
                <Input
                  id="location-city"
                  label="City"
                  placeholder="e.g. Lusaka"
                  value={form.city}
                  onChange={set('city')}
                />
                <Input
                  id="location-state"
                  label="State / Province"
                  placeholder="e.g. Lusaka Province"
                  value={form.state}
                  onChange={set('state')}
                />
                <Input
                  id="location-postal-code"
                  label="Postal Code"
                  placeholder="e.g. 10101"
                  value={form.postal_code}
                  onChange={set('postal_code')}
                />
                <Input
                  id="location-country-code"
                  label="Country Code *"
                  placeholder="e.g. ZM"
                  value={form.country_code}
                  onChange={set('country_code')}
                  error={errors.country_code}
                  helpText="Use a two-letter ISO country code."
                />
              </div>
            </div>
          </div>

          <div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Branch Settings</h2>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.toggle} htmlFor="location-default">
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Default Location</span>
                    <span className={styles.toggleHint}>Use this as the primary branch for quick actions.</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.is_default ? styles.toggleOn : ''}`}>
                    <input
                      id="location-default"
                      type="checkbox"
                      checked={form.is_default}
                      onChange={set('is_default')}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleThumb} />
                  </div>
                </label>
              </div>

              <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                <Input
                  id="location-pos-terminals"
                  label="POS Terminals"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="1"
                  value={form.pos_terminal_limit}
                  onChange={set('pos_terminal_limit')}
                  error={errors.pos_terminal_limit}
                  helpText="How many POS devices can log in for this branch."
                />
                <Input
                  id="location-access-pin"
                  label="Branch PIN"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  value={form.access_pin}
                  onChange={set('access_pin')}
                  error={errors.access_pin}
                  helpText="Optional 4-digit PIN for branch login."
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.push('/dashboard/locations')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isLoading}>
            {isLoading ? 'Creating…' : 'Create Location'}
          </Button>
        </div>
      </form>
    </div>
  );
}
