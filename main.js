// OpenAlex API access
const oa = 'https://api.openalex.org';

// identifiers for a work
let doi;
let openAlexID;

// listen for form submission => query OpenAlex dataset
const searchForm = document.querySelector('[name=search]');
searchForm.addEventListener('submit', getRecommendations);

// functions

async function getOpenAlexID(doi) {
    const apiCall = `${oa}/works/${doi}`;
    const response = await fetch(apiCall);
    const workMetadata = await response.json();
    openAlexID = workMetadata.id;
    openAlexID = openAlexID.replace('https://openalex.org/', '');
    return openAlexID;
}

async function getRecommendations(event) {
    event.preventDefault();
    doi = document.querySelector('[name=doi]').value;
    openAlexID = await getOpenAlexID(doi);  
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

