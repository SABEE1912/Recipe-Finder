const searchInput  = document.getElementById("searchInput");
const areaFilter   = document.getElementById("areaFilter");
const resultDiv    = document.getElementById("recipeResult");
document.getElementById("searchBtn").onclick  = findRecipe;
document.getElementById("randomBtn").onclick  = getRandomRecipe;
document.getElementById("favBtn").onclick     = showFavorites;
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") findRecipe();
});
async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("Network error");
  return res.json();
}
async function findRecipe(){
  const q = searchInput.value.trim();
  if(!q){ alert("Type a recipe or ingredient."); return; }

  try{
    const data = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`);
    if(!data.meals){ resultDiv.innerHTML="<p>No recipe found.</p>"; return; }
    const area = areaFilter.value;
    const list = area ? data.meals.filter(m=>m.strArea===area) : data.meals;
    if(!list.length){ resultDiv.innerHTML="<p>No recipe for selected area.</p>"; return; }
      renderRecipe(list[0]);
  }catch(err){
    resultDiv.innerHTML=`<p>${err.message}</p>`;
  }
}
async function getRandomRecipe(){
  try{
    const data = await fetchJSON("https://www.themealdb.com/api/json/v1/1/random.php");
    renderRecipe(data.meals[0]);
  }catch(err){
    resultDiv.innerHTML=`<p>${err.message}</p>`;
  }
}
function renderRecipe(meal){
  const ingredients = [];
  for(let i=1;i<=20;i++){
    const ing = meal[`strIngredient${i}`];
    const qty = meal[`strMeasure${i}`];
    if(ing && ing.trim()) ingredients.push(`${ing} - ${qty}`);
  }
  resultDiv.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <p><strong>Category:</strong> ${meal.strCategory}</p>
    <p><strong>Area:</strong> ${meal.strArea}</p>
    <h3>Ingredients</h3>
    <ul>${ingredients.map(i=>`<li>${i}</li>`).join("")}</ul>
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
    <button onclick="saveFavorite('${meal.idMeal}','${meal.strMeal}','${meal.strMealThumb}')">
      Save to Favorites
    </button>
  `;
}
function getFavs(){
  return JSON.parse(localStorage.getItem("favs")||"[]");
}
function saveFavs(arr){
  localStorage.setItem("favs",JSON.stringify(arr));
}
function saveFavorite(id,name,img){
  const favs = getFavs();
  if(favs.some(f=>f.id===id)){ alert("Already saved."); return; }
  favs.push({id,name,img});
  saveFavs(favs);
  alert("Saved!");
}
function showFavorites(){
  const favs = getFavs();
  if(!favs.length){ resultDiv.innerHTML="<p>No favorites yet.</p>"; return; }

  resultDiv.innerHTML = "<h2>My Favorites</h2><div class='fav-grid'></div>";
  const grid = document.querySelector(".fav-grid");

  favs.forEach(f=>{
    const card = document.createElement("div");
    card.className = "fav-card";
    card.innerHTML = `
      <img src="${f.img}" alt="${f.name}">
      <p>${f.name}</p>
      <button onclick="removeFavorite('${f.id}')">Remove</button>
    `;
    grid.appendChild(card);
  });
}
function removeFavorite(id){
  const favs = getFavs().filter(f=>f.id!==id);
  saveFavs(favs);
  showFavorites();
}
