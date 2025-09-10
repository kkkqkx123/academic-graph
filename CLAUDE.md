# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an academic chart visualization application built with Next.js 15, specializing in professional bar charts for scientific publications. The application supports creating, configuring, and exporting charts suitable for academic journals like Nature and IEEE.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build the application
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

### Frontend Structure
- **Main Component**: `components/chart-dashboard.tsx` - Central dashboard with tabbed interface
- **Configuration Panels**: Specialized components for different chart aspects:
  - `chart-config-panel.tsx` - Chart type, axes, and data configuration
  - `data-import-panel.tsx` - CSV/XML data import functionality
  - `label-panel.tsx` - Label management with scope-based positioning
  - `style-panel.tsx` - Visual styling and theming
  - `file-management-panel.tsx` - Project save/load operations
  - `chart-renderer.tsx` - Real-time chart preview

### API Routes
- `/api/data/import` - File upload and parsing (CSV, XML)
- `/api/chart/export` - Chart export to SVG/PNG formats
- `/api/files` - Project file management (CRUD operations)
- `/api/files/[id]` - Individual project file operations

### Data Models
The application uses TypeScript interfaces defined in `components/chart-dashboard.tsx`:
- `ChartConfig` - Complete chart configuration with nested objects
- `CsvRow` - Data structure for imported CSV data
- Supports complex configurations including grouped bars, styling, and academic-specific formatting

### Key Features
1. **Academic-Grade Charts**: Supports Nature/IEEE journal styling standards
2. **Data Import**: CSV data parsing with automatic type detection
3. **Advanced Styling**: Font families, colors, grid lines, and academic formatting
4. **Export Options**: SVG generation with PNG support planned
5. **Project Management**: Save/load configurations with metadata
6. **Label System**: Global and column-specific labeling with smart line breaks

## Configuration System

### Chart Configuration Structure
```typescript
interface ChartConfig {
  chart: {
    type: "bar" | "stacked-percentage"
    title: string
    xAxis: { label: string; unit: string; range: [number, number]; useDecimal: boolean; treatAsNumeric: boolean }
    yAxis: { label: string; unit: string; range: [number, number]; usePercent: boolean; treatAsNumeric: boolean }
    bars: Array<{ name: string; value: number | number[]; color?: string; group?: string }>
    groups?: Array<{ name: string; color?: string }>
    barGaps: { intraGroup: number; interGroup: number }
    gridLines: { opacity: number; thickness: number }
    globalLimits: { min: number; max: number; enabled: boolean }
  }
  labels: Array<{ id: string; text: string; scope: "global" | string; fontFamily: string; fontSize: number }>
  style: { theme: string; backgroundColor: string; fontFamily?: string; fontSize?: number }
}
```

### File Storage
- Project configurations stored as JSON in `./projects/` directory
- File naming convention: `{name}_{timestamp}.json`
- Metadata includes creation date, version, and project type

## Development Guidelines

### Component Architecture
- Uses shadcn/ui component library with custom styling
- Tab-based interface for different configuration aspects
- Real-time preview updates using React state management
- TypeScript for type safety throughout the application

### Data Processing
- CSV parsing with automatic number/string detection
- XML parsing for style configurations
- Client-side data processing with validation
- Support for academic data formats and standards

### Styling Approach
- Tailwind CSS with custom theme support
- Academic journal-specific themes (Nature, IEEE)
- Font family support for Times New Roman, Arial, etc.
- Responsive design with mobile considerations

### Error Handling
- Comprehensive error handling in API routes
- Graceful fallbacks for unsupported formats
- Development vs production error messaging
- File system operation safety

## Testing and Quality

### Code Quality
- ESLint configuration with Next.js and TypeScript rules
- Strict TypeScript settings for better type safety
- Component-based architecture for easier testing
- Consistent coding patterns across components

### Browser Support
- Modern browser support with ES2017 target
- SVG-based chart rendering for compatibility
- Responsive design for various screen sizes
- Client-side processing for better performance

## Deployment Notes

- Built with Next.js 15 for optimal performance
- Supports static export for deployment
- File system-based project storage
- No external database dependencies