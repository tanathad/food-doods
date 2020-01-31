import { RecipesModel } from '../models/recipes';
import { compareHash } from '../util/compareHash';
import { hashIngredientList } from '../util/hashIngredientList';

const NUM_OF_RECIPES = 5;
const PER_PAGE = 25;

/**
 * Fetches 25 recipes from the DB at a time
 * Compares user's ingredients with the recipe's ingredients
 * Tries to find 5 recipes that exceeds the threshold
 * Repeats the above process until it finds 5 recipes above the threshold
 * @param ingredientIds - An array of ingredientIds of the user
 * @param threshold - A threshold that determines which recipes to return
 * @returns - First 5 recipes (or less than 5 recipes) from the DB that exceeds the threshold
 */

export const suggestRecipes = async (ingredientIds: number[], threshold: number) => {
    const hashIngredients = Number(hashIngredientList(ingredientIds));
    const retRecipes = [];
    let pageCount = 0;
    try {
        while (retRecipes.length < NUM_OF_RECIPES) {
            const recipes = await fetchRecipes(pageCount * PER_PAGE, PER_PAGE);
            if (recipes === null) {
                return retRecipes;
            }
            for (const recipe of recipes) {
                if (compareHash(recipes.hash, hashIngredients) >= threshold) {
                    retRecipes.push(recipe);
                }
                if (retRecipes.length === NUM_OF_RECIPES) {
                    return retRecipes;
                }
            }
            pageCount++;
        }
        return retRecipes;
    } catch (err) {
        throw new Error(err);
    }
};

const fetchRecipes = async (skip: number, limit: number) => {
    return await RecipesModel.find()
        .skip(skip)
        .limit(limit);
};