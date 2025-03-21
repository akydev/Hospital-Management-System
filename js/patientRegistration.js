import {
  emailRegex,
  nameRegex,
  phoneRegex,
  pinCodeRegex,
  isMatchedPassword,
  genderValidation,
  validatePassword,
  onlineApiUrl,
} from "./commonFunction.js";

//Import Toastify.
import { showErrorToast, showSuccessToast } from "./toastifyMessage.js";

let currentStep = 0;
const formSteps = document.querySelectorAll(".form-step");

//Wait until the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  const nextButtons = document.querySelectorAll("#nextStep");
  const prevButtons = document.querySelectorAll("#prevStep");

  nextButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      nextStep();
    });
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      prevStep();
    });
  });
  //Bind the handleSubmit function to the form's on submit event.
  document
    .getElementById("registrationForm")
    .addEventListener("submit", handleSubmit);
});

//Create check validation function.

function checkValidation(name, value) {
  // console.log(name, value);
  if (!value) {
    return `Please enter ${name.replace(/([A-Z])/g, " $1").toLowerCase()}`;
  }

  switch (name) {
    case "firstName":
      if (!nameRegex.test(value)) {
        return "Name should contain only letters.";
      }
      break;
    case "lastName":
      if (!nameRegex.test(value)) {
        return "Name should contain only letters.";
      }
      break;
    case "email":
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address.";
      }
      break;
    case "gender":
      return genderValidation();
      break;
    case "password":
      return validatePassword(value);
      break;
    case "confirmPassword":
      const passwordError = validatePassword(value);
      if (passwordError) {
        return passwordError;
      } else if (!isMatchedPassword()) {
        return "Password do not match.";
      }
      break;
    case "phone":
      if (!phoneRegex.test(value)) {
        return "Phone number should be exactly 10 digits.";
      }
      break;
    case "pincode":
      if (!pinCodeRegex.test(value)) {
        return "Pincode should be exactly 6 digits.";
      }
      break;
    default:
      console.log("Invalid input name.");
  }
  return "";
}

//Create validate current setp function.
function validateCurrentStep() {
  //Validate all input fields in the current step.
  const inputs = formSteps[currentStep].querySelectorAll("input");
  let allValid = true;

  inputs.forEach((input) => {
    //Validate immedaitely on the first "Next" button click.
    const message = checkValidation(input.name, input.value);
    console.log(message);
    document.getElementById(`error-${input.name}`).innerHTML = message;
    if (message) {
      allValid = false; //If any filed is invalid, set allvalid to false.
    }

    //Add input event listener for real-time validation
    input.addEventListener("change", function () {
      const message = checkValidation(input.name, input.value);
      document.getElementById(`error-${input.name}`).innerHTML = message;
      if (message) {
        allValid = false;
      } else {
        allValid = true;
      }
    });
  });
  return allValid;
}

//Create next button function.
function nextStep() {
  let length = formSteps.length;
  if (validateCurrentStep()) {
    formSteps[currentStep].classList.add("d-none");
    currentStep++;
    if (currentStep < length) {
      formSteps[currentStep].classList.remove("d-none");
    }
  }
}

//Create previous button function.
function prevStep() {
  if (currentStep > 0) {
    formSteps[currentStep].classList.add("d-none");
    currentStep--;
    formSteps[currentStep].classList.remove("d-none");
  }
}

//Create a handle submit function.
async function handleSubmit(e) {
  e.preventDefault();

  //Validate the last step before submission.
  if (!validateCurrentStep()) {
    return; //Stop submission if validation fails.
  }

  const formData = new FormData(document.getElementById("registrationForm"));
  // console.log(formData)
  const formObject = {};
  formData.forEach((value, key) => {
    if (key !== "confirmPassword") {
      //Check if the key is part of the address and nest it accordingly.
      if (
        ["addressLine", "city", "state", "country", "pincode"].includes(key)
      ) {
        formObject.fullAddress = formObject.fullAddress || {};
        formObject.fullAddress[key] = value;
      } else {
        formObject[key] = value;
      }
    }
  });
  // console.log(formObject);

  try {
    const response = await fetch(`${onlineApiUrl}/patients`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "Post",
      body: JSON.stringify(formObject),
    });

    const data = await response.json();
    if (!response.ok) {
      showErrorToast(data.msg);
      return;
    }
    if (response.ok) {
      document.getElementById("registrationForm").reset();
      showSuccessToast(data.msg);
      setTimeout(() => {
        window.location.href = "/html/login.html";
      }, 3000);
    }
  } catch (err) {
    showErrorToast("Failed to fetch data.");
  }
  return false;
}
