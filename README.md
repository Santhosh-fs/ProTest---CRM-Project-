# Lead Tracker CRM

A lightweight Lead Tracker CRM built for the Profitcast Developer Hiring Test. The application helps sales teams efficiently manage leads from initial contact to deal closure through a structured sales pipeline.

## Live Demo

🔗 https://testcrmproject.netlify.app/

## GitHub Repository

🔗 https://github.com/Santhosh-fs/ProTest---CRM-Project-/tree/main/Crm

---

## Overview

Profitcast manages a large number of leads generated through marketing campaigns. This CRM provides a simple and intuitive way for sales representatives to:

* Track lead information
* Monitor deal progress
* Manage follow-ups
* Update sales stages
* Filter leads by status
* Gain visibility into the sales pipeline

The application was designed with a strong focus on usability, speed, and practical sales workflows.

---

## Features

### Lead List View

Displays all leads in a clean and organized table.

Each lead contains:

* Lead Name
* Business Name
* Service Enquired
* City
* Estimated Monthly Ad Budget
* Current Stage
* Lead Owner
* Last Updated Date

---

### Lead Detail & Edit View

Users can view and update detailed information for each lead.

Additional fields include:

* Notes from previous conversations
* Next Follow-up Date
* Inline Stage Updates

This allows sales representatives to quickly record interactions and keep lead information up to date.

---

### Add New Lead

A streamlined lead creation form designed to be completed in under 60 seconds.

#### Required Fields

* Lead Name
* Business Name
* Service Enquired
* Stage

#### Optional Fields

* City
* Estimated Monthly Ad Budget
* Lead Owner
* Notes
* Follow-up Date

The form prioritizes speed while collecting the information most useful to a sales team.

---

### Stage-Based Filtering

Users can instantly filter leads by sales stage.

Supported stages:

* New
* Contacted
* Proposal Sent
* Negotiation
* Closed Won
* Closed Lost

This enables sales representatives to quickly focus on specific groups of leads.

---

### Pipeline Summary (Bonus)

Provides a high-level overview of the sales pipeline.

Includes:

* Lead count by stage
* Quick performance insights
* Visual representation of pipeline health

---

## Product Decisions

### Why These Stages?

The stages were selected to reflect a realistic sales process:

New → Contacted → Proposal Sent → Negotiation → Closed Won / Closed Lost

This provides better visibility than generic statuses such as "Pending" or "In Progress."

### Fast Data Entry

Sales teams often work with many leads each day. The lead creation flow was intentionally simplified to minimize friction and improve adoption.

### Preloaded Sample Data

Dummy leads are included to allow immediate testing without manually creating records.

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### State Management

* React Hooks

### Data Persistence

* Browser Local Storage

### Deployment

* Vercel / Netlify

---

## AI Tools Used

### Cursor AI

Cursor AI was used as the primary development assistant throughout the project.

Cursor helped with:

* Component generation
* UI scaffolding
* CRUD functionality
* Form validation
* State management
* Refactoring repetitive code
* Debugging and issue resolution

All generated code was carefully reviewed, tested, and modified where necessary before being included in the final solution.

---

## Project Structure

```text
src/
├── components/
│   ├── LeadTable
│   ├── LeadCard
│   ├── LeadForm
│   ├── StageFilter
│   └── PipelineSummary
│
├── pages/
│   ├── Dashboard
│   └── LeadDetails
│
├── data/
│   └── sampleLeads
│
├── hooks/
│   └── useLocalStorage
│
├── utils/
│   └── helpers
│
└── App.jsx
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/lead-tracker-crm.git
```

Move into the project directory:

```bash
cd lead-tracker-crm
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Assumptions

* Single-user CRM
* No authentication required
* Local storage used instead of a backend database
* Optimized for quick lead management
* Designed primarily for internal sales team usage

---

## Challenges & Learnings

The primary challenge was balancing development speed with product quality while working within a limited timeframe.

Key learnings included:

* Prioritizing core functionality before advanced features
* Designing forms that minimize user effort
* Structuring components for maintainability
* Effectively using AI tools while validating all generated code

---

## What I Would Add With One More Hour

Given an additional hour, I would:

1. Add lead source tracking (Meta Ads, Google Ads, Referral, Website, etc.).
2. Implement search functionality across leads.
3. Add a Kanban board view for pipeline management.
4. Create an activity timeline for lead interactions.
5. Connect the application to a backend database such as Supabase for real-time data persistence and multi-user support.

---

## Submission Checklist

✅ Public GitHub Repository

✅ Live Deployed Application

✅ README Documentation

✅ Explanation of AI Tools Used

✅ Future Improvements Section
