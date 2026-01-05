<script lang="ts">
	import { goto } from '$app/navigation';

	let {
		isOpen = $bindable(false),
		userEmail = ''
	}: {
		isOpen?: boolean;
		userEmail?: string;
	} = $props();

	function closeSideMenu() {
		isOpen = false;
	}

	function navigateTo(path: string) {
		closeSideMenu();
		goto(path);
	}

	async function handleLogout() {
		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include'
			});

			if (response.ok) {
				goto('/login');
			}
		} catch (error) {
			console.error('Logout error:', error);
			alert('로그아웃 중 오류가 발생했습니다.');
		}
	}
</script>

<!-- Overlay -->
{#if isOpen}
	<div class="overlay" role="presentation" onclick={closeSideMenu} onkeydown={(e) => e.key === 'Escape' && closeSideMenu()}></div>
{/if}

<!-- Side Menu -->
<div class="side-menu" class:open={isOpen}>
	<!-- Header -->
	<div class="menu-header">
		<h2 class="menu-title">FoodLica</h2>
		<button type="button" class="close-btn" onclick={closeSideMenu} aria-label="메뉴 닫기">
			✕
		</button>
	</div>

	<!-- User Info -->
	{#if userEmail}
		<div class="user-section">
			<div class="user-icon">👤</div>
			<div class="user-email">{userEmail}</div>
		</div>
	{/if}

	<!-- Menu Items -->
	<nav class="menu-nav">
		<button type="button" class="menu-item" onclick={() => navigateTo('/profile')}>
			<span class="menu-icon">👤</span>
			<span class="menu-label">내 정보</span>
		</button>

		<button type="button" class="menu-item" onclick={() => navigateTo('/reviews')}>
			<span class="menu-icon">📝</span>
			<span class="menu-label">내 후기</span>
		</button>

		<button type="button" class="menu-item" onclick={() => navigateTo('/history')}>
			<span class="menu-icon">📍</span>
			<span class="menu-label">방문한 내역</span>
		</button>

		<div class="divider"></div>

		<button type="button" class="menu-item logout-item" onclick={handleLogout}>
			<span class="menu-icon">🚪</span>
			<span class="menu-label logout-label">로그아웃</span>
		</button>
	</nav>
</div>

<style>
	/* Overlay */
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Side Menu */
	.side-menu {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: white;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		transform: translateX(-100%);
		transition: transform 0.3s ease;
	}

	.side-menu.open {
		transform: translateX(0);
	}

	/* Header */
	.menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid #f5f5f5;
	}

	.menu-title {
		font-size: 1.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #999;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #4a4a4a;
	}

	/* User Section */
	.user-section {
		padding: 1.5rem;
		background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.user-email {
		font-size: 0.875rem;
		color: #4a4a4a;
		font-weight: 600;
		word-break: break-word;
	}

	/* Menu Navigation */
	.menu-nav {
		flex: 1;
		padding: 1rem 0;
		overflow-y: auto;
	}

	.menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
		position: relative;
	}

	.menu-item:hover {
		background: #f5f5f5;
	}

	.menu-icon {
		font-size: 1.25rem;
		width: 24px;
		text-align: center;
	}

	.menu-label {
		font-size: 0.9375rem;
		color: #4a4a4a;
		font-weight: 600;
	}

	/* Divider */
	.divider {
		height: 1px;
		background: #f5f5f5;
		margin: 0.5rem 1.5rem;
	}

	/* Logout Item */
	.logout-item:hover {
		background: #fff5f4;
	}

	.logout-label {
		color: #ffb4ab;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.side-menu {
			width: 80%;
			max-width: 320px;
		}
	}
</style>
