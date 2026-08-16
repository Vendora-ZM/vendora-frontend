"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BUSINESS_CATEGORIES,
  getBusinessCategory,
} from "@/lib/business/businessTypes";
import styles from "./Header.module.css";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBusinessTypesOpen, setIsBusinessTypesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [selectedBusinessTypeCategory, setSelectedBusinessTypeCategory] =
    useState(BUSINESS_CATEGORIES[0].value);

  const activeBusinessCategory = useMemo(
    () => getBusinessCategory(selectedBusinessTypeCategory),
    [selectedBusinessTypeCategory],
  );
  const activeBusinessHighlights = useMemo(
    () => activeBusinessCategory.types.slice(0, 6),
    [activeBusinessCategory.types],
  );
  const productHighlights = [
    {
      title: "Point of Sale",
      text: "Sell from a smartphone, tablet, or computer with a fast checkout flow.",
    },
    {
      title: "Inventory management",
      text: "Track what is in stock, what is moving, and what needs to be reordered.",
    },
    {
      title: "AI Business Advisor",
      text: "Ask plain-English questions and get useful explanations from live business data.",
    },
    {
      title: "Sales analytics",
      text: "See sales by item, employee, payment type, category, and time period.",
    },
    {
      title: "Employee management",
      text: "Assign permissions and PIN access so every team member sees the right tools.",
    },
    {
      title: "CRM and loyalty",
      text: "Keep customer history, repeat visits, and discount-aware workflows in one place.",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsBusinessTypesOpen(false);
    setIsProductsOpen(false);
  };

  const toggleBusinessTypes = () => {
    setIsBusinessTypesOpen((open) => !open);
    setIsMobileMenuOpen(false);
    setIsProductsOpen(false);
  };

  const toggleProducts = () => {
    setIsProductsOpen((open) => !open);
    setIsMobileMenuOpen(false);
    setIsBusinessTypesOpen(false);
  };

  const chooseBusinessCategory = (value: string) => {
    setSelectedBusinessTypeCategory(value);
    setIsBusinessTypesOpen(true);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logos/vendora_logo_white_background.png"
            alt="Vendora"
            width={40}
            height={40}
            className={styles.logoImage}
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <Link href="/#features" className={styles.link}>
            Features
          </Link>
          <div className={styles.dropdownWrap}>
            <button
              type="button"
              className={`${styles.link} ${styles.dropdownButton} ${isProductsOpen ? styles.dropdownButtonActive : ""}`}
              onClick={toggleProducts}
              aria-expanded={isProductsOpen}
              aria-haspopup="true"
            >
              Products
            </button>

            {isProductsOpen && (
              <div className={styles.dropdownPanel}>
                <div className={styles.dropdownPanelHeader}>
                  <div>
                    <span className={styles.dropdownEyebrow}>
                      Vendora products
                    </span>
                    <h3 className={styles.dropdownTitle}>
                      A simple breakdown of what users get.
                    </h3>
                    <p className={styles.dropdownText}>
                      The platform is built around fast checkout, stock
                      visibility, clear reporting, and AI help that explains
                      what is happening in the business.
                    </p>
                  </div>
                  <Link
                    href="/#products"
                    className={styles.dropdownCta}
                    onClick={() => setIsProductsOpen(false)}
                  >
                    View the full section
                  </Link>
                </div>

                <div className={styles.productDropdownGrid}>
                  {productHighlights.map((item) => (
                    <article
                      key={item.title}
                      className={styles.productDropdownCard}
                    >
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.dropdownWrap}>
            <button
              type="button"
              className={`${styles.link} ${styles.dropdownButton} ${isBusinessTypesOpen ? styles.dropdownButtonActive : ""}`}
              onClick={toggleBusinessTypes}
              aria-expanded={isBusinessTypesOpen}
              aria-haspopup="true"
            >
              Business types
            </button>

            {isBusinessTypesOpen && (
              <div className={styles.dropdownPanel}>
                <div className={styles.dropdownPanelHeader}>
                  <div>
                    <span className={styles.dropdownEyebrow}>
                      Recommended business types
                    </span>
                    <h3 className={styles.dropdownTitle}>
                      {activeBusinessCategory.label}
                    </h3>
                    <p className={styles.dropdownText}>
                      {activeBusinessCategory.description}
                    </p>
                  </div>
                  <Link
                    href="/signup"
                    className={styles.dropdownCta}
                    onClick={() => setIsBusinessTypesOpen(false)}
                  >
                    Start with this type
                  </Link>
                </div>

                <div className={styles.dropdownLayout}>
                  <div className={styles.dropdownCategoryList}>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        className={`${styles.dropdownCategoryButton} ${selectedBusinessTypeCategory === category.value ? styles.dropdownCategoryButtonActive : ""}`}
                        onClick={() => chooseBusinessCategory(category.value)}
                      >
                        <strong>{category.label}</strong>
                        <span>{category.types.length} options</span>
                      </button>
                    ))}
                  </div>

                  <div className={styles.dropdownTypeList}>
                    {activeBusinessCategory.types.map((type) => (
                      <span key={type} className={styles.dropdownTypeChip}>
                        {type}
                      </span>
                    ))}
                    <div className={styles.dropdownHighlightRow}>
                      {activeBusinessHighlights.map((item) => (
                        <div
                          key={item}
                          className={styles.dropdownHighlightCard}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href="/#ai-advisor" className={styles.link}>
            AI Advisor
          </Link>
          <Link href="/#pricing" className={styles.link}>
            Pricing
          </Link>
          <Link href="/#contact" className={styles.link}>
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.actionsDesktop}>
          <Link
            href="/login"
            className={`${styles.actionLink} ${styles.outlineAction}`}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={`${styles.actionLink} ${styles.primaryAction}`}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.navMobile}>
            <Link
              href="/#features"
              className={styles.mobileLink}
              onClick={toggleMobileMenu}
            >
              Features
            </Link>
            <button
              type="button"
              className={styles.mobileLinkButton}
              onClick={() => setIsProductsOpen((open) => !open)}
            >
              Products
            </button>
            {isProductsOpen && (
              <div className={styles.mobileDropdown}>
                <div className={styles.mobileDropdownHeader}>
                  <strong>Vendora products</strong>
                  <span>
                    Point of Sale, inventory, AI, analytics, employees, CRM, and
                    multi-store tools.
                  </span>
                </div>
                <div className={styles.mobileDropdownChips}>
                  {productHighlights.map((item) => (
                    <span
                      key={item.title}
                      className={styles.mobileDropdownChip}
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              className={styles.mobileLinkButton}
              onClick={() => setIsBusinessTypesOpen((open) => !open)}
            >
              Business types
            </button>
            {isBusinessTypesOpen && (
              <div className={styles.mobileDropdown}>
                <div className={styles.mobileDropdownHeader}>
                  <strong>{activeBusinessCategory.label}</strong>
                  <span>{activeBusinessCategory.description}</span>
                </div>
                <div className={styles.mobileDropdownChips}>
                  {activeBusinessCategory.types.map((type) => (
                    <span key={type} className={styles.mobileDropdownChip}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/#ai-advisor"
              className={styles.mobileLink}
              onClick={toggleMobileMenu}
            >
              AI Advisor
            </Link>
            <Link
              href="/#pricing"
              className={styles.mobileLink}
              onClick={toggleMobileMenu}
            >
              Pricing
            </Link>
            <Link
              href="/#contact"
              className={styles.mobileLink}
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </nav>
          <div className={styles.actionsMobile}>
            <Link
              href="/login"
              className={`${styles.actionLink} ${styles.outlineAction} ${styles.mobileAction}`}
              onClick={toggleMobileMenu}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`${styles.actionLink} ${styles.primaryAction} ${styles.mobileAction}`}
              onClick={toggleMobileMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
