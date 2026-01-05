<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	type SheetState = 'collapsed' | 'half' | 'full';

	let sheetState = $state<SheetState>('half');
	let isDragging = $state(false);
	let startY = $state(0);
	let currentY = $state(0);
	let sheetElement: HTMLDivElement;

	const heights = {
		collapsed: 60,
		half: 40, // 40vh
		full: 85 // 85vh
	};

	function getHeightForState(state: SheetState): string {
		return `${heights[state]}${state === 'collapsed' ? 'px' : 'vh'}`;
	}

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		startY = e.touches[0].clientY;
		currentY = startY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		currentY = e.touches[0].clientY;
	}

	function handleTouchEnd() {
		if (!isDragging) return;

		const deltaY = currentY - startY;
		const threshold = 50;

		if (deltaY > threshold) {
			// Swipe down
			if (sheetState === 'full') {
				sheetState = 'half';
			} else if (sheetState === 'half') {
				sheetState = 'collapsed';
			}
		} else if (deltaY < -threshold) {
			// Swipe up
			if (sheetState === 'collapsed') {
				sheetState = 'half';
			} else if (sheetState === 'half') {
				sheetState = 'full';
			}
		}

		isDragging = false;
		startY = 0;
		currentY = 0;
	}

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		startY = e.clientY;
		currentY = startY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		currentY = e.clientY;
	}

	function handleMouseUp() {
		if (!isDragging) return;

		const deltaY = currentY - startY;
		const threshold = 50;

		if (deltaY > threshold) {
			if (sheetState === 'full') {
				sheetState = 'half';
			} else if (sheetState === 'half') {
				sheetState = 'collapsed';
			}
		} else if (deltaY < -threshold) {
			if (sheetState === 'collapsed') {
				sheetState = 'half';
			} else if (sheetState === 'half') {
				sheetState = 'full';
			}
		}

		isDragging = false;
		startY = 0;
		currentY = 0;
	}

	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<div
	bind:this={sheetElement}
	class="bottom-sheet"
	class:collapsed={sheetState === 'collapsed'}
	class:half={sheetState === 'half'}
	class:full={sheetState === 'full'}
	style="height: {getHeightForState(sheetState)};"
>
	<div
		class="sheet-handle"
		role="button"
		tabindex="0"
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<div class="handle-bar"></div>
	</div>

	<div class="sheet-content">
		{@render children()}
	</div>
</div>

<style>
	.bottom-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 20px 20px 0 0;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1000;
		display: flex;
		flex-direction: column;
	}

	.sheet-handle {
		padding: 12px;
		cursor: grab;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
	}

	.sheet-handle:active {
		cursor: grabbing;
	}

	.handle-bar {
		width: 48px;
		height: 4px;
		background: #e0e0e0;
		border-radius: 2px;
	}

	.sheet-content {
		flex: 1;
		overflow-y: auto;
		padding: 0 20px 20px 20px;
	}

	.collapsed .sheet-content {
		overflow: hidden;
	}
</style>
