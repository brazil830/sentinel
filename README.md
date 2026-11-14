# SENTINEL Enterprise SOC

<div align="center">

```
  ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗     
  ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║     
  ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║     
  ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║     
  ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
  ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

**Next-Generation Security Operations, Threat Intelligence & Case Forensics Platform**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Compliance](https://img.shields.io/badge/Compliance-SOC_2_|_FedRAMP_|_SEC_17a--4-success.svg)](#audit--compliance)

</div>

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [What Problem It Solves](#what-problem-it-solves)
3. [How It Works](#how-it-works)
   - [Architectural Overview](#architectural-overview)
   - [Core Platform Modules](#core-platform-modules)
   - [Incident Response Playbook & Countermeasures](#incident-response-playbook--countermeasures)
   - [Threat Intelligence & Standards Support](#threat-intelligence--standards-support)
4. [Prerequisites](#prerequisites)
5. [Commands to Run Without Any Exceptions](#commands-to-run-without-any-exceptions)
   - [Quick Start (Recommended)](#quick-start-recommended)
   - [Detailed Step-by-Step Instructions](#detailed-step-by-step-instructions)
   - [Production Build & Verification](#production-build--verification)
6. [Demo Access Credentials](#demo-access-credentials)
7. [Project Structure](#project-structure)
8. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## Executive Overview

**SENTINEL Enterprise SOC** is an enterprise-grade Security Operations Center (SOC) management, cyber threat intelligence (CTI), and incident response platform. It brings disparate telemetry streams, threat vectors, active cases, forensic evidence, and remediation playbooks into a unified, high-fidelity command center.

Built with modern web technologies (**React 19, TypeScript, Tailwind CSS v4, and Vite**), SENTINEL provides security analysts and incident response teams with real-time correlation, dynamic attack graphing, live adversary breach simulations, and cryptographically verifiable audit trails.

---

## What Problem It Solves

Modern enterprise security teams face multi-vector, distributed cyber threats that easily evade traditional perimeter-only defenses. Real-world campaigns—such as the simulated **Northstar Treasury Business Email Compromise (BEC)** scenario—utilize sophisticated multi-stage tactics:

* **Targeted Smishing / Social Engineering:** Credential harvesting disguised as high-priority corporate communications.
* **Adversary-in-the-Middle (AiTM) Reverse Proxies:** Platforms like EvilProxy intercepting session cookies and bypassing multi-factor authentication (MFA).
* **Unauthorized High-Value Treasury Manipulation:** Hijacking valid authenticated sessions to issue fraudulent automated clearinghouse (ACH) / wire transfers (e.g., $348.2k rogue transfers).

### The Critical Challenges SENTINEL Addresses:

| Traditional SOC Pain Point | SENTINEL Enterprise Solution |
| :--- | :--- |
| **Alert Fatigue & Fragmented Data** | Aggregates and correlates telemetry from EDR, Cloud IAM, DNS firewalls, and banking logs into a single coherent incident view. |
| **High MTTR (Mean Time to Respond)** | Provides single-click active countermeasures: immediate host isolation, session token revocation, and DNS sinkholing. |
| **Tainted Evidence & Regulatory Risk** | Implements automated cryptographic chain-of-custody tracking with legal hold management adhering to **SOC 2 Type II, FedRAMP, and SEC Rule 17a-4**. |
| **Opaque Attack Trajectories** | Visualizes relationship graphs between threat actors, spoofed caller IDs, reverse proxies, victims, and financial sink nodes. |
| **Untested Incident Response Playbooks** | Features an interactive **Live Simulation Centre** allowing security engineers to rehearse attack scenarios at variable speeds and validate detection rules. |

---

## How It Works

### Architectural Overview

SENTINEL operates as an analyst-first, single-page application with reactive state synchronization across all security operations domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENTINEL Command Engine                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐           ┌──────────────┐           ┌──────────────────┐
│ Security     │           │ Threat Graph │           │ Evidence Lab     │
│ Overview     │           │ & Timeline   │           │ & Forensics      │
│ - Live SLA   │           │ - Nodes/Edges│           │ - Chain Custody  │
│ - Telemetry  │           │ - MITRE ATT&CK│          │ - Legal Holds    │
│ - Vectors    │           │ - Timeline   │           │ - IOC Ingestion  │
└──────┬───────┘           └──────┬───────┘           └────────┬─────────┘
       │                          │                            │
       └──────────────────────────┼────────────────────────────┘
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Active Response & Governance Layer                    │
│  - Countermeasure Killswitch (EDR Host Isolation / Token Revocation)   │
│  - ED25519-Chain Immutable Audit Ledger & Compliance Exporter         │
│  - Standardized Intel Bundles (STIX 2.1, Suricata, YARA)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Core Platform Modules

#### 1. Security Overview (`/overview`)
* **Live Incident Queue:** Real-time visibility into active triage cases, confidence scores, and SLA countdown timers.
* **SOC Telemetry CLI:** High-velocity query terminal filtering live events across endpoints, cloud providers, and identity logs.
* **Attack Vector Breakdown:** Visual distribution metrics spanning BEC/AiTM, Ransomware, Insider Threats, API Abuse, and Supply Chain vectors.

#### 2. Case Dossier (`/cases`)
* **Deep Incident Forensics:** Dedicated investigation dossier (e.g., `INC-2024-8841: Northstar Treasury BEC`).
* **MITRE ATT&CK Matrix Alignment:** Direct mapping against:
  * `T1566.002` (Spearphishing Link)
  * `T1111` (Multi-Factor Authentication Interception)
  * `T1556` (Modify Authentication Process)
  * `T1657` (Financial Theft)
* **One-Click Countermeasures:** Instant execution of host isolation, identity token revocation, and firewall sinkholes.

#### 3. Live Simulation Centre (`/simulation`)
* **4-Stage Attack Replay Engine:** Chronological breach progression modeling from SMS dispatch to the $348,200 wire fraud trigger.
* **Playback Controls:** Pause, restart, or step through scenarios at **1x, 2x, or 5x** execution speed.
* **Heuristics & Entity Radar:** Live status monitoring of identified threat actors, reverse-proxy C2s, and target beneficiaries.

#### 4. Threat Graph & Timeline (`/graph`)
* **Interactive Canvas:** Dynamic spatial graph rendering connections between Threat Actors, Phishing Domains, Proxies, Compromised Credentials, and Financial Sinks.
* **Correlated Incident Timeline:** Granular timestamped chronology of every attacker maneuver and defensive mitigation.

#### 5. Evidence Lab (`/lab`)
* **Indicator Ingestion:** Manual and automated ingestion of suspicious URLs, SMS text bodies, and transaction hashes.
* **Chain of Custody Enforcement:** SHA-256 fingerprinting and one-click **Legal Wire Holds**.
* **VirusTotal & Reputation Scoring:** Immediate lookup and telemetry categorization.

#### 6. Audit & Compliance (`/audit`)
* **ED25519-Signed Immutable Ledger:** Every analyst inspection, countermeasure, and export is recorded with cryptographic signatures (`SIG#...`).
* **Compliance Frameworks:** Pre-configured monitoring for **SOC 2 Type II, FedRAMP, and SEC Rule 17a-4**.
* **API Integration Health:** Verifies mutual TLS and sync status for CrowdStrike Falcon, Palo Alto Networks, Okta Identity Cloud, Splunk, and VirusTotal v3.

#### 7. Forensic Drawer
* Slide-out contextual inspector accessible anywhere across the platform to inspect raw JSON payloads, entity metadata, and execute immediate remediation.

---

### Threat Intelligence & Standards Support

SENTINEL allows instant export and sharing of standardized intelligence artifacts:
* **STIX 2.1 JSON:** Structured Threat Information Expression bundles for ingestion into SIEMs and TIPs.
* **Suricata IDS Rules:** Network signatures ready for deployment to firewall appliances.
* **YARA Rules:** File and memory scanning signatures identifying malicious proxy templates.
* **Signed Audit Bundles:** JSON audit archives containing cryptographic verification hashes.

---

## Prerequisites

Before running the application, ensure your environment meets the following specifications:

* **Node.js:** `v18.0.0` or higher (tested and verified on `v20.x`, `v22.x`, and `v24.x`)
* **Package Manager:** `npm` (v9 or higher, included with Node.js) or `pnpm`
* **Operating System:** Windows 10/11, macOS, or Linux

Verify your current versions:
```bash
node -v
npm -v
```

---

## Commands to Run Without Any Exceptions

Follow these exact commands to install dependencies, configure, and launch the application cleanly.

### Quick Start (Recommended)

Run the following commands in the project root directory:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Once started, open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

### Detailed Step-by-Step Instructions

#### Step 1: Clone or Navigate to the Workspace
Ensure your terminal or command prompt is located in the repository folder:
```bash
cd sentinel-enterprise-soc
```

#### Step 2: Clean Install Dependencies
Install all required runtime and development packages:
```bash
npm install
```
*(Optional: If using `pnpm`, run `pnpm install`)*

#### Step 3: (Optional) Set Environment Variables
The application runs standalone out of the box with comprehensive mock security datasets. If you wish to configure Gemini API integration or custom app URLs, create a `.env.local` file from the provided template:

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**On Linux / macOS:**
```bash
cp .env.example .env.local
```

Open `.env.local` and set your key if desired:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

#### Step 4: Run Static Type Checking (Zero Errors)
To verify that all TypeScript types compile without errors:
```bash
npm run lint
```
*Expected output: Process terminates with exit code 0 (`tsc --noEmit` passed).*

#### Step 5: Start the Development Server
Launch the Vite development server:
```bash
npm run dev
```

The output will confirm the local server address:
```
  VITE v8.x.x  ready in ~250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
  ➜  press h + enter to show help
```

---

### Production Build & Verification

To verify that the application compiles and bundles cleanly for production deployment:

```bash
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

The production assets will be generated in the `dist/` directory and served via the preview server.

---

## Demo Access Credentials

The platform features an enterprise operator authentication screen. Use the following pre-configured credentials to log in:

| Field | Value |
| :--- | :--- |
| **Email Address** | `admin@sentinel.io` |
| **Password** | `Sentinel@2026` |
| **Role** | Security Operations Lead (`S_JENSEN`) |

*(Alternatively, you can click **"Open workspace"** on the landing page header to access the sign-in modal.)*

---

## Project Structure

```
sentinel-enterprise-soc/
├── index.html                 # Main application HTML entry point
├── package.json               # Package dependencies, scripts, and metadata
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build & plugin configuration
├── .env.example               # Template for environment variables
├── src/
│   ├── main.tsx               # Application root bootstrapping
│   ├── App.tsx                # Master state controller & routing logic
│   ├── index.css              # Custom cybersecurity styling & theme variables
│   ├── components/
│   │   ├── ForensicDrawer.tsx # Slide-out inspector for IOCs and raw payloads
│   │   └── SeverityTag.tsx    # Standardized SOC severity pill component
│   ├── data/
│   │   └── sentinelData.ts    # Threat datasets, scenarios, graph nodes & templates
│   ├── types/
│   │   └── sentinel.ts        # TypeScript interfaces for incidents, graph, and logs
│   ├── utils/
│   │   └── exportHelpers.ts   # STIX 2.1, Suricata, YARA & JSON export utilities
│   └── views/
│       ├── LandingPage.tsx    # High-impact enterprise landing page
│       ├── LoginPage.tsx      # Authenticated operator portal
│       ├── OverviewView.tsx   # Incident queue, telemetry stream, and metrics
│       ├── CaseDossierView.tsx# Incident investigation and countermeasure panel
│       ├── SimulationView.tsx # 4-Stage breach replay simulation engine
│       ├── ThreatGraphView.tsx# Attack graph topology & timeline visualization
│       ├── EvidenceLabView.tsx# Chain-of-custody and evidence ingestion lab
│       └── AuditComplianceView.tsx # ED25519 audit ledger & compliance settings
```

---

## Troubleshooting & FAQs

### 1. Port 3000 Is Already in Use
If another process is running on port 3000, Vite will either offer the next available port (e.g., 3001) or you can specify a custom port:
```bash
npx vite --port=3050 --host=0.0.0.0
```

### 2. Node Version Incompatibility
If you encounter module resolution errors, verify that you are running Node.js `>= 18.0.0`:
```bash
node -v
```
If necessary, update your Node.js version via [nodejs.org](https://nodejs.org/) or using `nvm` (`nvm use 20` or `nvm use 22`).

### 3. Clear Dist or Cache
If you need to perform a clean rebuild:
```bash
# Delete build artifacts
npm run clean
# Or manually remove dist
rm -rf dist
```

---

<div align="center">
  <sub>Developed for Enterprise Incident Response &amp; Threat Intelligence Operations.</sub>
</div>

