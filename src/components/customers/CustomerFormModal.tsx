'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeFormModal } from '@/lib/features/customers/customersSlice';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/lib/features/customers/customersApi';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateCustomerPayload, UpdateCustomerPayload } from '@/types/customer';
import styles from './CustomerFormModal.module.css';

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  notes: string;
  is_active: boolean;
}

const defaultForm: FormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country_code: 'ZM',
  notes: '',
  is_active: true,
};

export const CustomerFormModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isFormModalOpen, modalMode, selectedCustomer } = useAppSelector((s) => s.customers);

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (modalMode === 'edit' && selectedCustomer) {
      setForm({
        first_name: selectedCustomer.first_name,
        last_name: selectedCustomer.last_name,
        email: selectedCustomer.email ?? '',
        phone: selectedCustomer.phone ?? '',
        address_line1: selectedCustomer.address_line1 ?? '',
        address_line2: selectedCustomer.address_line2 ?? '',
        city: selectedCustomer.city ?? '',
        state: selectedCustomer.state ?? '',
        postal_code: selectedCustomer.postal_code ?? '',
        country_code: selectedCustomer.country_code,
        notes: selectedCustomer.notes ?? '',
        is_active: selectedCustomer.is_active,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
    setApiError(null);
  }, [modalMode, selectedCustomer, isFormModalOpen]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [field]: val }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);

    try {
      if (modalMode === 'create') {
        const payload: CreateCustomerPayload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address_line1: form.address_line1.trim() || null,
          address_line2: form.address_line2.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          postal_code: form.postal_code.trim() || null,
          country_code: form.country_code,
          notes: form.notes.trim() || null,
        };
        await createCustomer(payload).unwrap();
      } else if (selectedCustomer) {
        const payload: UpdateCustomerPayload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address_line1: form.address_line1.trim() || null,
          address_line2: form.address_line2.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          postal_code: form.postal_code.trim() || null,
          country_code: form.country_code,
          notes: form.notes.trim() || null,
          is_active: form.is_active,
        };
        await updateCustomer({ id: selectedCustomer.id, data: payload }).unwrap();
      }
      dispatch(closeFormModal());
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setApiError(message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isFormModalOpen}
      onClose={() => dispatch(closeFormModal())}
      title={modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.apiError}>{apiError}</div>}

        <div className={styles.formGrid}>
          {/* Personal Info */}
          <Input
            id="customer-first-name"
            label="First Name *"
            value={form.first_name}
            onChange={set('first_name')}
            error={errors.first_name}
          />
          <Input
            id="customer-last-name"
            label="Last Name *"
            value={form.last_name}
            onChange={set('last_name')}
            error={errors.last_name}
          />

          {/* Contact Info */}
          <Input
            id="customer-email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set('email')}
          />
          <Input
            id="customer-phone"
            label="Phone Number"
            value={form.phone}
            onChange={set('phone')}
          />

          {/* Address */}
          <div className={styles.fullWidth}>
            <Input
              id="customer-address1"
              label="Address Line 1"
              value={form.address_line1}
              onChange={set('address_line1')}
            />
          </div>
          <div className={styles.fullWidth}>
            <Input
              id="customer-address2"
              label="Address Line 2"
              value={form.address_line2}
              onChange={set('address_line2')}
            />
          </div>
          <Input
            id="customer-city"
            label="City"
            value={form.city}
            onChange={set('city')}
          />
          <Input
            id="customer-state"
            label="State/Province"
            value={form.state}
            onChange={set('state')}
          />
          <Input
            id="customer-country"
            label="Country Code"
            placeholder="e.g. ZM"
            value={form.country_code}
            onChange={set('country_code')}
          />

          {/* Notes full width */}
          <div className={styles.fullWidth}>
            <Textarea
              id="customer-notes"
              label="Notes"
              value={form.notes}
              onChange={set('notes')}
            />
          </div>

          {/* Toggles */}
          {modalMode === 'edit' && (
            <div className={styles.fullWidth}>
              <label className={styles.toggle} htmlFor="customer-active">
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Active Customer</span>
                </div>
                <div className={`${styles.toggleSwitch} ${form.is_active ? styles.toggleOn : ''}`}>
                  <input
                    id="customer-active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={set('is_active')}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleThumb} />
                </div>
              </label>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => dispatch(closeFormModal())}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isLoading}>
            {isLoading
              ? modalMode === 'create' ? 'Adding...' : 'Saving...'
              : modalMode === 'create' ? 'Add Customer' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
