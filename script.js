'use strict'

const baseUrl = 'https://catalogocloud.acn.gov.it/json/make_json/'
const urlEndings = ['IN', 'IA', 'PA', 'SA']
let jsonData = []
let fields = []
let loadingInterval

const searchAndUpdateTable = () => {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase()
  const tableBody = document
    .getElementById('resultsTable')
    .querySelector('tbody')
  tableBody.innerHTML = '' // Clear current table content

  const selectedFields = Array.from(
    document.querySelectorAll('input[name="searchField"]:checked')
  ).map(input => input.value)

  for (let item of jsonData) {
    // Check if any of the selected fields contain the search query
    const matchesQuery = selectedFields.some(
      field => item[field] && item[field].toLowerCase().includes(searchQuery)
    )

    if (matchesQuery) {
      let row = tableBody.insertRow()
      fields.forEach((field, index) => {
        let cell = row.insertCell(index)
        cell.textContent = item[field] || '' // Use a fallback value if undefined
      })
    }
  }
}

const buildTableHeaders = () => {
  const tableHead = document
    .getElementById('resultsTable')
    .querySelector('thead')
  const row = tableHead.insertRow()

  fields.forEach((field, index) => {
    let th = document.createElement('th')

    let checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.name = 'searchField'
    checkbox.value = field

    // Set the checkbox to be selected for the 2nd and 4th fields
    checkbox.checked = [1, 3].includes(index)

    checkbox.addEventListener('change', searchAndUpdateTable)

    th.appendChild(checkbox)
    th.appendChild(document.createTextNode(field))
    row.appendChild(th)
  })
}

// Function to start the loading animation
const startLoadingAnimation = () => {
  let dotCount = -1 // Zero dots
  document.getElementById('loadingAnimation').style.display = 'block'

  loadingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4 // Cycle between 0 and 3
    const dots = '.'.repeat(dotCount)
    document.getElementById(
      'loadingAnimation'
    ).textContent = `Fetching data${dots}`
  }, 500) // Update every 500 milliseconds
}

// Function to stop the loading animation
const stopLoadingAnimation = () => {
  clearInterval(loadingInterval) // Clear the interval to stop the animation
  document.getElementById('loadingAnimation').style.display = 'none'
}

const fetchData = async () => {
  document.getElementById('fetchButton').style.display = 'none'
  startLoadingAnimation()
  try {
    for (let i = 0; i < urlEndings.length; i++) {
      let response = await fetch(baseUrl + urlEndings[i])
      let data = await response.json()
      jsonData = jsonData.concat(data) // Combine data from all URLs

      // Dynamically populate the fields array based on the first item in jsonData
      if (i === 0 && data.length > 0) {
        fields = Object.keys(data[0])
        buildTableHeaders() // Build table headers based on fields
      }
    }
    stopLoadingAnimation()
    document.getElementById('mainContent').style.display = 'block'
    searchAndUpdateTable() // Display all data initially
  } catch (error) {
    stopLoadingAnimation()
    document.getElementById('fetchButton').style.display = 'block'
    console.error('Error fetching JSON:', error)
  }
}
