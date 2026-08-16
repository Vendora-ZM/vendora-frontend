'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeFormModal } from '@/lib/features/products/productsSlice';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
} from '@/lib/features/products/productsApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useAdjustStockMutation } from '@/lib/features/inventory/inventoryApi';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateProductPayload, UpdateProductPayload, type Category } from '@/types/product';
import type { Location } from '@/types/location';
import styles from './ProductFormModal.module.css';

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
  initial_stock?: string;
  initial_location_id?: string;
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
};

export const ProductFormModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isFormModalOpen, modalMode, selectedProduct } = useAppSelector((s) => s.products);
  const { data: categories = [] } = useGetCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation();
  const { data: locations = [] } = useGetLocationsQuery();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating || isAdjusting;

  // Populate form when editing
  useEffect(() => {
    if (modalMode === 'edit' && selectedProduct) {
      setForm({
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        description: selectedProduct.description ?? '',
        category_id: selectedProduct.category_id ?? '',
        selling_price: selectedProduct.selling_price ? (selectedProduct.selling_price / 100).toFixed(2) : '',
        cost_price: selectedProduct.cost_price ? (selectedProduct.cost_price / 100).toFixed(2) : '',
        unit: selectedProduct.unit,
        barcode: selectedProduct.barcode ?? '',
        is_taxable: selectedProduct.is_taxable,
        tax_rate: selectedProduct.tax_rate,
        is_active: selectedProduct.is_active,
        initial_stock: '',
        initial_location_id: '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
    setApiError(null);
  }, [modalMode, selectedProduct, isFormModalOpen]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);

    try {
      if (modalMode === 'create') {
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
          }).unwrap();
        }
      } else if (selectedProduct) {
        const payload: UpdateProductPayload = {
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
          is_active: form.is_active,
        };
        await updateProduct({ id: selectedProduct.id, data: payload }).unwrap();
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
      title={modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.apiError}>{apiError}</div>}

        <div className={styles.formGrid}>
          {/* Row 1: Name + Item code */}
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

          {/* Row 2: Category + Unit */}
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
              Create it on the categories page, then assign it here.
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

          {/* Row 3: Selling Price + Cost Price */}
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

          {/* Row 4: Barcode full width */}
          <div className={styles.fullWidth}>
            <Input
              id="product-barcode"
              label="Barcode"
              placeholder="e.g. 1234567890128"
              value={form.barcode}
              onChange={set('barcode')}
            />
          </div>

          {/* Row 5: Description full width */}
          <div className={styles.fullWidth}>
            <Textarea
              id="product-description"
              label="Description"
              placeholder="Optional product description…"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {/* Row 6: Toggles */}
          <div className={styles.toggleRow}>
            <label className={styles.toggle} htmlFor="product-taxable">
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Taxable</span>
                <span className={styles.toggleHint}>Apply tax to this product</span>
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

            {modalMode === 'edit' && (
              <label className={styles.toggle} htmlFor="product-active">
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Active</span>
                  <span className={styles.toggleHint}>Product is visible and available</span>
                </div>
                <div className={`${styles.toggleSwitch} ${form.is_active ? styles.toggleOn : ''}`}>
                  <input
                    id="product-active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={set('is_active')}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleThumb} />
                </div>
              </label>
            )}
          </div>

          {/* Initial Stock (Only for Create) */}
          {modalMode === 'create' && (
            <>
              <Input
                id="product-initial-stock"
                label="Initial Stock"
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 50"
                value={form.initial_stock || ''}
                onChange={set('initial_stock')}
              />
              <Select
                id="product-initial-location"
                label="Stock Location"
                value={form.initial_location_id || ''}
                onChange={set('initial_location_id')}
              >
                <option value="">— Select Location —</option>
                {locations.map((loc: Location) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </Select>
            </>
          )}

          {/* Tax Rate — conditional */}
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
              ? modalMode === 'create' ? 'Adding…' : 'Saving…'
              : modalMode === 'create' ? 'Add Product' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/* eslint-enable react-hooks/set-state-in-effect */
