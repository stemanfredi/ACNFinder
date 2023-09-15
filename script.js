'use strict'

const baseUrl = 'https://catalogocloud.acn.gov.it/json/make_json/'
const urlEndings = ['IN', 'IA', 'PA', 'SA']
let jsonData = []
let fields = []

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

    let radioButton = document.createElement('input')
    radioButton.type = 'checkbox'
    radioButton.name = 'searchField'
    radioButton.value = field

    // Set the radio button to be selected for the 2nd and 4th fields
    radioButton.checked = [1, 3].includes(index)

    radioButton.addEventListener('change', searchAndUpdateTable) // Add an event listener to update the table when the radio button status changes

    th.appendChild(radioButton)
    th.appendChild(document.createTextNode(field))
    row.appendChild(th)
  })
}

// Define the function to fetch the JSON data using arrow syntax
const fetchData = async () => {
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
    searchAndUpdateTable() // Display all data initially
  } catch (error) {
    console.error('Error fetching JSON:', error)
  }
}

// Invoke the fetchData function when the window loads
window.onload = () => {
  fetchData()
}
