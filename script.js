'use strict'

const BASE_URL = 'https://catalogocloud.acn.gov.it/json/make_json/'
const URL_ENDINGS = ['IN', 'IA', 'PA', 'SA']
const SEARCH_SYMBOL = '🔍'
const CLEAR_SYMBOL = '❌'

let tableData = []
let tableFields = []
let searchTerms = {}

const fetchData = async () => {
  const fetchPromises = URL_ENDINGS.map(async ending => {
    const response = await fetch(BASE_URL + ending, {
      'Access-Control-Allow-Origin': 'https://www.acn.gov.it/',
    })
    return await response.json()
  })

  const allData = await Promise.all(fetchPromises)
  return allData.flat()
}

const filterData = () =>
  tableData.filter(item =>
    tableFields.every(
      f =>
        !searchTerms[f] ||
        (item[f] && item[f].toLowerCase().includes(searchTerms[f]))
    )
  )

const updateTable = tbody => {
  tbody.innerHTML = ''
  filterData().forEach(item => {
    const row = tbody.insertRow()
    tableFields.forEach(f => (row.insertCell().textContent = item[f] || ''))
  })
}

const toggleSearch = (icon, input, field) => {
  // Hide all other search boxes
  document.querySelectorAll('.search-box').forEach(box => {
    if (box !== input) box.style.display = 'none'
  })

  if (input.style.display === 'block' && input.value) {
    input.value = ''
    searchTerms[field] = ''
    updateTable(document.querySelector('#resultsTable tbody'))
    icon.textContent = SEARCH_SYMBOL
    input.style.display = 'none' // Hide the current search box
  } else {
    input.style.display = input.style.display === 'block' ? 'none' : 'block'
    input.focus()
  }
}

const buildHeaders = () => {
  const thead = document.querySelector('#resultsTable thead'),
    row = thead.insertRow()
  tableFields.forEach(field => {
    const th = document.createElement('th'),
      searchIcon = document.createElement('span'),
      clearIcon = document.createElement('span'),
      input = document.createElement('input')
    ;[searchIcon, clearIcon].forEach(icon => {
      icon.className = 'icon'
      icon.textContent = icon === searchIcon ? SEARCH_SYMBOL : CLEAR_SYMBOL
    })
    clearIcon.style.display = 'none'
    input.className = 'search-box'
    input.style.display = 'none'
    searchIcon.addEventListener('click', () =>
      toggleSearch(searchIcon, input, field)
    )
    clearIcon.addEventListener('click', () => {
      input.value = ''
      searchTerms[field] = ''
      updateTable(document.querySelector('#resultsTable tbody'))
      clearIcon.style.display = 'none'
    })
    input.addEventListener('input', () => {
      clearIcon.style.display = input.value ? 'inline' : 'none'
      searchTerms[field] = input.value.toLowerCase()
      updateTable(document.querySelector('#resultsTable tbody'))
    })
    th.append(`${field} `, searchIcon, clearIcon, input)
    row.appendChild(th)
  })
}

const init = async () => {
  tableData = await fetchData()
  if (tableData.length) {
    tableFields = Object.keys(tableData[0])
    buildHeaders()
    updateTable(document.querySelector('#resultsTable tbody'))
  }
}

window.onload = init

document.addEventListener('click', ({ target }) => {
  const isIcon = target.className === 'icon'
  const isSearchBox = target.className === 'search-box'

  if (!isIcon && !isSearchBox) {
    document
      .querySelectorAll('.search-box')
      .forEach(box => (box.style.display = 'none'))
  }
})
