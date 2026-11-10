# github-trending-button

A tiny browser extension that adds a **Trending** button to the GitHub dashboard sidebar, right next to the **Home** and **Feed** buttons.

## How it works

Instead of hardcoding GitHub's internal CSS class names (which change constantly), the content script:

1. Finds the existing **Feed** sidebar item by its `href` (`/feed`).
2. Clones the whole item, so it inherits GitHub's own styling, hover states, and layout automatically.
3. Retargets the clone to `https://github.com/trending`, swaps the label and the icon, and clears any "currently active" markers.
4. Re-inserts it via a `MutationObserver` whenever GitHub re-renders the sidebar during SPA navigation.

The pin button and tooltip that GitHub renders on nav items are removed from the clone. The Trending button is just a plain link, and Home/Feed keep their own pins untouched.

## License

MIT - see [LICENSE](LICENSE).
