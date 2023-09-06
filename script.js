let displayArea = document.getElementById("recipe-display-area");
const recipesBaseUrl = "http://127.0.0.1:8000";
const EDIT_PAGE = "edit_recipe.html"
displayRecipes();
const searchTag = document.getElementById("search-input");



searchTag.addEventListener("input", (e) =>{
    console.log(e.target.value);
    fetch(`${recipesBaseUrl}/search?value=${e.target.value}`)
    .then(res => res.json())
    .then(recipes =>{
        displayArea.innerHTML = "";
        recipes.forEach(element => {
            displayRecipe(element, element.id)
        });
    })
})


function addRecipe(event){
    event.preventDefault(); 

    // getting data from form
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
    recipeImage.style.height = '50%';  
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

    // adding edit button to recipe
    let editButton = document.createElement('button');
    editButton.textContent = "Edit";
    editButton.className = "edit-button"; // Add the "edit-button" class
    editButton.addEventListener('click', function() {
        // Redirect
        const recipeID  = parseInt(recipeDiv.dataset.recipeID, 10);
        window.location.href = `${EDIT_PAGE}?recipeID=${recipeID}`;
    });
    recipeDiv.appendChild(editButton);

    displayArea.append(recipeDiv);
}

function deleteRecipe(index){
    // requestOptions = {method: 'DELETE'}
    fetch(`${recipesBaseUrl}/recipes/${index}`, {method: 'DELETE'})
    .then(response => {
      // Check if the response status is OK (204 No Content typically for DELETE requests)
      if (response.status === 200) {
        console.log(`Recipe with ID ${recipeIdToDelete} successfully deleted.`);
      } else if (response.status === 404) {
        console.log(`Recipe with ID ${recipeIdToDelete} not found.`);
      } else {
        console.error(`Failed to delete recipe. Status: ${response.status}`);
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
    
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