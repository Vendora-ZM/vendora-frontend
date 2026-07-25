'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import { TransferStockModal } from '@/components/inventory/TransferStockModal';
import { useAppDispatch } from '@/lib/store';
import { openAdjustModal, openTransferModal } from '@/lib/features/inventory/inventorySlice';
import { useGetProductByIdQuery, useUpdateProductMutation, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetBalancesQuery, useGetMovementsQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { Product, UpdateProductPayload } from '@/types/product';
import { Sale, SaleStatus } from '@/types/sale';
import styles from './page.module.css';

const STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
}

function toFormState(product: Product): FormState {
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    category_id: product.category_id ?? '',
    selling_price: product.selling_price ? (product.selling_price / 100).toFixed(2) : '',
    cost_price: product.cost_price ? (product.cost_price / 100).toFixed(2) : '',
    unit: product.unit ?? '',
    barcode: product.barcode ?? '',
    is_taxable: product.is_taxable,
    tax_rate: product.tax_rate ?? '',
    is_active: product.is_active,
  };
}

function ProductDetailsEditor({ product }: { product: Product }) {
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const selectedCategoryName = product.category_id ? categoryMap[product.category_id] ?? 'Uncategorised' : 'Uncategorised';
  const profitPerUnit = Math.max(product.selling_price - product.cost_price, 0);
  const margin = product.selling_price > 0 ? (profitPerUnit / product.selling_price) * 100 : 0;

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSuccessMessage(null);
    };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Product name is required.';
    if (!form.sku.trim()) nextErrors.sku = 'SKU is required.';
    if (form.selling_price && Number.isNaN(Number(form.selling_price))) {
      nextErrors.selling_price = 'Must be a valid number.';
    }
    if (form.cost_price && Number.isNaN(Number(form.cost_price))) {
      nextErrors.cost_price = 'Must be a valid number.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateProductPayload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        selling_price: Math.round(Number(form.selling_price || '0') * 100),
        cost_price: Math.round(Number(form.cost_price || '0') * 100),
        unit: form.unit.trim(),
        barcode: form.barcode.trim() || null,
        is_taxable: form.is_taxable,
        tax_rate: form.is_taxable ? form.tax_rate : '0',
        is_active: form.is_active,
      };

      await updateProduct({ id: product.id, data: payload }).unwrap();
      setSuccessMessage('Product updated successfully.');
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setApiError(message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.summaryHeader}>
        <div>
          <h2>{product.sku}</h2>
          <p>{selectedCategoryName}</p>
        </div>
        <span>{product.is_active ? 'Active' : 'Inactive'}</span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>Selling Price</span>
          <strong>{formatMoney(product.selling_price)}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Cost Price</span>
          <strong>{formatMoney(product.cost_price)}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Margin</span>
          <strong>{margin.toFixed(1)}%</strong>
        </div>
        <div className={styles.statCard}>
          <span>Status</span>
          <strong>{product.is_active ? 'Live' : 'Hidden'}</strong>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div>
          <h3>Product Details</h3>
          <p>Update the core fields that define how this item is sold and tracked.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.formGrid}>
        {apiError && <div className={styles.apiError}>{apiError}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <Input
          id="product-name"
          label="Product Name *"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Input
          id="product-sku"
          label="SKU *"
          value={form.sku}
          onChange={set('sku')}
          error={errors.sku}
        />
        <Select
          id="product-category"
          label="Category"
          value={form.category_id}
          onChange={set('category_id')}
        >
          <option value="">— No Category —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
        <Input
          id="product-unit"
          label="Unit"
          value={form.unit}
          onChange={set('unit')}
          placeholder="e.g. pcs, kg, L"
        />
        <Input
          id="product-selling-price"
          label="Selling Price"
          type="number"
          step="0.01"
          min="0"
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
          value={form.cost_price}
          onChange={set('cost_price')}
          error={errors.cost_price}
        />
        <Input
          id="product-barcode"
          label="Barcode"
          value={form.barcode}
          onChange={set('barcode')}
        />
        <div className={styles.fullWidth}>
          <Textarea
            id="product-description"
            label="Description"
            value={form.description}
            onChange={set('description')}
            placeholder="Optional product description…"
          />
        </div>

        <div className={styles.toggleRow}>
          <label className={styles.toggle} htmlFor="product-taxable">
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Taxable</span>
              <span className={styles.toggleHint}>Apply tax when selling this product.</span>
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

          <label className={styles.toggle} htmlFor="product-active">
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Active</span>
              <span className={styles.toggleHint}>Visible and available for use.</span>
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
        </div>

        {form.is_taxable && (
          <Input
            id="product-tax-rate"
            label="Tax Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.tax_rate}
            onChange={set('tax_rate')}
          />
        )}

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setForm(toFormState(product))}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function ProductWorkspace() {
  const params = useParams<{ id?: string | string[] }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const dispatch = useAppDispatch();

  const { data: product, isLoading: productLoading, isError } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: balances = [], isLoading: balancesLoading } = useGetBalancesQuery(
    productId ? { product_id: productId } : skipToken
  );
  const { data: movements = [], isLoading: movementsLoading } = useGetMovementsQuery(
    productId ? { product_id: productId, limit: 25, offset: 0 } : skipToken
  );
  const { data: salesResponse, isLoading: salesLoading } = useGetSalesQuery(
    productId ? { limit: 100, offset: 0 } : skipToken
  );

  const locationMap = useMemo(
    () => Object.fromEntries(locations.map((location) => [location.id, location.name])),
    [locations]
  );

  const balancesByLocation = useMemo(
    () => balances.slice().sort((a, b) => Number(b.quantity_available) - Number(a.quantity_available)),
    [balances]
  );

  const movementRows = useMemo(
    () => movements.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [movements]
  );

  const matchingSales = useMemo(() => {
    const rows = salesResponse?.data ?? [];
    return rows
      .map((sale) => {
        const item = sale.items.find((row) => row.product_id === productId);
        return item ? { sale, item } : null;
      })
      .filter((row): row is { sale: Sale; item: Sale['items'][number] } => Boolean(row))
      .sort((a, b) => new Date(b.sale.created_at).getTime() - new Date(a.sale.created_at).getTime());
  }, [productId, salesResponse]);

  const totals = useMemo(() => ({
    onHand: balances.reduce((sum, row) => sum + Number(row.quantity_on_hand || 0), 0),
    reserved: balances.reduce((sum, row) => sum + Number(row.quantity_reserved || 0), 0),
    available: balances.reduce((sum, row) => sum + Number(row.quantity_available || 0), 0),
    soldQuantity: matchingSales.reduce((sum, row) => sum + Number(row.item.quantity || 0), 0),
    revenue: matchingSales.reduce((sum, row) => sum + Number(row.item.line_total || 0), 0),
  }), [balances, matchingSales]);

  if (productLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading product profile…</div>
      </div>
    );
  }

  if (!productLoading && (isError || !product)) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Product not found</h1>
            <p className={styles.subtitle}>We could not find a product profile for this identifier.</p>
          </div>
          <Link className={styles.backLink} href="/dashboard/products">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumbs}>
            <Link href="/dashboard/products">Products</Link>
            <span>/</span>
            <span>{product?.name ?? 'Product profile'}</span>
          </div>
          <h1 className={styles.title}>{product?.name}</h1>
          <p className={styles.subtitle}>
            Manage product details, stock levels, sales activity, and inventory history from one place.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link className={styles.backLink} href="/dashboard/products">
            Back to products
          </Link>
          <div className={styles.actionRow}>
            <Button type="button" variant="outline" size="md" onClick={() => dispatch(openAdjustModal(product!.id))}>
              Adjust Stock
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => dispatch(openTransferModal(product!.id))}>
              Transfer Stock
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.quickNav}>
        <a href="#details">Details</a>
        <a href="#inventory">Inventory</a>
        <a href="#sales">Sales</a>
        <a href="#activity">Activity</a>
      </div>

      <section className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div>
            <h2>{product?.sku}</h2>
            <p>{product?.category_id ? 'Category assigned' : 'Uncategorised'}</p>
          </div>
          <span>{product?.is_active ? 'Active' : 'Inactive'}</span>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>Selling Price</span>
            <strong>{formatMoney(product?.selling_price ?? 0)}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Cost Price</span>
            <strong>{formatMoney(product?.cost_price ?? 0)}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Units Sold</span>
            <strong>{totals.soldQuantity.toLocaleString()}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Revenue</span>
            <strong>{formatMoney(totals.revenue)}</strong>
          </div>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metricChip}>
            <span>On Hand</span>
            <strong>{totals.onHand.toLocaleString()}</strong>
          </div>
          <div className={styles.metricChip}>
            <span>Reserved</span>
            <strong>{totals.reserved.toLocaleString()}</strong>
          </div>
          <div className={styles.metricChip}>
            <span>Available</span>
            <strong>{totals.available.toLocaleString()}</strong>
          </div>
          <div className={styles.metricChip}>
            <span>Location Count</span>
            <strong>{balances.length.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <ProductDetailsEditor key={product!.id} product={product!} />

      <section id="inventory" className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Inventory by Location</h3>
            <p>Review stock levels for this product across the business.</p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Location</th>
                <th>On Hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {balancesLoading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>Loading…</td>
                </tr>
              ) : balancesByLocation.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>No inventory balances found for this product.</td>
                </tr>
              ) : (
                balancesByLocation.map((balance) => (
                  <tr key={balance.id}>
                    <td>{locationMap[balance.location_id] ?? 'Unknown Location'}</td>
                    <td>{Number(balance.quantity_on_hand || 0)}</td>
                    <td>{Number(balance.quantity_reserved || 0)}</td>
                    <td className={styles.availableCell}>{Number(balance.quantity_available || 0)}</td>
                    <td className={styles.inlineActions}>
                      <Button type="button" variant="outline" size="sm" onClick={() => dispatch(openAdjustModal(product!.id))}>
                        Adjust
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => dispatch(openTransferModal(product!.id))}>
                        Transfer
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="sales" className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Sales History</h3>
            <p>Recent sales that include this product.</p>
          </div>
          <span>{formatMoney(totals.revenue)}</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sale</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>Loading…</td>
                </tr>
              ) : matchingSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>No recent sales found for this product.</td>
                </tr>
              ) : (
                matchingSales.map(({ sale, item }) => (
                  <tr key={sale.id}>
                    <td>
                      <div className={styles.cellCopy}>
                        <span className={styles.primaryCell}>{sale.sale_number}</span>
                        <span className={styles.secondaryCell}>{formatDateTime(sale.created_at)}</span>
                      </div>
                    </td>
                    <td>{locationMap[sale.location_id] ?? 'Unknown Location'}</td>
                    <td>{Number(item.quantity || 0)}</td>
                    <td className={styles.revenueCell}>{formatMoney(Number(item.line_total || 0))}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[sale.status] ?? ''}`}>
                        {STATUS_LABELS[sale.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="activity" className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Inventory Activity</h3>
            <p>Recent movement history for this product.</p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Location</th>
                <th>Type</th>
                <th>Delta</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>Loading…</td>
                </tr>
              ) : movementRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>No inventory activity yet for this product.</td>
                </tr>
              ) : (
                movementRows.map((movement) => (
                  <tr key={movement.id}>
                    <td>{formatDateTime(movement.created_at)}</td>
                    <td>{locationMap[movement.location_id] ?? 'Unknown Location'}</td>
                    <td>{movement.movement_type}</td>
                    <td className={Number(movement.quantity_delta || 0) < 0 ? styles.negativeDelta : styles.positiveDelta}>
                      {Number(movement.quantity_delta || 0)}
                    </td>
                    <td>{movement.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdjustStockModal />
      <TransferStockModal />
    </div>
  );
}
