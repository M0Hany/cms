# Web Page Builder for Non-Developers

A visual code-based builder designed to help non-developers create rich webpages by combining pre-configured components through a drag-and-drop + live preview interface.

## 🎯 Overview

The Web Page Builder is a Next.js-based application that enables users to create professional web pages without writing code. It provides a user-friendly interface for assembling pages using pre-built components, with real-time preview and easy configuration options.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- pnpm (recommended) or npm

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd webpage-builder
```

2. Install dependencies
```bash
pnpm install
```

### Running the Application
- For development:
```bash
pnpm dev
```
This will start the development server at `http://localhost:3000`

- For production:
```bash
pnpm build
pnpm start
```
This will build the application and start it in production mode.

## 🧱 Core Features

### Interactive Preview Window
- Real-time preview of components and changes
- Drag-and-drop section reordering
- Component-specific delete and edit controls
- Responsive design preview (desktop/mobile)

### Component Management
- Add components through an intuitive dialog interface
- Pre-configured component templates with customizable options
- Support for custom HTML components
- Component configuration through user-friendly forms
- Automatic asset management (CSS/JS dependencies)

### Asset Management
The project includes a sophisticated asset management system that:
- Automatically injects required CSS and JavaScript dependencies
- Handles component-specific styles and scripts
- Ensures assets are loaded only once
- Manages interactive components initialization (e.g., Swiper carousels)

## 🧩 Available Components

### 1. Swiper Carousel
- Responsive image slider with mobile/desktop versions
- Configurable slides with links and alt text
- Auto-play functionality
- Navigation arrows and pagination

### 2. Four Categories
- Grid layout for showcasing 4 main categories
- Configurable background color
- Custom title support
- Image and link customization for each category

### 3. Eight Icons
- Display grid of 8 clickable icons
- Customizable images and subtitles
- Responsive layout
- Link support for each icon

### 4. Products Showroom
- Dynamic product display carousel
- Support for sale/discount indicators
- Category-based or manual product selection
- Automatic price formatting

## 🛠 Technical Architecture

### Component Registry
- Central registry for component templates
- Standardized component interface
- HTML generation from component configurations
- Component parsing and serialization

### HTML Generation
- Clean HTML output with component markers
- Support for custom components
- Automatic asset inclusion
- Component boundary detection

### Asset Registry
- Manages external CSS and JavaScript dependencies
- Handles script initialization timing
- Prevents duplicate asset loading
- Supports deferred script loading

## 💻 Usage

1. Click the "Add Component" button to select a component type
2. Configure the component using the provided dialog
3. Drag and drop to reorder components
4. Edit or delete components using the hover controls
5. Preview changes in real-time
6. Copy the generated HTML code with all required assets

## 🔧 Development

The project is built with:
- Next.js for the framework
- React for the UI
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- @hello-pangea/dnd for drag and drop functionality
