# github-trending-button

<img width="1315" height="492" alt="image" src="https://github.com/user-attachments/assets/4660edb3-5c11-40a4-833b-22e789cd2ff8" />

A tiny browser extension that adds a **Trending** button to the GitHub dashboard sidebar, right next to the **Home** and **Feed** buttons.

It only runs on the dashboard (`https://github.com/dashboard`) and feed (`https://github.com/feed`) pages.

## How it works

The content script:

1. Finds the existing **Feed** sidebar item by its `href` (`/feed`).
2. Clones the whole item, so it inherits GitHub's own styling.
3. Retargets the clone to `https://github.com/trending`, swaps the label and the icon, and clears any "currently active" markers.
4. Re-inserts it via a `MutationObserver` whenever GitHub re-renders the sidebar during SPA navigation.

The script re-checks the page path on every run, because client-side routing keeps content scripts alive after you navigate away from `/dashboard` or `/feed`.

The pin button and tooltip that GitHub renders on nav items are removed from the clone.

## License

MIT - see [LICENSE](LICENSE).
