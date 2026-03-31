You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
docks.tsx
import { Sun, Moon, Settings } from 'lucide-react';

export const Component = () => {

  return (
    <div
      className="
        inline-flex rounded-lg overflow-hidden relative
        bg-white/20 dark:bg-black/40
        backdrop-blur-md
        shadow-lg shadow-black/20
        border border-gray-300 dark:border-black/60
        transition-colors duration-500
      "
    >
      <button
        className="
          px-4 py-2 rounded-l-lg
          flex items-center gap-2
          text-black dark:text-white
          bg-transparent
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-300 dark:border-black/60
          group
        "
        aria-label="Toggle Light Mode"
      >
        <Sun
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none">Light</span>
      </button>

      <button
        className="
          px-4 py-2
          flex items-center gap-2
          text-black dark:text-white
          bg-transparent
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-300 dark:border-black/60
          group
        "
        aria-label="Toggle Dark Mode"
      >
        <Moon
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none">Dark</span>
      </button>

      <button
        className="
          px-4 py-2 rounded-r-lg
          flex items-center gap-2
          text-black dark:text-white
          bg-transparent
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors duration-300
          focus:outline-none focus:ring-0
          group
        "
        aria-label="Open Settings"
      >
        <Settings
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none">Settings</span>
      </button>
    </div>
  );
};


demo.tsx
import { Component } from "@/components/ui/docks";

const DemoOne = () => {
  return <Component />;
};

export { DemoOne };

```

Install NPM dependencies:
```bash
lucide-react
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

