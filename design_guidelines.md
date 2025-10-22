# Design Guidelines: CloudForge - Infrastructure Automation Platform

## Design Approach

**Selected Approach:** Design System with Developer Platform References

Drawing inspiration from GitHub's code-centric UI, Vercel's deployment dashboards, and Linear's modern productivity aesthetic, this platform prioritizes clarity, efficiency, and professional technical presentation. The design emphasizes information density without clutter, supporting complex workflows while maintaining visual calm.

**Core Principles:**
- Information hierarchy through typography and spacing, not color
- Dark mode as primary interface (light mode as alternative)
- Monospace fonts for all technical content
- Clear visual separation between input/configuration and output/results
- Immediate feedback for all system states

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 220 15% 8%
- Background Elevated: 220 15% 11%
- Background Interactive: 220 15% 15%
- Border Subtle: 220 10% 20%
- Border Interactive: 220 10% 30%
- Text Primary: 220 10% 95%
- Text Secondary: 220 5% 65%
- Text Muted: 220 5% 45%

**Accent Colors:**
- Primary (Action): 210 100% 55% (Blue for primary actions)
- Success: 142 70% 45% (Green for successful deployments)
- Warning: 38 90% 55% (Amber for pending/in-progress states)
- Error: 0 70% 55% (Red for failures)
- Code Syntax: Use standard VS Code Dark+ theme colors

**Light Mode:**
- Background Base: 0 0% 98%
- Background Elevated: 0 0% 100%
- Text Primary: 220 15% 15%
- Preserve accent colors with adjusted lightness for contrast

### B. Typography

**Font Families:**
- UI Text: Inter (Google Fonts) for all interface elements
- Code/Technical: JetBrains Mono (Google Fonts) for playbooks, logs, commands, file paths

**Type Scale:**
- Headings: text-3xl (30px) font-semibold for page titles
- Subheadings: text-xl (20px) font-medium for section headers
- Body: text-base (16px) for standard content
- Small: text-sm (14px) for metadata, labels
- Code: text-sm with font-mono for all technical content
- Micro: text-xs (12px) for timestamps, secondary info

**Hierarchy:**
- Page Titles: text-3xl with text-primary
- Section Headers: text-xl with text-primary and subtle border-b
- Card Titles: text-lg font-medium
- Labels: text-sm text-secondary uppercase tracking-wide

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8, py-12, px-16)

**Grid Structure:**
- Main Layout: Sidebar (16rem fixed) + Main Content (flex-1 with max-w-7xl)
- Card Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- Form Layouts: Single column with max-w-2xl for focused input
- Dashboard: 2-column split (60/40) for primary/secondary content

**Container Widths:**
- Full dashboard: max-w-7xl
- Forms/Wizards: max-w-2xl
- Code viewers: Full width with horizontal scroll
- Modals: max-w-4xl for deployment status, max-w-2xl for confirmations

### D. Component Library

**Navigation:**
- Top Bar: Fixed header with logo, navigation tabs, user menu (h-16 with border-b)
- Sidebar: Fixed left navigation showing workflow steps with progress indicators
- Breadcrumbs: Small text-sm with chevron separators for deep navigation

**Cards:**
- Standard: Rounded corners (rounded-lg), subtle border, elevated background
- Interactive: Hover state with border color shift and subtle scale transform
- Status Cards: Include colored left border (border-l-4) for state indication
- Deployment Cards: Show provider logo, status badge, timestamps

**Forms:**
- Input Fields: Dark background (bg-background-interactive), border on all sides
- Labels: text-sm text-secondary positioned above inputs with mb-2
- Text Areas: Monospace font for technical input (YAML, JSON)
- File Upload: Drag-and-drop zone with dashed border, centered icon and text
- Select Dropdowns: Custom styled with chevron icon, scrollable options list

**Buttons:**
- Primary: Solid blue background with white text (px-6 py-2.5 rounded-md)
- Secondary: Outlined with border-2, transparent background
- Ghost: Text only with hover background
- Danger: Red background for destructive actions
- Icon Buttons: Square (p-2) with centered icon, subtle hover background

**Code Display:**
- Syntax Highlighted Blocks: Dark background with line numbers, copy button in top-right
- Inline Code: Subtle background with monospace font
- Diff View: Green/red line highlighting for additions/removals
- Scrollable: Horizontal and vertical scroll for long content

**Progress & Status:**
- Step Indicator: Horizontal stepper with numbered circles, connecting lines
- Progress Bars: Thin (h-2) with rounded ends, animated stripe for active states
- Status Badges: Small pills with colored backgrounds (rounded-full px-3 py-1 text-xs)
- Deployment Timeline: Vertical timeline with timestamps, status icons, expandable details

**Data Displays:**
- Tables: Subtle row hover, sticky header, monospace for technical columns
- Log Viewer: Terminal-style with timestamps, log levels, auto-scroll toggle
- Metrics Display: Large numbers with small labels, trend indicators
- Resource List: Grid of cards showing cloud resources with status and actions

**Overlays:**
- Modals: Centered with backdrop blur, max-height with scroll
- Toasts: Top-right corner, auto-dismiss, color-coded by severity
- Tooltips: Small dark backgrounds on hover with arrow pointer
- Confirmation Dialogs: Centered modal with destructive action warnings

### E. Animations

**Minimal, Purposeful Motion:**
- Page transitions: None (instant navigation for speed)
- Card hover: Subtle border color transition (150ms)
- Loading states: Spinner or skeleton screens (no elaborate animations)
- Success feedback: Brief checkmark animation on completion
- Deployment progress: Smooth progress bar fills, pulsing for active states

---

## Images

**No hero images** - this is a utility-focused application where screen real estate is precious for technical information.

**Icon Usage:**
Use Heroicons (outline style) via CDN for all UI icons:
- Document icon for file uploads
- Cloud icons for provider selection (AWS, GCP, Azure branded logos)
- Check/X icons for status indicators
- Cog for settings
- Terminal for playbook execution
- Refresh for reload actions

**Provider Logos:**
Display official AWS, GCP, and Azure logos as small badges (h-6) in provider selection cards and deployment status views.

---

## Page-Specific Layouts

**Upload/Analysis Page:**
Central drag-and-drop zone (max-w-2xl centered) with supported format list below, recent uploads in sidebar

**Questionnaire Page:**
Stepped form with sidebar progress indicator, single question per step, large input areas, previous/next navigation at bottom

**Playbook Preview:**
Split view: File tree navigator (w-64) on left, code viewer with syntax highlighting on right, download/execute buttons in top-right toolbar

**Deployment Dashboard:**
Real-time log viewer (bottom 40% height), resource status grid (top 60%), pause/cancel controls in header, collapsible sections for configuration details

**Validation Results:**
Checklist-style display with passed/failed indicators, expandable error details, retry and finalize actions at bottom