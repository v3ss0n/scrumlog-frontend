<script lang="ts">
	import FloatingTask from '$lib/components/FloatingTaskInput/FloatingTaskInput.svelte';
	import List from '$lib/components/Backlog/list.svelte';
	import ListBox from '$lib/components/Backlog/listbox.svelte';
	import Listitem from '$lib/components/Backlog/listitem.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	import type { ProjectItems } from '$lib/types/sprintlog';
	const { user } = data;
	let owner_id: string;
	if (user != null) {
		owner_id = user.id;
	}
	let project_slug = $page.params.slug;

	import type {
		Backlog,
		BacklogPagination,
		PriorityEnum,
		ProgressEnum,
		StatusEnum,
		TagEnum
	} from '$lib/types/sprintlog';
	export const load = ({ params }) => {
		return {
			slug: params.slug
		};
	};
	// Import the Project type
	import { createQuery } from '@tanstack/svelte-query';
	import { getBacklogByPrjSlug, getProjects, getTaskByPrjSlug } from '$lib/api/sprintlog';
	import { Icon } from '@steeze-ui/svelte-icon';
	import {
		CheckmarkOutline,
		OverflowMenuVertical,
		Upgrade,
		UserAdmin,
		Calendar,
		DownToBottom,
		UpToTop
	} from '@steeze-ui/carbon-icons';
	const prjItems: ProjectItems[] = [
		{ text: 'Home', href: '#' },
		{ text: 'Projects', href: '/projects' },
		{ text: project_slug }
	];
	import { Paginator } from '@skeletonlabs/skeleton';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	$: taskTotal = 20;
	$: currentPageTask = 0;
	$: amountTask = 20;
	$: backlogTotal = 5;
	$: currentPageBacklog = 0;
	$: amountBacklog = 5;
	let order = 'desc';
	let intervalMs = 15000;

	$: tasks = createQuery<BacklogPagination, Error>({
		queryKey: ['refetch-tasks', currentPageTask, amountTask, order],
		queryFn: async () => {
			return await getTaskByPrjSlug($page.params.slug, currentPageTask, amountTask, order).then(
				(res) => {
					taskTotal = res.total;
					// currentPageTask = res.offset;
					console.log(taskTotal);
					return res;
				}
			);
		},
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		refetchInterval: intervalMs,
		cacheTime: 0
	});
	$: backlogs = createQuery<BacklogPagination, Error>({
		queryKey: ['refetch-backlogs', currentPageBacklog, amountBacklog, order],
		queryFn: async () => {
			return await getBacklogByPrjSlug(
				$page.params.slug,
				currentPageBacklog,
				amountBacklog,
				order
			).then((res) => {
				backlogTotal = res.total;
				console.log(backlogTotal);
				// currentPageBacklog = res.offset;
				return res;
			});
		},
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		refetchInterval: intervalMs,
		cacheTime: 0
	});
	$: taskPager = {
		offset: currentPageTask,
		limit: amountTask,
		size: taskTotal,
		amounts: [10, 20, 50]
	};
	$: backlogPager = {
		offset: currentPageBacklog,
		limit: 5,
		size: backlogTotal,
		amounts: [5]
	};
	function onTaskPageChange(e: CustomEvent): void {
		console.log('event:page', e.detail);
		currentPageTask = parseInt(e.detail);
	}

	function onTaskAmountChange(e: CustomEvent): void {
		console.log('event:amount', e.detail);
		amountTask = parseInt(e.detail);
	}
	function onBacklogPageChange(e: CustomEvent): void {
		console.log('event:page', e.detail);
		currentPageBacklog = parseInt(e.detail);
	}

	function onBacklogAmountChange(e: CustomEvent): void {
		console.log('event:amount', e.detail);
		amountBacklog = parseInt(e.detail);
	}
</script>

<!-- Scrollable container -->
<main id="page-content" class="flex flex-col w-full h-full overflow-auto">
	<section
		class="sticky top-0 variant-ringed rounded variant-glass-surface px-2 py-1 mx-1 space-x-4"
	>
		<Breadcrumb items={prjItems} />
	</section>
	<ListBox>
		<svelte:fragment slot="title">Sprint</svelte:fragment>
		<div class="grid grid-rows h-[70%] overflow-scroll">
			{#if $tasks.isSuccess}
				{#each $tasks.data.items as task}
					<Listitem backlog={task}>
						<Icon src={OverflowMenuVertical} size="18px" />
						<Icon src={DownToBottom} size="18px" />
						<Icon src={UserAdmin} size="18px" />
						<Icon src={Calendar} size="18px" />
						<Icon src={CheckmarkOutline} size="18px" />
					</Listitem>
				{/each}
			{/if}
		</div>
	</ListBox>
	<ListBox>
		<svelte:fragment slot="title">Backlog</svelte:fragment>
		<div class="grid grid-rows overflow-scroll mb-auto">
			{#if $backlogs.isSuccess}
				{#each $backlogs.data.items as backlog}
					<Listitem {backlog}>
						<Icon src={OverflowMenuVertical} size="18px" />
						<Icon src={UpToTop} size="18px" />
						<Icon src={UserAdmin} size="18px" />
						<Icon src={Calendar} size="18px" />
						<Icon src={CheckmarkOutline} size="18px" />
					</Listitem>
				{/each}
			{/if}
		</div>
	</ListBox>
	<footer class="sticky bottom-0 variant-ringed rounded variant-glass-surface p-2 mx-1">
		<FloatingTask {project_slug} {owner_id} />
	</footer>
</main>
<aside />
