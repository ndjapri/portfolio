console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$('nav a');

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
// );

// console.log(currentLink);

// currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'cv/', title: 'CV' },
    { url: 'https://github.com/ndjapri', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? "/"
    : "/portfolio/";
    
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
    }
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
    
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    
    if (a.host !== location.host) {
        a.target = '_blank';
    }
}