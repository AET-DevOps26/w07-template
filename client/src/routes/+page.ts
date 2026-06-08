import type { PageLoad } from './$types';
import { BaseURL } from '$lib/env';
import type { Meal, Recommendation, UserPreferences } from '$lib/types';
import { getCookie } from '$lib';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
    const username = getCookie('username');

    if (!username) {
        return {
            needsUsername: true,
            username: null,
            meals: [] as Meal[],
            recommendation: undefined as Promise<Recommendation | null> | undefined,
            menuFilterEnabled: false,
        };
    }

    // Fast paths: meals + preferences. Await these so the page can render
    // the menu without flicker.
    const [mealsResult, preferencesResult] = await Promise.allSettled([
        fetch(`${BaseURL}/mensa-garching/today`).then((res) => res.json()),
        fetch(`${BaseURL}/preferences/${username}`).then((res) => res.json()),
        // TODO fetch the feature toggle state for the menu filter
    ]);

    const meals: Meal[] = mealsResult.status === 'fulfilled' ? mealsResult.value : [];
    const preferences: UserPreferences =
        preferencesResult.status === 'fulfilled'
            ? preferencesResult.value
            : { favoriteMeals: [] };

    // TODO change the following line to fetch the feature toggle state for the menu filter
    const menuFilterEnabled: boolean = false;

    meals.forEach((meal: any) => {
        meal.favorite = preferences.favoriteMeals.includes(meal.name);
    });

    // Slow path: the LLM recommendation. Return the promise *unawaited* so
    // SvelteKit streams it to the page — the rest renders immediately and
    // the banner updates when LM Studio finishes.
    const recommendation: Promise<Recommendation | null> = fetch(
        `${BaseURL}/recommend/${username}`,
    )
        .then((res) => (res.ok ? (res.json() as Promise<Recommendation>) : null))
        .catch(() => null);

    return { needsUsername: false, username, meals, recommendation, menuFilterEnabled };
};
