
# React Performance Optimization Challenge

## Overview

This challenge is a React application intentionally designed with performance bottlenecks and bugs. Your objective is to identify these issues and optimize the application's performance, enhancing its responsiveness and efficiency while preserving its core functionality.

The application has the following features:
1. **List of Items**: A list of items is displayed.
2. **Search Filter**: Typing into the search box filters the displayed items.
3. **Item Selection**: Clicking an item highlights it.
4. **Total Items Selected**: The number of highlighted items is displayed at the top of the page.
5. **Last Selected Item**: The ID of the last selected (highlighted) item is displayed at the top of the page.


## Getting Started

### Installation

1. **Create a new repository from this template**:
   - Click the "Use this template" button on the top right of this repository's page to create your own copy of the repository.
2. Clone your newly created repository to your local machine and install the dependencies.
   ```bash
   npm install
   ```

### Running the Application
```bash
npm run dev
```

## Your Task
Your primary tasks are as follows:

### Performance Optimization:
- Analyze and identify performance issues: Examine the codebase and use tools such as React DevTools or browser profiling to pinpoint bottlenecks.
- Implement optimizations: Refactor and enhance the application’s performance without changing its existing functionality. Focus on improving responsiveness, minimizing unnecessary renders, and ensuring a smoother user experience.

### Bug Fixes:
[x] - **Fix Bug #1:** The "Last selected item ID" displays the incorrect ID. Ensure that the correct ID is shown when an item is clicked.
[x] - **Fix Bug #2:** There is a noticeable delay between selecting an item and seeing the "Total Items Selected" and the highlighted item indicator. Optimize this process so that the display updates immediately upon selection.

### Documentation:
**Explain your optimizations:** Create a short document explaining the performance issues you identified and how you addressed them. Highlight the key changes and their impact on the application's efficiency.

## Submission Guidelines
1. Create your own repository by using this template.
2. Once you have completed the optimizations and bug fixes:
    - Open a PR in your own repository with the changes you've made.
    - Include a detailed explanation of the issues you fixed and their cause, the optimizations you made, and any tools or techniques you used in the process.
    - Share the link to your repository along with the pull request.

---

## Notes from Tainan

### Performance Optimization

1. Debounce
When the user types in the search input, the application fetches the list of items for each key pressed. I added debounce (from lodash) library, so it'll fetch the list only after the user stops typing for 300ms.

2. Text Color
The text color was white, but the background was white too, so I changed the text color to black.

3. onSelectItem
The onSelectItem function was using an array, and that can be inefficient for large arrays. I replaced it with a Set().

4. setLastSelectedItemId
The setLastSelectedItemId function was using the old selectedItemIds array (before the new id was added). Now I'm getting it from the created Set().

5. Fetch List
I removed the sleep(500) while fetching the list. :)

6. ItemList + React.memo
I added React.memo to ItemList to prevent unnecessary re-render if props are not changed.

7. handleSelectItem + useCallback
I added useCallback to handleSelectItem to prevent unnecessary re-render if selectedItemIds are not changed.