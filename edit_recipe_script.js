const apiUrl = "http://127.0.0.1:8000";
const homePage = "recipes.html";

// Get the recipe ID from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const recipeID = urlParams.get('recipeID');
fillFetchedData(recipeID);

async function editRecipe(event){
    event.preventDefault();
    console.log("TEST EDITRECIPE");
    const recipeName = document.getElementById("recipe-name").value;
    let recipeIngredients = document.getElementById("recipe-ingredients").value;
    const recipeSteps = document.getElementById("recipe-steps").value;
    const recepeImage = document.getElementById("recipeImage").value;

    // data validation
    const validationResult = validateRecipeData(recipeName, recipeIngredients, recipeSteps, recepeImage);
    if (!validationResult.isValid) {
        alert(validationResult.message);
        return;
    }

    // create new recipe with updated data
    recipeIngredients = getListOfIngredients(recipeIngredients);
    let newRecipe = {
        name: recipeName,
        ingredients: recipeIngredients,
        steps: recipeSteps,
        image: recepeImage
    }

    try {
        // Update the recipe
        await updateRecipe(newRecipe, recipeID);
    
        // Redirect to the home page after a successful update
        window.location.href = homePage;
    } catch (error) {
        // Handle errors if the update fails
        console.error("Error updating recipe:", error);
        alert("Failed to update recipe. Please try again later.");
    }
    

}
function getListOfIngredients(ingredients) {
    // Use the split method to split the string into an array
    const ingredientsArray = ingredients.split(",");
    // Trim whitespace from each ingredient and remove empty strings
    const trimmedIngredients = ingredientsArray.map((ingredient) => ingredient.trim()).filter(Boolean);
    return trimmedIngredients;
}

async function fillFetchedData(id){
    const response = await fetch(`${apiUrl}/recipes/${recipeID}`);
    const recipe = await response.json();
    fetchData(recipe)
}

function fetchData(recipe){
    // getting tags
    const recipeName = document.getElementById("recipe-name");
    const recipeIngredients = document.getElementById("recipe-ingredients");
    const recipeSteps = document.getElementById("recipe-steps");
    const recepeImage = document.getElementById("recipeImage");

    // fill tags with data
    recipeName.value = recipe.name;
    recipeIngredients.value = recipe.ingredients;
    recipeSteps.value = recipe.steps;
    recepeImage.value = recipe.image;
}

function validateRecipeData(name, ingredients, steps, image) {
    if (!name) {
        return { isValid: false, message: "Recipe name is required." };
    }
    if (!ingredients) {
        return { isValid: false, message: "Ingredients are required." };
    }
    if (!steps) {
        return { isValid: false, message: "Recipe steps are required." };
    }
    if (!image) {
        return { isValid: false, message: "Recipe image is required." };
    }
    return { isValid: true, message: "All fields are valid." };
}

async function updateRecipe(recipe, recipeID) {
    try {
        const response = await fetch(`${apiUrl}/recipes/${recipeID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error("Failed to update recipe.");
        }


    } catch (error) {
        console.log("Error updating recipe:", error);
        throw error;
    }
}