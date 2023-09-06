"""
API for Recipe Keeper Application.

This module provides endpoints for CRUD operations on recipes.
It uses a JSON file for storage, and FastAPI for the web server.
"""

import os.path
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECIPES_FILE = "recipes.json"


def load_recipes():
    """
    Load recipes from JSON file into memory.

    If the JSON file does not exist, it initializes an empty list.

    Returns:
        list: A list of recipes.
    """
    if not os.path.exists(RECIPES_FILE):
        save_recipes([])

    with open(RECIPES_FILE, "r") as file:
        return json.load(file)


def save_recipes(recipes):
    """
    Save the current state of recipes into JSON file.

    Args:
        recipes (list): List of recipes to save.
    """
    with open(RECIPES_FILE, "w") as file:
        json.dump(recipes, file)


class Recipe(BaseModel):
    """Recipe Model.

    Attributes:
        id (int): Recipe identifier.
        name (str): Name of the recipe.
        ingredients (list[str]): List of ingredients for the recipe.
    """
    id: int = None
    name: str
    ingredients: list[str]
    steps: str
    image: str


@app.get("/recipes")
def read_recipes():
    """Retrieve all recipes."""
    return load_recipes()


@app.get("/search")
async def search_results(value: str = ""):
    """ return search results"""
    recipes = load_recipes()
    search_results = [recipe for recipe in recipes if value.lower() in recipe['name'].lower()]
    return search_results



@app.post("/recipes")
def create_recipe(recipe: Recipe):
    """Create a new recipe.

    Args:
        recipe (Recipe): The recipe details to create.

    Returns:
        dict: The created recipe.
    """
    recipes = load_recipes()
    recipe_id = max((recipe["id"] for recipe in recipes), default=0) + 1
    recipe.id = recipe_id
    recipes.append(recipe.model_dump())
    save_recipes(recipes)
    return recipe


@app.get("/recipes/{recipe_id}")
def read_recipe(recipe_id: int):
    """Retrieve a single recipe by its ID.

    Args:
        recipe_id (int): ID of the recipe to retrieve.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: The requested recipe.
    """
    recipes = load_recipes()
    recipe = next((recipe for recipe in recipes if recipe["id"] == recipe_id), None)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@app.put("/recipes/{recipe_id}")
def update_recipe(recipe_id: int, updated_recipe: Recipe):
    """Update a recipe by its ID.

    Args:
        recipe_id (int): ID of the recipe to update.
        updated_recipe (Recipe): New details for the recipe.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: The updated recipe.
    """
    recipes = load_recipes()
    recipe_index = next((index for index, r in enumerate(recipes) if r["id"] == recipe_id), None)

    if recipe_index is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    updated_recipe.id = recipe_id
    recipes[recipe_index] = updated_recipe.model_dump()
    save_recipes(recipes)
    return updated_recipe


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int):
    """Delete a recipe by its ID.

    Args:
        recipe_id (int): ID of the recipe to delete.

    Raises:
        HTTPException: If the recipe with the specified ID is not found.

    Returns:
        dict: A status message indicating successful deletion.
    """
    recipes = load_recipes()
    recipe_index = next((index for index, r in enumerate(recipes) if r["id"] == recipe_id), None)

    if recipe_index is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    del recipes[recipe_index]
    save_recipes(recipes)
    return {"status": "success", "message": "Recipe deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
