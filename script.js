let displayArea = document.getElementById("recipe-display-area")
const recipesBaseUrl = "http://127.0.0.1:8000"
displayRecipes();



function addRecipe(event){
    event.preventDefault(); 

    // getting data from form
    const recipeName = document.getElementById("recipe-name").value;
    const recipeIngredients = document.getElementById("recipe-ingredients").value;
    const recipeSteps = document.getElementById("recipe-steps").value;
    const recepeImage = document.getElementById("recipeImage").value;

    // data validation
    const validationResult = validateRecipeData(recipeName, recipeIngredients, recipeSteps, recepeImage);
    if (!validationResult.isValid) {
        alert(validationResult.message);
        return;
    }

    // create and add new recipe
    recipeIngredients = getListOfIngredients(recipeIngredients);
    let newRecipe = {
        name: recipeName,
        ingredients: recipeIngredients,
        steps: recipeSteps,
        image: recepeImage
    }

    addRecipeToAPI(newRecipe);
    // Clear the form fields
    let form = document.getElementById("recipe-form");
    form.reset();
}

function displayRecipe(recipe, recipeID) {
    // create a div for the new recipe
    let recipeDiv = document.createElement('div');
    recipeDiv.className = "recipe-card";  // Add a class for styling
    recipeDiv.dataset.recipeID = recipeID   // Storing the recipeID as a data attribute
    
    // Create an image for recipe
    let recipeImage = new Image();
    recipeImage.style.width = '100%';
    recipeImage.style.height = 'auto';  
    recipeImage.src = recipe.image;
    recipeDiv.appendChild(recipeImage);

    // Create a header for the recipe name
    let nameHeader = document.createElement('h3');
    nameHeader.textContent = recipe.name;
    recipeDiv.appendChild(nameHeader);

    // Iterate through each property in the recipe object
    for (const key in recipe) {
        if (recipe.hasOwnProperty(key) && key !== 'name' && key !== 'image' && key !== 'id') {
            let tempPara = document.createElement('p');
            tempPara.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${recipe[key]}`;
            recipeDiv.appendChild(tempPara);
        }
    }
    // adding delete button to recipe
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', function() {
        const idToDelete = parseInt(recipeDiv.dataset.recipeID, 10);
        deleteRecipe(idToDelete);
        recipeDiv.remove();
    });
    recipeDiv.appendChild(deleteButton);

    // add the new recipe div to the display area
    displayArea.appendChild(recipeDiv);
}

function deleteRecipe(index){
    try {
        recipes.splice(index, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
    } catch (e) {
        console.error("Error in deleteRecipe function:", e);
    }
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

function getListOfIngredients(ingredients) {
    // Use the split method to split the string into an array
    const ingredientsArray = ingredients.split(",");
    // Trim whitespace from each ingredient and remove empty strings
    const trimmedIngredients = ingredientsArray.map((ingredient) => ingredient.trim()).filter(Boolean);
    return trimmedIngredients;
}

// Example usage:
const ingredientsString = "Ingredient 1, Ingredient 2, Ingredient 3";
const ingredientsArray = getListOfIngredients(ingredientsString);
console.log(ingredientsArray);


//------------- API REQUESTS --------------
// all requests, in case response.ok -> update the reciepes desplayed
async function displayRecipes() {
    displayArea.innerHTML = "";
    try {
        const response = await fetch(`${recipesBaseUrl}/recipes`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch recipes.");
        }

        const recipes = await response.json();
        
        for (let index = 0; index < recipes.length; index++) {
            const recipe = recipes[index];
            displayRecipe(recipe, recipe.id);
        }
    } catch (error) {
        console.error("Error fetching and displaying recipes:", error);
    }
}

async function addRecipeToAPI(recipe){
    try {
        const response = await fetch(`${recipesBaseUrl}/recipes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error("Failed to add recipe to API.");
        }

        displayRecipes();

    } catch (error) {
        console.error("Error adding recipe to API:", error);
        throw error; // Optionally, you can re-throw the error for further handling
    }
}