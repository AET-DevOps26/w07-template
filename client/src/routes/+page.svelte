<script lang="ts">
    import "../app.css";
    import Icon from "@iconify/svelte";

    import FoodCard from './FoodCard.svelte';
    import MealFilter from './MealFilter.svelte';
    import type {Meal} from '$lib/types';
    import type {PageProps} from "./$types";
    import { setCookie } from '$lib';
    import { invalidateAll } from '$app/navigation';

    let {data}: PageProps = $props();

    // For more information on runes and reactivity, see: https://svelte.dev/docs/svelte/what-are-runes
    let meals: Meal[] = $state([]);
    // Seed (and re-seed after invalidateAll) from the load result.
    $effect.pre(() => {
        meals = data.meals;
    });

    let menuFilterEnabled: boolean = $derived(data.menuFilterEnabled);

    // Filter functionality (only active when feature toggle is enabled)
    let searchQuery: string = $state("");
    let showFilterPanel: boolean = $state(false);

    // Filter states
    let dietaryFilters = $state({
        vegetarian: false,
        vegan: false,
        containsMeat: false,
    });

    let filteredMeals: Meal[] = $derived(
        menuFilterEnabled ? meals.filter((meal) => {
            // Search query filter
            const searchMatch =
                searchQuery === "" ||
                meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meal.labels.some((label: string) =>
                    label.toLowerCase().includes(searchQuery.toLowerCase()),
                );

            // Dietary preference filters
            const dietaryMatch =
                (!dietaryFilters.vegetarian ||
                    meal.labels.includes("VEGETARIAN")) &&
                (!dietaryFilters.vegan || meal.labels.includes("VEGAN")) &&
                (!dietaryFilters.containsMeat ||
                    meal.labels.includes("MEAT") ||
                    meal.labels.includes("PORK"));

            return searchMatch && dietaryMatch;
        }) : meals
    );

    // Username modal state
    let usernameInput = $state('');
    let submitting = $state(false);
    let usernameInputEl: HTMLInputElement | undefined = $state();

    $effect(() => {
        if (data.needsUsername) usernameInputEl?.focus();
    });

    const submitUsername = async (event: SubmitEvent) => {
        event.preventDefault();
        const trimmed = usernameInput.trim();
        if (!trimmed) return;
        submitting = true;
        setCookie('username', trimmed, 30);
        await invalidateAll();
        submitting = false;
    };
</script>

{#if data.needsUsername}
    <div class="username-overlay" role="dialog" aria-modal="true" aria-labelledby="username-title">
        <form class="username-card" onsubmit={submitUsername}>
            <h2 id="username-title">Welcome 👋</h2>
            <p>Pick a username so we can remember your favorite meals.</p>
            <label for="username-input" class="visually-hidden">Username</label>
            <input
                id="username-input"
                type="text"
                bind:value={usernameInput}
                bind:this={usernameInputEl}
                placeholder="e.g. ani"
                autocomplete="off"
                required
            />
            <button type="submit" disabled={submitting || !usernameInput.trim()}>
                {submitting ? 'Saving…' : 'Continue'}
            </button>
        </form>
    </div>
{:else}
    <main>
        <header>
            <h1>Garching Campus Canteen</h1>
            <p>Today's menu offerings</p>
        </header>

        <!-- Recommendation Banner -->
        {#await data.recommendation}
            <div class="recommendation-banner loading">
                <div class="recommendation-content">
                    <h3>🤖 AI Recommendation</h3>
                    <p>Thinking about today's menu…</p>
                </div>
            </div>
        {:then recommendation}
            {#if recommendation?.recommendation}
                <div class="recommendation-banner">
                    <div class="recommendation-content">
                        <h3>🤖 AI Recommendation</h3>
                        <p>{recommendation.recommendation}</p>
                    </div>
                </div>
            {:else}
                <div class="recommendation-banner empty">
                    <div class="recommendation-content">
                        <h3>🤖 AI Recommendation</h3>
                        <p>No recommendations available. Try adding some favorite meals first!</p>
                    </div>
                </div>
            {/if}
        {:catch}
            <div class="recommendation-banner empty">
                <div class="recommendation-content">
                    <h3>🤖 AI Recommendation</h3>
                    <p>Couldn't reach the recommendation service.</p>
                </div>
            </div>
        {/await}

        <!-- Search and Filter UI (only shown when feature toggle is enabled) -->
        <!-- TODO only show when menuFilterEnabled is true, see below for if Svelte syntax -->

        {#if meals.length === 0}
            <div class="no-results">
                <p>No menu posted for today.</p>
            </div>
        {:else}
            <div class="food-grid">
                {#each meals as meal, i}
                    <!-- need to bind original meal object due to favorites and reactivity -->
                    {#if filteredMeals.includes(meal)}
                        <FoodCard bind:meal={meals[i]}/>
                    {/if}
                {/each}
            </div>
        {/if}

        {#if menuFilterEnabled && filteredMeals.length === 0 && meals.length > 0}
            <div class="no-results">
                No menu items match your filters. Try changing your selection.
            </div>
        {/if}
    </main>
{/if}
