'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import styles from './page.module.css';

const PAGE_SIZE = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LocationsPage() {
  const { data: locations = [], isLoading } = useGetLocationsQuery();
  const { data: me } = useGetMeQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const canManageLocations = Boolean(me?.permissions?.includes('locations.manage'));

  const totalPages = Math.max(1, Math.ceil(locations.length / PAGE_SIZE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pageLocations = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return locations.slice(start, start + PAGE_SIZE);
  }, [locations, safeCurrentPage]);

  const startItem = locations.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, locations.length);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Locations</h1>
          <p className={styles.subtitle}>
            Browse every business location and open a location profile to view focused analytics.
          </p>
        </div>

        <Link className={styles.createLink} href="/dashboard/locations/new">
          Create location
        </Link>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Location List</h2>
            <p>
              {isLoading ? 'Loading locations…' : `${locations.length} location${locations.length === 1 ? '' : 's'} total`}
            </p>
          </div>
          <span className={styles.cardMeta}>Page {safeCurrentPage} of {totalPages}</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Location ID</th>
                <th>Created</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>Loading locations…</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    No locations found. Add a location in your business setup to begin tracking analytics.
                  </td>
                </tr>
              ) : (
                pageLocations.map((location) => (
                  <tr key={location.id}>
                    <td>
                      <div className={styles.locationCopy}>
                        <span className={styles.locationName}>{location.name}</span>
                        <span className={styles.locationHint}>Open the profile to see branch analytics.</span>
                      </div>
                    </td>
                    <td className={styles.locationId}>{location.id}</td>
                    <td>{formatDate(location.created_at)}</td>
                    <td>{formatDate(location.updated_at)}</td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionGroup}>
                        <Link className={styles.viewLink} href={`/dashboard/locations/${location.id}`}>
                          View
                        </Link>
                        {canManageLocations ? (
                          <Link className={styles.secondaryViewLink} href={`/dashboard/locations/${location.id}/edit`}>
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && locations.length > 0 ? (
          <div className={styles.pagination}>
            <div className={styles.paginationSummary}>
              Showing {startItem} to {endItem} of {locations.length}
            </div>

            <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                >
                Previous
              </button>

              <div className={styles.pageNumbers} aria-label="Pagination pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.pageNumber} ${page === safeCurrentPage ? styles.pageNumberActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
