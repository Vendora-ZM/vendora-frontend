'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppSelector } from '@/lib/store';
import {
  useCreateRoleMutation,
  useGetPermissionsQuery,
} from '@/lib/features/accounts/accountsApi';
import styles from '../../page.module.css';

type RoleFormState = {
  name: string;
  description: string;
  permissions: string[];
};

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [roleForm, setRoleForm] = useState<RoleFormState>({
    name: '',
    description: '',
    permissions: [],
  });

  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const authPermissions = useAppSelector((state) => state.auth.permissions);
  const canManageAccounts = Boolean(
    me?.permissions?.includes('users.manage') || authPermissions.includes('users.manage')
  );
  const { data: permissions = [], isLoading: permissionsLoading } = useGetPermissionsQuery(undefined, {
    skip: !canManageAccounts,
  });

  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();

  const companyName = business?.name ?? me?.business_id ?? 'Merchant Store';
  const groupedPermissions = useMemo(() => permissions, [permissions]);

  const handleRoleToggle = (permissionCode: string) => {
    setRoleForm((current) => ({
      ...current,
      permissions: toggleValue(current.permissions, permissionCode),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      await createRole({
        name: roleForm.name,
        description: roleForm.description || null,
        permission_codes: roleForm.permissions,
      }).unwrap();

      setStatusMessage(`Created role "${roleForm.name}".`);
      setRoleForm({ name: '', description: '', permissions: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create role.';
      setStatusMessage(message);
    }
  };

  if (!meLoading && !canManageAccounts) {
    return (
      <div className={styles.page}>
        <section className={styles.accessDeniedCard}>
          <div className={styles.accessDeniedHeader}>
            <span className={styles.accessDeniedEyebrow}>Access required</span>
            <h1 className={styles.title}>Create role</h1>
            <p className={styles.subtitle}>
              Your current role does not include <code>users.manage</code>. A system administrator can grant that
              permission or move you to a role that already has it.
            </p>
          </div>

          <div className={styles.accessDeniedBody}>
            <p className={styles.accessDeniedLead}>What to ask for</p>
            <div className={styles.accessDeniedSteps}>
              <div className={styles.accessDeniedStep}>
                <strong>Edit your role</strong>
                <span>Add <code>users.manage</code> to the role attached to your account.</span>
              </div>
              <div className={styles.accessDeniedStep}>
                <strong>Or reassign your account</strong>
                <span>Move your user account to an existing role that already has account management access.</span>
              </div>
            </div>
          </div>

          <div className={styles.accessDeniedActions}>
            <Link className={styles.inlineLink} href="/dashboard/accounts">
              Back to employees
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Create role</h1>
          <p className={styles.subtitle}>
            Define a new role for {companyName}. Keeping this page separate makes it easier to focus on the exact
            permissions you want to add.
          </p>
          <div className={styles.headerActions}>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounts')}>
              Back to employees
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounts?tab=roles')}>
              Back to roles
            </Button>
          </div>
        </div>
      </div>

      {statusMessage ? <div className={styles.alert}>{statusMessage}</div> : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>New role</h2>
              <p>Choose a name and assign the permissions that belong to the role.</p>
            </div>
          </div>

          <div className={styles.sectionNote}>
            This page only creates roles. Editing an existing role stays in the Roles tab on the accounts page.
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              id="role-name"
              label="Role name"
              value={roleForm.name}
              onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
              required
            />

            <Textarea
              id="role-description"
              label="Description"
              value={roleForm.description}
              onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
              helpText="Optional. Give the role a short explanation of what it is for."
            />

            <div className={styles.permissionCard}>
              <div className={styles.multiSelectHeader}>
                <div>
                  <label className={styles.label}>Permissions</label>
                  <p className={styles.helperText}>Assign one or more capabilities to this role.</p>
                </div>
              </div>

              <div className={styles.checkboxGrid}>
                {permissionsLoading ? (
                  <p className={styles.emptyCell}>Loading permissions…</p>
                ) : groupedPermissions.length === 0 ? (
                  <p className={styles.emptyCell}>No permissions available.</p>
                ) : (
                  groupedPermissions.map((permission: { code: string; description?: string | null }) => (
                    <label key={permission.code} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(permission.code)}
                        onChange={() => handleRoleToggle(permission.code)}
                      />
                      <span>
                        <strong>{permission.code}</strong>
                        {permission.description ? <small>{permission.description}</small> : null}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button type="submit" disabled={creatingRole || permissionsLoading}>
              {creatingRole ? 'Creating role…' : 'Create role'}
            </Button>
          </form>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>What happens next</h2>
                <p>Once the role exists, you can assign it to employees from the employees page.</p>
              </div>
            </div>

            <div className={styles.form}>
              <div className={styles.sectionNote}>
                Creating a role here keeps the accounts tab focused on browsing and editing existing roles only.
              </div>

              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounts')}>
                Back to accounts
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
