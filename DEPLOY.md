# Tezelate NDA — Auto-Send Signing App (Deploy Guide)

This is a tiny web app: a signing page **plus** a free serverless mailer so the signed PDF
emails itself to both founders automatically — the signer does nothing but sign.

```
nda-app/
├─ public/index.html     ← the signing page (edit address + county here)
├─ api/send-nda.js       ← serverless mailer (emails the PDF to both founders)
├─ package.json
└─ vercel.json
```

**Cost: $0.** Vercel Hobby (hosting + functions) and Resend (3,000 emails/month) are both free.

---

## Step 1 — Edit two values in the page
Open `public/index.html`, find `window.NDA_CONFIG`, and set:
- `TEZELATE_ADDRESS` → Tezelate's business address
- `VENUE_COUNTY` → your Texas county (e.g. `Travis`)

(The two recipient emails are already set and are used only as a backup.)

---

## Step 2 — Get a free Resend API key + verify your domain
1. Sign up at **resend.com** (free).
2. **Add & verify the domain `tezelate.com`**: Resend shows a few DNS records (SPF/DKIM) to add at
   your domain registrar / DNS host. This lets emails send *from* `nda@tezelate.com`. (One-time, ~10 min.)
   - If you can't verify the domain right away, change `FROM` in `api/send-nda.js` to
     `onboarding@resend.dev` for testing — but note that test sender only delivers to your own Resend signup email.
3. Create an **API key** and copy it.

---

## Step 3 — Deploy to Vercel (no command line needed)
1. Create a free **GitHub** account if you don't have one, make a new repo, and upload the contents
   of this `nda-app` folder to it.
2. Go to **vercel.com**, sign in with GitHub, click **Add New → Project**, and import that repo.
3. Before deploying, open **Environment Variables** and add:
   - Name: `RESEND_API_KEY`  ·  Value: *(the key from Step 2)*
4. Click **Deploy**. Vercel gives you a URL like `https://tezelate-nda.vercel.app`.

*(Prefer the command line? From this folder run `npx vercel` then `npx vercel --prod`, and add the
env var with `npx vercel env add RESEND_API_KEY`.)*

---

## Step 4 — Point your site button at it
On your MotoCMS landing page, add a **Button**:
- Text: **"Sign our NDA"**
- Link: your Vercel URL (e.g. `https://tezelate-nda.vercel.app`)
- Open in a **new tab**

Optional: in Vercel → Domains, attach `nda.tezelate.com` so the link is on-brand.

---

## Step 5 — Test
Open the deployed URL, sign with test details, submit. Confirm the signed PDF arrives in **both**
inboxes within a few seconds. (The signer also gets an automatic download of their own copy.)

---

## How delivery works
Signer signs → page builds the signed PDF (with IP + timestamp) → POSTs it to `/api/send-nda` →
the function emails it via Resend to **fhow@** and **cstagg@tezelate.com**. If the function is ever
unreachable, the page automatically falls back to opening the signer's email app as a backup, so a
signature is never lost.

## Legal note
Captures identity, consent (ESIGN/UETA), timestamp, and IP on the PDF — the basics of a valid
e-signature. Not a substitute for a dedicated platform's full audit trail, and not legal advice.
For investor agreements, a quick review by counsel is worthwhile.
