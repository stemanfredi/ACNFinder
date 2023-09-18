'use strict'

const PROXY_URL = 'https://corsproxy.io/?'
const BASE_URL = 'https://catalogocloud.acn.gov.it/json/make_json/'
const URL_ENDINGS = ['IN', 'IA', 'PA', 'SA']
const SEARCH_SYMBOL = '🔍'
const CLEAR_SYMBOL = '❌'

let tableData = []
let tableFields = []
const columnSearchTerms = {}

const fetchData = async () => {
  let allData = []
  for (let ending of URL_ENDINGS) {
    let response = await fetch(PROXY_URL + BASE_URL + ending)
    let data = await response.json()
    allData = allData.concat(data)
  }
  return allData
}

const filterTableData = () => {
  return tableData.filter(item => {
    return tableFields.every(field => {
      if (columnSearchTerms[field]) {
        return (
          item[field] &&
          item[field].toLowerCase().includes(columnSearchTerms[field])
        )
      }
      return true
    })
  })
}

const updateTableDisplay = () => {
  const tableBody = document
    .getElementById('resultsTable')
    .querySelector('tbody')
  tableBody.innerHTML = ''
  const filteredData = filterTableData()

  for (let item of filteredData) {
    let row = tableBody.insertRow()
    tableFields.forEach(field => {
      let cell = row.insertCell()
      cell.textContent = item[field] || ''
    })
  }
}

const buildTableHeaders = () => {
  const tableHead = document
    .getElementById('resultsTable')
    .querySelector('thead')
  const headerRow = tableHead.insertRow()

  tableFields.forEach(field => {
    let th = document.createElement('th')

    let toggleIcon = document.createElement('span')
    toggleIcon.textContent = SEARCH_SYMBOL
    toggleIcon.className = 'toggle-icon'
    toggleIcon.addEventListener('click', function () {
      const searchBox = this.nextElementSibling
      if (searchBox.style.display === 'block' || searchBox.value) {
        searchBox.value = ''
        columnSearchTerms[field] = ''
        updateTableDisplay()
        this.textContent = SEARCH_SYMBOL
      } else {
        searchBox.style.display = 'block'
        searchBox.focus()
      }
    })

    let searchBox = document.createElement('input')
    searchBox.className = 'search-box'
    searchBox.addEventListener('input', function () {
      this.previousElementSibling.textContent = this.value
        ? CLEAR_SYMBOL
        : SEARCH_SYMBOL
      columnSearchTerms[field] = this.value.toLowerCase()
      updateTableDisplay()
    })
    searchBox.addEventListener('blur', function () {
      this.style.display = 'none'
    })

    th.appendChild(document.createTextNode(field + ' '))
    th.appendChild(toggleIcon)
    th.appendChild(searchBox)
    headerRow.appendChild(th)
  })
}

const initializeTable = async () => {
  tableData = await fetchData()
  if (tableData.length > 0) {
    tableFields = Object.keys(tableData[0])
    buildTableHeaders()
    updateTableDisplay()
  }
}

window.onload = initializeTable

document.addEventListener('click', event => {
  if (
    !event.target.classList.contains('toggle-icon') &&
    !event.target.classList.contains('search-box')
  ) {
    document.querySelectorAll('.search-box').forEach(box => {
      box.style.display = 'none'
    })
  }
})
