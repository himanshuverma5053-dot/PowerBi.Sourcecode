# Project Guidelines & Rules

## Image Assets Policy
- **Strict Prohibition on AI Image Generation**: Do not generate or modify images with AI under any circumstances (`generate_image` tool must NOT be used).
- **User-Provided Uploads Only**: Use only user-provided uploaded assets.
- **Placeholder Rule**: If no image is provided, display a clean placeholder instead of generating one.

## Payment Progress Bar Design Standard
- **Default Architecture**: The progress bar uses a unified pill capsule housing the dynamic fluid waves and milestone markers.
- **Integrated Downward Refresh Tab**: The refresh button is housed within a continuous downward-extending white tab situated directly beneath the bottom-right perimeter of the progress bar capsule, featuring a smooth concave fillet curve transition and a prominent blue refresh icon. Any future enhancements or changes to the progress bar must preserve this integrated downward tab structure as the standard default.

## Search Icon Standard
- **Default Search Icon**: The website standard search icon is the custom minimalist magnifying glass (`CustomSearchIcon` in `/src/components/SearchIcon.tsx` and `/public/magnifying-glass-search-icon.svg`), featuring a 45° diagonal handle pointing to the bottom-right, dual-tone handle shading, top-left outer rim dark accent, and circular lens geometry. All search inputs, widgets, filters, and trackers across the app must default to this icon.
