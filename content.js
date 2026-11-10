// Adds a "Trending" button next to Home and Feed in the GitHub dashboard sidebar.
// Strategy: find the existing "Feed" item by its href, clone it (inherits GitHub's
// own styling), retarget it to /trending, and insert it right after. Re-run via
// MutationObserver because GitHub re-renders the sidebar on SPA navigation.

const GRAPH_ICON_PATH =
	'M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z';

// The <a> we clone from: prefer Feed, fall back to Home.
function findSourceLink() {
	return (
		document.querySelector('a[href="/feed"]') ||
		document.querySelector('a[href="/dashboard"]') ||
		document.querySelector('a[href="/"]')
	);
}

// Walk up from the link to the outermost element that wraps exactly this one
// link — that's the "item" we should clone so the new button sits as a sibling
// item, not stuffed inside the first one's wrapper.
function findItemWrapper(link) {
	let node = link;
	while (node.parentElement) {
		const parent = node.parentElement;
		if (parent.querySelectorAll('a').length !== 1) break;
		node = parent;
	}
	return node;
}

// Strip "currently on this page" markers so Trending never looks falsely active.
function clearActiveState(el) {
	el.removeAttribute('aria-current');
	el.removeAttribute('data-selected-links');
	for (const cls of [...el.classList]) {
		if (/selected|current|active|highlight|navactive/i.test(cls)) {
			el.classList.remove(cls);
		}
	}
}

function addTrendingButton() {
	const source = findSourceLink();
	if (!source) return;

	const item = findItemWrapper(source);
	const container = item.parentElement;
	if (!container) return;

	// Already added — nothing to do.
	if (container.querySelector('a[href="/trending"]')) return;

	const clone = item.cloneNode(true);
	const cloneLink = clone.matches('a') ? clone : clone.querySelector('a');
	if (!cloneLink) return;

	// Retarget the link.
	cloneLink.setAttribute('href', '/trending');
	cloneLink.setAttribute('data-trending-link', '');
	cloneLink.id = 'gtb-item-trending';
	clearActiveState(clone);
	clearActiveState(cloneLink);

	clone.dataset.itemId = 'trending';
	clone.dataset.analyticsEvent = JSON.stringify({
		category: 'DASHBOARD_LEFT_NAV',
		action: 'TRENDING',
		label: null,
	});

	// No pin on Trending — drop the pin button and its tooltip entirely.
	const pinButton = clone.querySelector('button[form="dashboard-homepage-pin-form"]');
	if (pinButton) pinButton.remove();
	const tooltip = clone.querySelector('tool-tip');
	if (tooltip) tooltip.remove();

	// Swap the icon to a graph (what GitHub uses for Trending).
	const svg = clone.querySelector('svg');
	if (svg) {
		svg.setAttribute('class', 'octicon octicon-graph');
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('viewBox', '0 0 16 16');
		svg.innerHTML = `<path d="${GRAPH_ICON_PATH}"></path>`;
	}

	// Swap every visible "Feed" text node to "Trending", whatever the markup.
	const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
	const textNodes = [];
	while (walker.nextNode()) textNodes.push(walker.currentNode);
	for (const node of textNodes) {
		if (/feed/i.test(node.nodeValue)) {
			node.nodeValue = node.nodeValue.replace(/feed/i, 'Trending');
		}
	}

	item.insertAdjacentElement('afterend', clone);
}

// Debounce: schedule one run per animation frame no matter how many mutations.
let scheduled = false;
function schedule() {
	if (scheduled) return;
	scheduled = true;
	requestAnimationFrame(() => {
		scheduled = false;
		try {
			addTrendingButton();
		} catch (err) {
			console.error('[github-trending-button]', err);
		}
	});
}

new MutationObserver(schedule).observe(document.documentElement, {
	childList: true,
	subtree: true,
});

addTrendingButton();
