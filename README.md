# Dental SaaS Platform (OHIF Viewer Customization)

## Overview

This project is a customization of the OHIF Viewer to support a Dental Imaging workflow.

The solution introduces a dedicated Dental Mode built on top of OHIF's extension architecture while preserving the viewer's existing imaging capabilities.

### Implemented Features

* Dental-themed user interface
* Custom Practice Header
* Tooth Selector (FDI & Universal numbering systems)
* Custom Dental Mode
* Custom 2×2 Dental Hanging Protocol
* Dental Measurement Presets
* Automatic Measurement Labeling
* Dental Measurements Management Panel
* JSON Export of Measurements
* Viewer State Persistence Backend
* Authentication-Protected Viewer State API

---

# Repository Setup

## Base Repository

OHIF Viewer:

https://github.com/OHIF/Viewers

## Development Process

1. Forked the OHIF Viewer repository.
2. Cloned the fork locally.
3. Installed project dependencies.
4. Created a custom Dental Extension.
5. Created a dedicated Dental Mode.
6. Added a lightweight backend for authentication and viewer-state persistence.
7. Implemented custom hanging protocol and measurement workflow.

```bash
git clone <forked-repository-url>

cd Viewers

pnpm install
```

---

# Running Locally

## Prerequisites

* Node.js 24.17.0
* pnpm 11.5.2

Verify installation:

```bash
node -v
pnpm -v
```

---

## Install Dependencies

```bash
pnpm install --frozen-lockfile
```

---

## Start OHIF Viewer

```bash
pnpm dev
```

Viewer:

```text
http://localhost:3000
```

---

## Start Dental Backend

```bash
cd platform/server

npm install

npm start
```

Backend:

```text
http://localhost:4010
```

---

## Open Dental Mode

```text
http://localhost:3000/dental
```

Example study:

```text
http://localhost:3000/dental?StudyInstanceUIDs=<studyUID>
```

---

# Architecture

## Frontend

Built using:

* React
* TypeScript
* OHIF Viewer
* Cornerstone3D

### Custom Dental Extension

```text
extensions/dental/
```

Contains:

```text
components/
├── DentalPracticeHeader.tsx
├── DentalViewport.tsx
├── DentalMeasurementsPanel.tsx
└── DentalMeasurementPaletteDialog.tsx

state/
└── DentalStateContext.tsx

data/
└── teeth.ts
```

### Custom Dental Mode

```text
modes/dental/
```

Provides:

* Dental Route
* Dental Layout
* Dental Hanging Protocol
* Dental Viewport Registration
* Panel Configuration

---

## Backend

A lightweight Node.js backend was added to support:

### Authentication

```http
POST /api/auth/login
```

Provides token-based authentication.

### Viewer State Persistence

```http
GET /api/state
PUT /api/state
```

Persists:

* Theme
* Numbering System
* Selected Tooth
* Active Measurement Preset

---

# Feature Details

## 1. Dental Theme

Implemented a dental-focused user experience.

### Features

* Warm Clinical Theme
* Clinical Theme
* Runtime Theme Switching
* Dental Branding

### Components

* DentalStateContext
* DentalPracticeHeader

---

## 2. Custom Practice Header

Replaced the default OHIF header with a dental-specific header.

### Displays

* Practice Name
* Patient Name
* Patient ID
* Patient Sex
* Date of Birth
* Tooth Selector
* Theme Toggle
* Measurements Launcher

---

## 3. Tooth Selector

Supports both dental numbering standards.

### FDI Numbering

```text
11 12 13 ...
21 22 23 ...
```

### Universal Numbering

```text
1 2 3 ... 32
```

The selected tooth is displayed within active image viewports and associated with measurement presets.

---

## 4. Dental Hanging Protocol

Implemented a custom 2×2 layout.

### Layout

| Position     | Description          |
| ------------ | -------------------- |
| Top Left     | Current Image        |
| Top Right    | Prior Exam           |
| Bottom Left  | Bitewing Placeholder |
| Bottom Right | Bitewing Placeholder |

### Enhancements

* Current Image Overlay
* Prior Exam Overlay
* Tooth Indicator Overlay
* Custom Placeholder Panels

---

## 5. Dental Measurement Presets

Implemented preset-driven dental measurements.

### Presets

* PA Length
* Canal Angle
* Crown Width
* Root Length

### Workflow

1. Open Measurements dialog.
2. Select a dental preset.
3. Corresponding OHIF measurement tool becomes active.
4. Draw measurement.
5. Measurement is automatically labeled.
6. Measurement appears in the Dental Measurements panel.

---

## 6. Dental Measurements Panel

Custom right-side management panel.

### Features

* Measurement Listing
* Search / Filtering
* Sorting
* Preset Awareness
* Tooth Association
* Measurement Metadata
* JSON Export

### Example

```text
Tooth 13 · PA Length
1229 px
```

---

## 7. Measurement Export

Measurements can be exported as JSON.

Example:

```json
{
  "exportedAt": "2026-06-20T10:00:00Z",
  "measurementCount": 3,
  "measurements": []
}
```

This enables future reporting and integration workflows.

---

## 8. Viewer State Persistence

Implemented authenticated persistence of viewer preferences.

Persisted state includes:

* Theme
* Numbering System
* Selected Tooth
* Active Measurement Preset

The state is restored automatically when the viewer reloads.

---

# Challenges Encountered

## Hanging Protocol Registration

Initial issue:

```text
No protocol found
```

### Resolution

* Registered custom hanging protocol module
* Updated protocol identifiers
* Connected Dental Mode to custom protocol

---

## Custom Viewport Integration

Challenges:

* Maintaining Cornerstone functionality
* Preserving viewport lifecycle
* Passing display sets correctly
* Maintaining servicesManager references

### Resolution

Created a custom DentalViewport wrapper around OHIFCornerstoneViewport.

---

## Measurement Tool Activation

Initial issue:

Measurement presets updated application state but did not activate measurement tools.

### Resolution

* Connected presets to OHIF commands infrastructure
* Activated Cornerstone tools programmatically
* Ensured automatic labeling workflow

---

## React Context Integration

Initial issue:

```text
useDentalState must be used within DentalStateProvider
```

### Resolution

Wrapped custom dental components within DentalStateProvider and restructured layout hierarchy.

---

# Known Limitations

* Sample studies are not dental-specific DICOM datasets.
* Prior exam currently reuses available matching display sets.
* Measurement units depend on DICOM metadata availability.
* Bitewing panels are placeholders.
* Measurement annotations are not persisted across page refreshes.
* Backend currently persists viewer state only (theme, tooth selection, presets).

---

# Future Improvements

* Dental-specific DICOM datasets
* Annotation persistence
* DICOM SR export/import
* Tooth-specific measurement history
* Dental reporting workflows
* Multi-study comparison support
* Bitewing image assignment workflow
* PDF export
* Database-backed persistence

---

# Screenshots

## Dental Header

(Custom Screenshot)

## 2×2 Dental Layout

(Custom Screenshot)

## Measurement Presets

(Custom Screenshot)

## Dental Measurements Panel

(Custom Screenshot)

---

# Author

Dental SaaS Platform Technical Assessment

Built using:

* OHIF Viewer
* React
* TypeScript
* Cornerstone3D
* Node.js
* pnpm
