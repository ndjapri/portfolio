import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;

      const result = {
        id: commit,
        url: 'https://github.com/ndjapri/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(result, 'lines', {
        value: lines,
        enumerable: false,
        writable: true,
        configurable: true,
      });

      return result;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  const stats = [
    ['Total LOC', data.length],
    ['Total commits', commits.length],
    ['Total files', d3.group(data, (d) => d.file).size],
    ['Max depth', d3.max(data, (d) => d.depth)],
    ['Longest line', d3.max(data, (d) => d.length)],
    ['Max lines', d3.max(
      d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
      (d) => d[1]
    )],
  ];

  stats.forEach(([label, value]) => {
    dl.append('dt').text(label);
    dl.append('dd').text(value);
  });
}

function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (!commit) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
  
    date.textContent = commit.datetime.toLocaleString('en', {
      dateStyle: 'full'
    });
  
    time.textContent = commit.datetime.toLocaleString('en', {
      timeStyle: 'short'
    });
  
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}
  
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}
  
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
  
    tooltip.style.left = `${event.clientX + 12}px`;
    tooltip.style.top = `${event.clientY + 12}px`;
}

const data = await loadData();
const commits = processCommits(data);

renderCommitInfo(data, commits);

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 60
  };

  const usableWidth = width - margin.left - margin.right;

  const svg = d3.select('#scatterplot')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([margin.left, width - margin.right])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([margin.top, height - margin.bottom]);

  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(
      d3.axisLeft(yScale)
        .ticks(12)
        .tickSize(-usableWidth)
        .tickFormat('')
    );


  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      updateTooltipVisibility(false);
    });


  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickFormat(d3.timeFormat('%b %d'));

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  const yAxis = d3.axisLeft(yScale)
    .ticks(12)
    .tickFormat(d => `${String(d % 24).padStart(2, '0')}:00`);

  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);
}

renderScatterPlot(data, commits);
