// Html Refereces

var errorsCountHtml = document.getElementById('errors-count');
var warningsCountHtml = document.getElementById('warnings-count');
var resolvedCountHtml = document.getElementById('resolved-count');
var totalCountHtml = document.getElementById('total-count');
var fromCountHtml = document.getElementById('from-count');
var toCountHtml = document.getElementById('to-count');
var totalSectionHtml = document.getElementById('total-section');
var totalSectionCountHtml = document.getElementById('total-section-count');
var totalSectionTextHtml = document.getElementById('total-section-text');

var errorsButtonHtml = document.getElementById('errors-button');
var warningsButtonHtml = document.getElementById('warnings-button');
var resolvedButtonHtml = document.getElementById('resolved-button');

var indicatorOuterHtml = document.getElementById('indicator-outer');
var indicatorInnerHtml = document.getElementById('indicator-inner');

var resultsListHtml = document.getElementById('results-list');
var checkAllHtml = document.getElementById('check-all');

var copyToClipboardHtml = document.getElementById('copy-to-clipboard');
var copyToClipboardTooltipHtml = document.getElementById('copy-to-clipboard-tooltip');

var projectNameHtml = document.getElementById('project-name');

var paginationHtml = document.getElementById('pagination');
var nextHtml = document.getElementById('next');
var previousHtml = document.getElementById('previous');

const STATUS = {
  Errors: 'errors',
  Warnings: 'warnings',
  Resolved: 'resolved'
}

const COLOUR = {
  Errors: 'red',
  Warnings: 'orange',
  Resolved: 'green'
}

const MAX_PAGE_SIZE = 50;

var results = {};
var resolvedCount = 0;
var currentStatus = STATUS.Errors;
var currentPage = 1;
var totalPages = 1;

getResults();
initiateListeners();

function initiateListeners() {
  errorsButtonHtml.addEventListener('click', (e) => {
    currentPage = 1;
    currentStatus = STATUS.Errors;
    setCheckAll();
    setResults();
  });
  warningsButtonHtml.addEventListener('click', (e) => {
    currentPage = 1;
    currentStatus = STATUS.Warnings;
    setCheckAll();
    setResults();
  });
  resolvedButtonHtml.addEventListener('click', (e) => {
    currentPage = 1;
    currentStatus = STATUS.Resolved;
    setCheckAll();
    setResults();
  });
}

function getResults() {
  fetch('/data.json')
  .then(response => response.text())
  .then(data => {
    results = data && data.length ? JSON.parse(data) : {projectName: '-', errors: [], warnings: []};
    projectNameHtml.innerHTML = results.projectName;
    displayResults();
  });
}

function displayResults() {
  setCount();
  setCurrentStatus();
  setResults();
}

function setCurrentStatus() {
  if (!results.errors.length && results.warnings.length) {
    currentStatus = STATUS.Warnings;
  }
}

function setResults() {
  const items = (currentStatus === STATUS.Errors ? results.errors : currentStatus === STATUS.Warnings ? results.warnings : 
    [...results.errors, ...results.warnings].filter(item => item.isResolved));

  totalSectionCountHtml.innerText = items.length;
  totalSectionTextHtml.innerText = currentStatus;

  indicatorOuterHtml.classList.remove(`bg-${COLOUR.Errors}-200`, `bg-${COLOUR.Warnings}-200`, `bg-${COLOUR.Resolved}-200`);
  indicatorInnerHtml.classList.remove(`bg-${COLOUR.Errors}-600`, `bg-${COLOUR.Warnings}-600`, `bg-${COLOUR.Resolved}-600`);

  indicatorOuterHtml.classList.add(`bg-${getColourByStatus(currentStatus)}-200`);
  indicatorInnerHtml.classList.add(`bg-${getColourByStatus(currentStatus)}-600`);

  warningsButtonHtml.classList.remove(`border-${COLOUR.Warnings}-600`);
  errorsButtonHtml.classList.remove(`border-${COLOUR.Errors}-600`);
  resolvedButtonHtml.classList.remove(`border-${COLOUR.Resolved}-600`);

  switch (currentStatus) {
    case STATUS.Errors:
      errorsButtonHtml.classList.add(`border-${getColourByStatus(currentStatus)}-600`);
      break;
    case STATUS.Warnings:
      warningsButtonHtml.classList.add(`border-${getColourByStatus(currentStatus)}-600`);
      break;
    case STATUS.Resolved:
      resolvedButtonHtml.classList.add(`border-${getColourByStatus(currentStatus)}-600`);
      break;
  }

  totalPages = Math.ceil(items.length / MAX_PAGE_SIZE);
  if (totalPages > 1) {
    paginationHtml.classList.remove('hidden');
  } else {
    paginationHtml.classList.add('hidden');
  }
  handlePaginationButtons();
  resultsListHtml.innerHTML = getFormattedResults(items);
  if (!(resultsListHtml.innerHTML.length) && currentPage > 1) {
    previousPage();
  }
}

function getColourByStatus(status) {
  switch(status) {
    case STATUS.Errors:
      return COLOUR.Errors;
    case STATUS.Warnings:
      return COLOUR.Warnings;
    case STATUS.Resolved:
      return COLOUR.Resolved;
  }
}

function getFormattedResults(results) {
  var items = '';
  const startIndex = (currentPage - 1) * MAX_PAGE_SIZE;
  const endIndex = startIndex + MAX_PAGE_SIZE;

  fromCountHtml.innerText = results.length ? (startIndex + 1) : 0;
  toCountHtml.innerText = results.length < endIndex ? results.length : endIndex;

  if (results.length) {
    results.forEach((item, index) => {
      if (index >= startIndex && index < endIndex) {
        items += `<div class="flex items-start py-4 sm:py-5 border-b border-gray-200 broder-last-0">
        <div class="flex justify-center mr-3 pt-1">
          <input type="checkbox" class="h-4 w-4 cursor-pointer" aria-label="Mark this issue as resolved" id="${item.id}" onclick="toggleResolved(${item.id})" ${item.isResolved ? 'checked' : ''}>
        </div>
        <div>
          <span class="inline-block text-md leading-relaxed text-gray-800 mb-2">
            <a href="http://google.com/search?q=${encodeURIComponent(item.failure)}" target="_blank" rel=”noopener” class="cursor-pointer hover:text-gray-900 transition-colors ease-in-out duration-200 flex items-center">
            ${item.failure}
              <span class="inline-block">
                <svg class="text-blue-600 w-4 h-4 ml-2 m-auto cursor-pointer hover:text-blue-700 transition-colors ease-in-out duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </svg>
            </span>
            </a>
          </span>
          <div class="text-xs leading-relaxed text-gray-600 mb-1 font-medium">${item.name} [${item.startPosition.line}, ${item.startPosition.character}]</div>
          ${item.ruleName ? `<div>
            <a class="inline-block w-auto text-xs font-medium border border-gray-300 bg-white rounded-md leading-loose px-2 text-gray-700 mr-2 mt-3 capitalize">${item.ruleName}</a>
          </div>` : ''}
        </div>
      </div>`;
      }
    });
  } else {
    items += getPlaceholder();
  }
  return items;
}

function getPlaceholder() {
  switch(currentStatus) {
    case STATUS.Errors:
      return `<div class="p-16 text-center">
        <div class="text-xl font-medium">Awesome Job! 🎉</div>
        <div class="text-sm font-normal text-gray-600">Your project is clean with no lint errors</div>
      </div>`;
    case STATUS.Warnings:
      return `<div class="p-16 text-center">
        <div class="text-xl font-medium">Thats Great! 🎊</div>
        <div class="text-sm font-normal text-gray-600">Your project is great with no lint warnings</div>
      </div>`;
    case STATUS.Resolved:
      return `<div class="p-16 text-center">
        <div class="text-xl font-medium">${(results.errors.length || results.warnings.length) ? 'Nothing Yet Here! 🙂' : 'All Clear Here! 😉'}</div>
        <div class="text-sm font-normal text-gray-600">${(results.errors.length || results.warnings.length) ? 'Issues get listed here as they are marked as resolved' : 'Project with no lint issues has nothing to resolve'}</div>
      </div>`;
  }
}

function setCount() {
  errorsCountHtml.innerText = results.errors.length;
  warningsCountHtml.innerText = results.warnings.length;
  resolvedCountHtml.innerText = resolvedCount;
  totalCountHtml.innerText = results.errors.length + results.warnings.length;
}

function setResolvedCount() {
  resolvedCount = ([...results.errors, ...results.warnings].filter(item => item.isResolved)).length;
  resolvedCountHtml.innerText = resolvedCount;
}

function toggleResolved(checkboxId) {
  var checkBox = document.getElementById(checkboxId);
  // If the checkbox is checked, display the output text
  const item = [...results.errors, ...results.warnings].find(element => element.id == checkboxId);
  if (item && checkBox.checked){
    item.isResolved = true;
  } else {
    item.isResolved = false;
  }
  setResolvedCount();

  if (currentStatus === STATUS.Resolved) {
    setResults();
  }
  setCheckAll();
}

function toggleAllResolved() {
  const items = (currentStatus === STATUS.Errors ? results.errors : currentStatus === STATUS.Warnings ? results.warnings : 
    [...results.errors, ...results.warnings].filter(item => item.isResolved));
  
    if (checkAllHtml.checked) {
      items.forEach(element => element.isResolved = true);
    } else {
      items.forEach(element => element.isResolved = false);
    }
    setResolvedCount();
    setResults();
    setCheckAll();
}


function setCheckAll() {
  const items = (currentStatus === STATUS.Errors ? results.errors : currentStatus === STATUS.Warnings ? results.warnings : 
    [...results.errors, ...results.warnings].filter(item => item.isResolved));
  checkAllHtml.checked = items.length && items.every(element => element.isResolved);
}

function copyToClipboard() {
  document.addEventListener('copy', copyData);
  document.execCommand("copy");
  document.removeEventListener('copy', copyData);

  copyToClipboardHtml.addEventListener('mouseenter', (e) => {
    copyToClipboardTooltipHtml.innerHTML = 'Copy Results JSON';
  })
  copyToClipboardTooltipHtml.innerHTML = `<svg class="text-green-500 w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
</svg> <span>Copied!</span>`;
}

function copyData(e) {
  const data = JSON.stringify(results, null, 4);
  e.clipboardData.setData('text/plain', data);
  e.preventDefault();
}

function nextPage() {
  currentPage++;
  setResults();
}

function previousPage() {
  currentPage--;
  setResults();
}

function handlePaginationButtons() {
  if (currentPage > 1) {
    previousHtml.classList.remove('hidden');
  } else {
    previousHtml.classList.add('hidden');
  }

  if (currentPage < totalPages) {
    nextHtml.classList.remove('hidden');
  } else {
    nextHtml.classList.add('hidden');
  }
}