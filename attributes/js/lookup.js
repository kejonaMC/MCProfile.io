document.getElementById("nav-lookup").classList.add("active")

const searchTypeSelect = document.querySelector('select[name="searchType"]')
const accountTypeSelect = document.querySelector('select[name="accountType"]')
const inputLabel = document.getElementById('InputLabel')
const uuidOptionValue = document.getElementById('uuidOptionValue')

function changeOptionValue(accountType) {
  if (accountType === 'Bedrock') {
    uuidOptionValue.textContent = 'Floodgate UUID'
    inputLabel.textContent = 'Enter Floodgate UUID'
  } else if (accountType === 'Java') {
    uuidOptionValue.textContent = 'UUID'
    inputLabel.textContent = 'Enter UUID'
  }
  if (searchTypeSelect.value === 'Username') {
    inputLabel.textContent = 'Enter Username'
    document.querySelector('input[name="Input"]').setAttribute('placeholder', 'KejonaMC1234')
  } else {
    document.querySelector('input[name="Input"]').setAttribute('placeholder', inputLabel.textContent)
  }
}

// Set the default option value and input label
changeOptionValue('Bedrock')

accountTypeSelect.addEventListener('change', (event) => {
  const selectedOption = event.target.value
  changeOptionValue(selectedOption)
});

searchTypeSelect.addEventListener('change', (event) => {
  const selectedOption = event.target.value
  if (selectedOption === 'Username') {
    inputLabel.textContent = 'Enter Username'
    document.querySelector('input[name="Input"]').setAttribute('placeholder', 'KejonaMC1234')
  } else {
    changeOptionValue(accountTypeSelect.value)
  }
})