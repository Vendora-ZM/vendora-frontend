'use client';

import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, helpText, id, className, ...props }) => {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};

export const Textarea: React.FC<TextareaProps> = ({ label, error, helpText, id, className, ...props }) => {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className={`${styles.textarea} ${error ? styles.inputError : ''} ${className || ''}`}
        rows={3}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({ label, error, helpText, id, className, children, ...props }) => {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <select
        id={id}
        className={`${styles.select} ${error ? styles.inputError : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
      {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};
