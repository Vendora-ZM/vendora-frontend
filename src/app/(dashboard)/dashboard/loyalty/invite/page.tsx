'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import {
  useCreateReferralCodeMutation,
  useGetReferralCodeQuery,
} from '@/lib/features/accounts/accountsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import styles from './page.module.css';

export default function LoyaltyInvitePage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const { data: referralCode } = useGetReferralCodeQuery(undefined, {
    skip: !me?.business_id,
  });
  const [createReferralCode, { isLoading: isCreatingReferralCode }] = useCreateReferralCodeMutation();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [note, setNote] = useState('We thought Vendora could be a great fit for your business.');
  const [origin, setOrigin] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const companyName = business?.name ?? me?.business_id ?? 'Merchant Store';

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (referralCode?.code && !promoCode) {
      setPromoCode(referralCode.code);
    }
  }, [promoCode, referralCode?.code]);

  const shareLink = useMemo(() => {
    if (!origin || !promoCode.trim()) return '';
    return `${origin}/signup?mode=register&promo_code=${encodeURIComponent(promoCode.trim())}`;
  }, [origin, promoCode]);

  const emailDraft = useMemo(() => {
    const greeting = contactName.trim() ? `Hi ${contactName.trim()},` : 'Hi there,';
    const bodyLines = [
      greeting,
      '',
      note.trim() || 'We would love for you to try Vendora.',
      '',
      shareLink ? `Use this referral link to sign up: ${shareLink}` : 'Use the referral link generated on the page.',
      promoCode.trim() ? `Referral code: ${promoCode.trim()}` : '',
      '',
      `Best,`,
      companyName,
    ];
    return bodyLines.filter(Boolean).join('\n');
  }, [companyName, contactName, note, promoCode, shareLink]);

  const copyText = async (text: string, successMessage: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setStatusMessage(successMessage);
  };

  const handleGenerate = async () => {
    try {
      const result = await createReferralCode({ code: promoCode.trim() || undefined }).unwrap();
      setPromoCode(result.code);
      setStatusMessage('Referral code saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create referral code.';
      setStatusMessage(message);
    }
  };

  if (meLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Vendora referrals</h1>
          <p className={styles.subtitle}>Loading your loyalty tools…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <h1 className={styles.title}>Vendora referrals</h1>
          <p className={styles.subtitle}>
            Invite another business to create a Vendora account and share a referral code that ties back to your
            business.
          </p>
          <div className={styles.heroActions}>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounts')}>
              Back to employees
            </Button>
            <Button type="button" variant="primary" onClick={handleGenerate} disabled={isCreatingReferralCode}>
              {isCreatingReferralCode ? 'Saving code…' : 'Save referral code'}
            </Button>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Business</span>
          <strong className={styles.statValue}>{companyName}</strong>
          <span className={styles.statHint}>This is the company that earns the referral credit.</span>
        </div>
      </div>

      {statusMessage ? <div className={styles.alert}>{statusMessage}</div> : null}

      <div className={styles.layout}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Shareable invite</h2>
              <p>Create a link or email draft for another business to sign up on Vendora.</p>
            </div>
          </div>

          <div className={styles.sectionNote}>
            This page is for loyalty and referral sharing. It does not create employee access inside your business.
          </div>

          <div className={styles.form}>
            <Input
              label="Partner business name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="Acme Traders"
              helpText="Optional. Used in the suggested email message."
            />

            <Input
              label="Partner email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="owner@partner.com"
              helpText="Optional. The page will not send email automatically."
            />

            <Input
              label="Referral code"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              helpText="This code can be entered during signup."
            />

            <Textarea
              label="Invite message"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              helpText="Edit the short note that will appear in your draft."
            />

            <div className={styles.actionRow}>
              <Button type="button" variant="outline" onClick={handleGenerate} disabled={isCreatingReferralCode}>
                {isCreatingReferralCode ? 'Saving…' : 'Save code'}
              </Button>
              <Button type="button" variant="outline" onClick={() => copyText(promoCode, 'Referral code copied.')}>
                Copy code
              </Button>
              <Button type="button" variant="primary" onClick={() => copyText(shareLink, 'Signup link copied.')}>
                Copy signup link
              </Button>
            </div>

            <div className={styles.previewCard}>
              <div>
                <span className={styles.previewLabel}>Signup link</span>
                <p>{shareLink || 'Your signup link will appear here once the page loads.'}</p>
              </div>
              <Link href={shareLink || '/signup'} className={styles.previewLink}>
                Open signup
              </Link>
            </div>

            <Textarea
              label="Suggested email"
              value={emailDraft}
              readOnly
              rows={8}
              helpText={contactEmail ? `Ready to send to ${contactEmail}.` : 'Copy this into your email app.'}
            />
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <section className={styles.infoCard}>
            <h2>How loyalty works</h2>
            <ol>
              <li>Create a referral code for your business.</li>
              <li>Share the signup link with another business.</li>
              <li>When they register, Vendora can track the referral back to you.</li>
            </ol>
            <p>
              This keeps business referrals separate from employee invitations, which live in the Employees area.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
