import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

console.log(projects);

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');

projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('#projects-pie-plot')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
});

let legend = d3.select('.legend');

data.forEach((d, idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', 'red');

let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
    query = event.target.value;

    let filteredProjects = projects.filter((project) =>
        project.title.includes(query)
    );

    renderProjects(filteredProjects, projectsContainer, 'h2');
});