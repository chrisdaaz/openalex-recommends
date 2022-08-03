// OpenAlex API access
const oa = 'https://api.openalex.org';

async function getTitleSuggestions(searchText) {
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
    displayTitleSuggestions(searchTextMatches);
}

function displayTitleSuggestions(textMatches) {
    console.log(textMatches);
    const suggestionsDiv = document.querySelector(`.suggestions`);
    if (textMatches.length > 0) {
        const html = textMatches.map(textMatch => `<li>${textMatch.display_name}</li>`
        ).join('');
        suggestionsDiv.innerHTML = '<ul>' + html + '</ul>';
        suggestionsDiv.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('li')) {
                titleSearchInput.value = target.innerHTML;
                suggestionsDiv.remove();
            }
        }
        );
    }
}

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

    getRelatedWorks(openAlexID);
    getCitedBy(openAlexID); 
    getReferencedWorks(openAlexID);
}

async function getRelatedWorks(openAlexID) {
    const response = await fetch(`${oa}/works?filter=related_to:${openAlexID}`);
    const relatedWorksMetadata = await response.json();
    const relatedWorksResults = relatedWorksMetadata.results;
    console.log(relatedWorksResults);
    loadResultsList(relatedWorksResults, 'Recent works about similar concepts:');
}

async function getCitedBy(openAlexID) {
    const response = await fetch(`${oa}/works?filter=cites:${openAlexID}`);
    const citedByMetadata = await response.json();
    const citedByResults = citedByMetadata.results;
    console.log(citedByResults);
    loadResultsList(citedByResults, 'Citations to this work:');
}

async function getReferencedWorks(openAlexID) {
    const response = await fetch(`${oa}/works?filter=cited_by:${openAlexID}`);
    const referencedWorksMetadata = await response.json();
    const referencedWorksResults = referencedWorksMetadata.results;
    console.log(referencedWorksResults);
    loadResultsList(referencedWorksResults, 'Works listed in the References section:');
}

function loadResultsList(works, label) {
    const container = document.querySelector('main');
    const footer = document.querySelector('footer');
    const resultsCard = document.createElement('article');
    container.insertBefore(resultsCard, footer);
    const header = document.createElement('header');
    resultsCard.appendChild(header);
    const heading = document.createElement('h3');
    header.appendChild(heading);
    heading.textContent = `${label}`;
    const resultsListContainer = document.createElement('ul');
    resultsCard.appendChild(resultsListContainer);
    let resultsList = '';
    for (const work of works) {
        resultsList += `<li><a href="${work.doi}">${work.display_name}</a> (${work.publication_year})</li>`;
    }
    resultsListContainer.innerHTML = resultsList;
}

// EVENT LISTENERS

// listen for institution searching => make suggestions from autocomplete endpoint
const titleSearchInput = document.querySelector('[name=title]');
titleSearchInput.addEventListener('input', () => {
    getTitleSuggestions(titleSearchInput.value); 
});

// listen for form submission => query OpenAlex dataset
const searchForm = document.querySelector('[name=search]');
searchForm.addEventListener('submit', getRecommendations);