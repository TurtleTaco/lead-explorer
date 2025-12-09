# Job Explorer - UI Preview

## Page Layout

The Job Explorer page (`/dashboard/org/[orgId]/jobs`) displays job data in a beautiful, organized interface.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│  JOB EXPLORER                                               │
│  View and manage job search results                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 💼 Total Jobs│ 🔍 Searches  │ 👥 Users     │ 🏢 Org ID    │
│    37,436    │      1       │      1       │  org_36VF... │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TEAM MEMBERS                                               │
│  ┌──────────────────────────┐                              │
│  │ 👥 zac.amazonprime@...   │                              │
│  └──────────────────────────┘                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  JOB SEARCHES                                               │
│                                                             │
│  ▼ 🔍 gong                                   Dec 6, 2025   │
│     37,436 jobs • linkedin-jobs-scraper                     │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Senior Software Engineer                         │  │
│     │  🏢 Gong                                     [📷]  │  │
│     │                                                   │  │
│     │  📍 Remote   💼 Full-time   👔 Senior  💰 $150k  │  │
│     │                                                   │  │
│     │  📅 Posted: Dec 1, 2025   👥 50 applicants       │  │
│     │                                                   │  │
│     │  Join our team as a Senior Software Engineer...  │  │
│     │                                                   │  │
│     │  About the company: Gong is the leading...       │  │
│     │                                                   │  │
│     │  [🔗 View Job]  [Apply Now]  [🏢 Company]       │  │
│     └───────────────────────────────────────────────────┘  │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Product Manager                                  │  │
│     │  🏢 Gong                                     [📷]  │  │
│     │  ...                                             │  │
│     └───────────────────────────────────────────────────┘  │
│                                                             │
│     [Scrollable - 100 jobs per search]                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. **Header Section**
- Large "Job Explorer" title
- Subtitle describing the page purpose

### 2. **Stats Overview** (4 cards)
Each card shows:
- Icon (briefcase, search, users, building)
- Metric label
- Large number value

### 3. **Team Members Card**
- Card title: "Team Members"
- List of user email badges
- Each badge has a user icon and email

### 4. **Job Searches Accordion**
Each search term is an accordion item with:

**Collapsed State:**
- Search icon in colored background
- Search term in bold
- Job count and source
- Date badge on the right

**Expanded State:**
- Scrollable area (600px height)
- List of job cards

### 5. **Job Card** (for each job)
Beautiful card with:

**Header:**
- Job title (large, bold)
- Company name with building icon
- Company logo (if available)

**Badges Row:**
- 📍 Location
- 💼 Employment type
- 👔 Seniority level
- 💰 Salary

**Details Grid:**
- 📅 Posted date
- 👥 Applicant count

**Description:**
- Preview of job description (first 300 characters)

**Company Info:**
- "About the company" with full description (2 line clamp)

**Action Buttons:**
- Primary button: "View Job" with external link icon
- Outline button: "Apply Now"
- Ghost button: "Company" (LinkedIn)

## Color Scheme

The page uses the application's theme with:
- **Primary**: Accent color for icons, buttons, backgrounds
- **Secondary**: Muted colors for badges
- **Muted**: Gray tones for less important text
- **Background**: White/dark depending on theme
- **Card backgrounds**: Slightly elevated with shadow on hover

## Interactive Elements

### Hover Effects
- Job cards: Shadow increases on hover
- Buttons: Background color changes
- Links: Underline appears

### Click Actions
- Accordion items: Expand/collapse search results
- "View Job": Opens job posting in new tab
- "Apply Now": Opens application page in new tab
- "Company": Opens company LinkedIn in new tab

## Responsive Design

### Desktop (>768px)
- Stats in 4 columns
- Full-width job cards
- Side-by-side layout for job details

### Mobile (<768px)
- Stats in 1 column (stacked)
- Full-width job cards
- Stacked layout for job details
- Scrollable accordion content

## Empty States

### No Data Found
```
┌─────────────────────────────────────┐
│  NO DATA FOUND                      │
│                                     │
│  No job data found for this         │
│  organization. Please run a         │
│  migration first.                   │
└─────────────────────────────────────┘
```

### No Searches
```
┌─────────────────────────────────────┐
│  JOB SEARCHES                       │
│                                     │
│  No searches found                  │
└─────────────────────────────────────┘
```

## Accessibility Features

- ✅ Semantic HTML elements
- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Color contrast compliance
- ✅ Screen reader friendly

## Performance Optimizations

- Server-side rendering for initial data
- Limited to 100 jobs per search
- Lazy loading with scroll areas
- Optimized images (company logos)
- Efficient React rendering with keys

## Example Data Display

For a search term "gong" with 37,436 jobs:

1. **Stats show**: 37,436 total jobs, 1 search, 1 user
2. **User badge**: "zac.amazonprime@gmail.com"
3. **Accordion item**: "gong" with "37,436 jobs • linkedin-jobs-scraper"
4. **Job cards**: First 100 jobs from the search
5. **Each card**: Complete job information with all actions

## Navigation Flow

```
Dashboard → Sidebar → Job Explorer → Select Search → View Jobs → External Links
```

1. User lands on dashboard
2. Clicks "Job Explorer" in sidebar
3. Sees overview and list of searches
4. Clicks on a search term to expand
5. Scrolls through job listings
6. Clicks buttons to view jobs or apply
7. External job pages open in new tabs

## Technical Details

- **Framework**: Next.js 15 with React 19
- **UI Library**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Data Fetching**: Server-side with Supabase
- **Type Safety**: Full TypeScript support

