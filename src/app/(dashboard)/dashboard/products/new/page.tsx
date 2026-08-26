'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProductMutation, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { useAdjustStockMutation } from '@/lib/features/inventory/inventoryApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { CreateProductPayload, type Category } from '@/types/product';
import type { Location } from '@/types/location';
import styles from './page.module.css';

interface FormState {
  name: string;
  sku: string;
  description: string;
  category_id: string;
  selling_price: string;
  cost_price: string;
  unit: string;
  barcode: string;
  is_taxable: boolean;
  tax_rate: string;
  is_active: boolean;
  initial_stock: string;
  initial_location_id: string;
  initial_expiry_date: string;
}

const defaultForm: FormState = {
  name: '',
  sku: '',
  description: '',
  category_id: '',
  selling_price: '',
  cost_price: '',
  unit: '',
  barcode: '',
  is_taxable: false,
  tax_rate: '',
  is_active: true,
  initial_stock: '',
  initial_location_id: '',
  initial_expiry_date: '',
};

export default function NewProductPage() {
  const router = useRouter();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: locations = [] } = useGetLocationsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation();
  const isLoading = isCreating || isAdjusting;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

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
    if (!form.name.trim()) newErrors.name = 'Product name is required.';
    if (!form.sku.trim()) newErrors.sku = 'Item code is required.';
    if (form.selling_price && isNaN(parseFloat(form.selling_price))) {
      newErrors.selling_price = 'Must be a valid number.';
    }
    if (form.cost_price && isNaN(parseFloat(form.cost_price))) {
      newErrors.cost_price = 'Must be a valid number.';
    }
    if (form.initial_stock && parseFloat(form.initial_stock) > 0 && !form.initial_location_id) {
      newErrors.initial_location_id = 'Select where the opening stock will be stored.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);

    try {
      const payload: CreateProductPayload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        selling_price: Math.round(parseFloat(form.selling_price || '0') * 100),
        cost_price: Math.round(parseFloat(form.cost_price || '0') * 100),
        unit: form.unit,
        barcode: form.barcode.trim() || null,
        is_taxable: form.is_taxable,
        tax_rate: form.is_taxable ? form.tax_rate : '0',
      };
      
      const newProduct = await createProduct(payload).unwrap();
      if (form.initial_stock && parseFloat(form.initial_stock) > 0 && form.initial_location_id) {
        await adjustStock({
          product_id: newProduct.id,
          location_id: form.initial_location_id,
          quantity_delta: form.initial_stock,
          notes: 'Initial stock setup',
          expiry_date: form.initial_expiry_date || undefined,
        }).unwrap();
      }
      // On success, redirect back to products list
      router.push('/dashboard/products');
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div>
            <h1 className={styles.title}>Add New Product</h1>
            <p className={styles.subtitle}>Enter the details below to list a new item in your inventory.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.apiError}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {apiError}
        </div>}

        <div className={styles.formLayout}>
          {/* Main Content Column */}
          <div>
            {/* General Information Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h2 className={styles.sectionTitle}>General Information</h2>
              </div>
              <div className={styles.formGrid}>
                <Input
                  id="product-name"
                  label="Product Name *"
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />
                <Input
                  id="product-sku"
                  label="Item code *"
                  placeholder="e.g. WM-001"
                  value={form.sku}
                  onChange={set('sku')}
                  error={errors.sku}
                />
                <div className={styles.fullWidth}>
                  <Textarea
                    id="product-description"
                    label="Description"
                    placeholder="Optional product description…"
                    value={form.description}
                    onChange={set('description')}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <h2 className={styles.sectionTitle}>Pricing</h2>
              </div>
              <div className={styles.formGrid}>
                <Input
                  id="product-selling-price"
                  label="Selling Price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.selling_price}
                  onChange={set('selling_price')}
                  error={errors.selling_price}
                />
                <Input
                  id="product-cost-price"
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.cost_price}
                  onChange={set('cost_price')}
                  error={errors.cost_price}
                />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7 12 3 4 7l8 4 8-4Z"></path><path d="M4 7v10l8 4 8-4V7"></path><path d="M12 11v10"></path></svg>
                <h2 className={styles.sectionTitle}>Opening Stock</h2>
              </div>
              <div className={styles.formGrid}>
                <Input
                  id="product-initial-stock"
                  label="Opening Stock"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 50"
                  value={form.initial_stock}
                  onChange={set('initial_stock')}
                />
                <Select
                  id="product-initial-location"
                  label="Opening Stock Location"
                  value={form.initial_location_id}
                  onChange={set('initial_location_id')}
                  error={errors.initial_location_id}
                >
                  <option value="">— Select Location —</option>
                  {locations.map((loc: Location) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>
                {form.initial_stock && parseFloat(form.initial_stock) > 0 && (
                  <Input
                    id="product-initial-expiry-date"
                    label="Opening Stock Expiry Date (Optional)"
                    type="date"
                    value={form.initial_expiry_date}
                    onChange={set('initial_expiry_date')}
                  />
                )}
                <div className={styles.categoryHelper}>
                  <span className={styles.categoryHelperLabel}>Stock can be adjusted later</span>
                  <p className={styles.categoryHelperText}>
                    This step is optional. You can adjust this product&apos;s stock later from the inventory adjustment flow whenever stock changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Organization Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <h2 className={styles.sectionTitle}>Organization</h2>
              </div>
              <div className={styles.toggleRow}>
                <Select
                  id="product-category"
                  label="Category"
                  value={form.category_id}
                  onChange={set('category_id')}
                >
                  <option value="">— No Category —</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
                <div className={styles.categoryHelper}>
                  <span className={styles.categoryHelperLabel}>Need a new category?</span>
                  <p className={styles.categoryHelperText}>
                    Create one first, then come back and assign it to this product.
                  </p>
                  <Link href="/dashboard/categories" className={styles.categoryHelperLink}>
                    Manage categories
                  </Link>
                </div>
                <Input
                  id="product-unit"
                  label="Unit"
                  placeholder="e.g. pcs, kg, L"
                  value={form.unit}
                  onChange={set('unit')}
                />
                <Input
                  id="product-barcode"
                  label="Barcode"
                  placeholder="e.g. 1234567890128"
                  value={form.barcode}
                  onChange={set('barcode')}
                />
              </div>
            </div>

            {/* Tax Settings */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h2 className={styles.sectionTitle}>Taxes</h2>
              </div>
              <div className={styles.toggleRow}>
                <label className={styles.toggle} htmlFor="product-taxable">
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Taxable Product</span>
                    <span className={styles.toggleHint}>Apply tax upon checkout</span>
                  </div>
                  <div className={`${styles.toggleSwitch} ${form.is_taxable ? styles.toggleOn : ''}`}>
                    <input
                      id="product-taxable"
                      type="checkbox"
                      checked={form.is_taxable}
                      onChange={set('is_taxable')}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleThumb} />
                  </div>
                </label>

                {form.is_taxable && (
                  <Input
                    id="product-tax-rate"
                    label="Tax Rate (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 16"
                    value={form.tax_rate}
                    onChange={set('tax_rate')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push('/dashboard/products')}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Adding Product…' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
