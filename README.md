# AntimicrobialRx — Doctor's Clinical Decision Support System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-success.svg)](#offline-pwa)
[![No External Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20CDNs-teal.svg)](#architecture)
[![Clinical Protocols](https://img.shields.io/badge/Protocols-187%20Guidelines-indigo.svg)](#clinical-coverage)

A web-based clinical antimicrobial decision-support application designed for physicians, clinical residents, and healthcare professionals. Built upon the validated **Bangabandhu Sheikh Mujib Medical University (BSMMU)** Antimicrobial Guidelines, this application provides rapid point-of-care disease and medication lookup, structured 3-tier clinical navigation, one-click prescription order copying, and vital patient-safety route warnings.

---

> [!WARNING]
> ### ⚖️ MANDATORY CLINICAL & LEGAL DISCLAIMER
> **FOR LICENSED HEALTHCARE PROFESSIONAL & CLINICAL EDUCATIONAL USE ONLY.**
> 
> 1. **Clinical Decision Support, Not a Replacement for Clinical Judgement**: This tool is an informational reference guide based on institutional antimicrobial guidelines. It does not replace individualized clinical assessment, diagnostic workup, microbiology laboratory results, or infectious disease specialist consultation.
> 2. **Culture & Sensitivity (C&S)**: Empirical antimicrobial regimens must be evaluated daily and de-escalated or modified as soon as microbiological culture and antimicrobial susceptibility testing (AST) results become available.
> 3. **Organ Impairment & Dose Adjustments**: Dosages provided are standard adult/paediatric baselines. Clinicians **must** independently verify patient-specific renal function (e.g., eGFR / CrCl via Cockcroft-Gault), hepatic function (Child-Pugh score), weight/BSA, and therapeutic drug monitoring (TDM, e.g., Vancomycin, Aminoglycosides).
> 4. **Route of Administration**: Always verify the appropriate route of administration (e.g., slow IV infusion over 30–60 min, IV bolus, IM, or Oral) and drug-drug interactions before signing medication orders.
> 5. **Institutional Variations**: Antimicrobial resistance (AMR) epidemiology varies across geographic regions and hospital wards. Local antibiograms must take precedence over generalized protocols.

---

## 🌟 Key Clinical Features

- 🗂️ **Structured 3-Tier Clinical Taxonomy**:
  Navigate seamlessly through **10 Major Systems $\rightarrow$ Subsystems / Syndromes $\rightarrow$ Specific Diagnoses** (187 clinical guidelines spanning Adult and Paediatric medicine).
- 📋 **One-Click Prescription Order Copying**:
  Every single antimicrobial recommendation is structured into standard hospital order sheet formatting (e.g. `Inj. Meropenem (1 gm) 8 hourly for 7-10 days`) with dedicated **[ 📋 Copy ]** buttons.
- 💊 **Reverse Antimicrobial Medicine Index**:
  Reverse lookup by generic drug name (*Meropenem, Vancomycin, Colistin, Ceftriaxone, etc.*) to immediately view every clinical scenario where the drug is indicated, distinguishing Preferred vs. Alternative regimens.
- 📝 **Prescription Order Pad**:
  Tracks all copied medication orders during ward rounds, enabling doctors to review and copy all collected orders in one click into hospital EHRs or discharge summaries.
- 🎨 **5 Medical Color Themes**:
  Choose between **Clinical Teal**, **Midnight Navy**, **Cobalt Blue**, **Surgical Emerald**, and **Amethyst Purple**, each with full **Light & Dark Mode** support.
- ⚡ **100% Offline PWA (Zero External CDNs)**:
  Completely self-contained. All styles, fonts, and dataset records are bundled locally with a Service Worker. Works reliably in hospital basements and areas with zero internet reception.

---

## 🏥 Clinical Coverage (187 Protocols Across 10 Systems)

| Major Clinical System | Subsystems / Syndromes |
| :--- | :--- |
| 🫁 **Respiratory & ENT** | Upper Respiratory & ENT • Lower Respiratory (CAP, HAP, VAP, Abscess) • Paediatric Respiratory |
| 🧠 **Central Nervous System (CNS)** | Adult Meningitis & CNS • Paediatric CNS & Neonatal Meningitis |
| 🫀 **Gastrointestinal & Hepatobiliary** | Intra-abdominal & Peritonitis (SBP) • Biliary & Liver Abscess • Enteric GI • Portal HTN & Varices • Chronic Hepatitis B/C Genotypes • Paediatric GI |
| 🧪 **Kidney & Urinary Tract** | Upper & Lower UTI • Prostatic Infections • Urological Surgical Prophylaxis • Paediatric UTI |
| 🦠 **Systemic Sepsis & Tropical Diseases** | Severe Sepsis & Febrile Neutropenia • Tropical & Zoonotic (Malaria, Kala-azar, Leptospirosis) • Paediatric Sepsis |
| 🩹 **Dermatology & Musculoskeletal** | Skin & Soft Tissue (Cellulitis, Impetigo, Diabetic Foot) • Bone & Joint (Osteomyelitis, Septic Arthritis) • Surgical Site Infections |
| 🩺 **Obstetrics, Gynaecology & STIs** | STIs (Syphilis, Gonorrhoea, Chancroid) • Pelvic Inflammatory Disease (PID) • Vaginitis • Ob/Gyn Surgical Prophylaxis |
| 🦷 **Dental & Maxillofacial** | Odontogenic Infections • Oral Mucosal & Salivary Infections • Maxillofacial Trauma & Surgery |
| 👁️ **Ophthalmology (Eye)** | External Eye, Cornea & Conjunctiva • Deep Ocular & Orbital Infections |
| 👶 **Paediatric Surgery & Congenital** | Urogenital Reconstructive • Abdominal & Hirschsprung Surgery • Vascular & Soft Tissue |

---

## 🚀 Live Demo & Deployment

### GitHub Pages (Instant Hosting)
This repository is configured to be hosted directly on **GitHub Pages**:
1. Go to repository **Settings** $\rightarrow$ **Pages**.
2. Under **Build and deployment**, select `Deploy from a branch`.
3. Set branch to `main` and folder to `/ (root)`.
4. Click **Save**. Your live site will be accessible at:
   `https://eabkju.github.io/antimicrobial-rx/`

### Local / Hospital Intranet Deployment
Run anywhere using Python or any static HTTP server (no Node.js build steps required):

```bash
# Clone the repository
git clone https://github.com/eabkju/antimicrobial-rx.git
cd antimicrobial-rx

# Start local server on port 8080
python3 -m http.server 8080
```
Open `http://localhost:8080` or `http://<LAN-IP>:8080` from any device on the same local Wi-Fi.

---

## 📱 Mobile Installation (PWA)
1. Open the website on your smartphone or tablet browser (Chrome or Safari).
2. Tap the **"📲 Install App"** button in the header, or select **"Add to Home Screen"** from your browser menu.
3. The app will install to your device's home screen and run standalone without an active internet connection.

---

## 🛠️ Technology Stack
- **Architecture**: Single Page Application (SPA), Progressive Web App (PWA)
- **Styling**: Pure Standalone CSS (Tailwind-compatible design tokens, 0 external CDN requests)
- **Data Engine**: Synchronously loaded pre-indexed JSON dataset (`data.js` / `data.json`)
- **Service Worker**: Cache-first offline asset caching (`sw.js`)
- **Storage**: Browser `localStorage` for recent searches, order pad, and theme preferences

---

## 📜 License & Acknowledgements
- **Clinical Data Source**: Bangabandhu Sheikh Mujib Medical University (BSMMU) Antimicrobial Guideline.
- **License**: MIT License. Open source for medical learning, clinical education, and antimicrobial stewardship promotion.
