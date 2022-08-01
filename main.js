// OpenAlex API access
const oa = 'https://api.openalex.org';

// identifiers for a work
let openAlexID;

// listen for form submission => query OpenAlex dataset
const searchForm = document.querySelector('[name=search]');
searchForm.addEventListener('submit', getRecommendations);

//

// listen for institution searching => make suggestions from autocomplete endpoint
const titleSearchInput = document.querySelector('[name=title]');
titleSearchInput.addEventListener('input', () => {
    getSuggestions(titleSearchInput.value); 
});

// functions
async function getSuggestions(searchText) {
    if (searchText.length > 0){
        const response = await fetch(`${oa}/autocomplete/works?q=${searchText}`);
        const data = await response.json();
        const suggestions = data.results;
        let searchTextMatches = suggestions.filter(suggestion => {
            const regex = new RegExp(`^${searchText}`, 'gi');
            return suggestion.display_name.match(regex);
        });
        if(searchText.length === 0) {
            searchTextMatches = [];
        }      
        displaySuggestions(searchTextMatches);
    } return;
}

const displaySuggestions = (textMatches) => {
    const suggestionsDiv = document.querySelector(`.suggestions`);
    if (textMatches.length > 0) {
        const html = textMatches.map(textMatch => 
            `<li>${textMatch.display_name}</li>`
            ).join('');
        suggestionsDiv.innerHTML = '<ul>' + html + '</ul>';
        suggestionsDiv.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('li')) {
                titleSearchInput.value = target.innerHTML;
                textMatches.map(textMatch => 
                    openAlexID = `${textMatch.id}`);
                suggestionsDiv.remove();
            }}
        );
    }
}

// functions

async function getOpenAlexID(title) {
    const queryString = encodeURIComponent(title);
    const apiCall = `${oa}/works?filter=title.search:${queryString}`;
    console.log(apiCall);
    const response = await fetch(apiCall);
    const metadata = await response.json();
    openAlexID = metadata.results[0].id;
    openAlexID = openAlexID.replace('https://openalex.org/', '');
    return openAlexID;
}

async function getRecommendations(event) {
    event.preventDefault();
    title = document.querySelector('[name=title]').value;
    console.log(title);
    openAlexID = await getOpenAlexID(title);

    const relatedWorks = getRelatedWorks(openAlexID);
    const citedBy = getCitedBy(openAlexID); 
    const worksCited = getReferencedWorks(openAlexID);
}

async function getRelatedWorks(openAlexID) {
    const response = await fetch(`${oa}/works?filter=related_to:${openAlexID}`);
    const relatedWorksMetadata = await response.json();
    const relatedWorksResults = relatedWorksMetadata.results;
    console.log(relatedWorksResults);
    loadTableData(relatedWorksResults);
}

function loadTableData(works) {
    const container = document.querySelector('main');
    const footer = document.querySelector('footer');
    const tableCard = document.createElement('article');
    container.insertBefore(tableCard, footer);
    const table = document.createElement('table');
    tableCard.appendChild(table);

    let html = '<thead><tr><th>Title</th><th>Publication Year</th></tr></thead>';
    for (let work of works) {
        html += `<tr><td><a href="${work.doi}">${work.display_name}</a></td><td>${work.publication_year}</td></tr>`;
    }
    table.innerHTML = html;
}

async function getCitedBy(openAlexID) {
    const response = await fetch(`${oa}/works?filter=cites:${openAlexID}`);
    const citedByMetadata = await response.json();
    const citedByResults = citedByMetadata.results;
    console.log(citedByResults);
    loadTableData(citedByResults);
}

async function getReferencedWorks(openAlexID) {
    const response = await fetch(`${oa}/works?filter=cited_by:${openAlexID}`);
    const referencedWorksMetadata = await response.json();
    const referencedWorksResults = referencedWorksMetadata.results;
    console.log(referencedWorksResults);
    loadTableData(referencedWorksResults);
}

