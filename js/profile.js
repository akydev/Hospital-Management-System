import { checkAuth } from "./storeToken.js";
import { loadComponents, onlineApiUrl } from "./commonFunction.js";
import { showErrorToast, showSuccessToast } from "./toastifyMessage.js";

//Authenticate and then load components and profile.
checkAuth()
  .then(() => {
    return loadComponents();
  })
  .then(() => {
    loadProfile();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });

function loadProfile() {
  const profileContainer = document.getElementById("profile-container");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const profilePages = {
    doctor: "../common/doctorProfile.html",
    patient: "../common/patientProfile.html",
  };

  const profilePage = profilePages[role];
  if (!profilePage) {
    profileContainer.innerHTML = "<p>Error: Role not recognized.</p>";
    return;
  }
  // console.log(profilePage);
  //Fetch the appropriate profile page.
  fetch(profilePage)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      // console.log(response);
      return response.text();
    })
    .then((data) => {
      profileContainer.innerHTML = data;
      attachFormSubmitListener();
      fetchProfileData(role, token);
    })
    .catch((error) => {
      profileContainer.innerHTML = "<p>Error loading profile.</p>";
      console.log("Error fetching profile:", error);
    });
}

function attachFormSubmitListener() {
  const profileForm = document.getElementById("profileForm");
  if (!profileForm) {
    profileForm.addEventListener("submit", handleSubmit);
  }
}

function fetchProfileData(role, token) {
  fetch(`${onlineApiUrl}/accounts/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => populateForm(role, data))
    .catch((err) => console.log("Error fetching profile data: ", err));
}

const roleFields = {
  patient: ["firstName", "lastName", "email", "password", "phone"],
  doctor: [
    "firstName",
    "lastName",
    "password",
    "phone",
    "experience",
    "licenseNumber",
  ],
};

function populateForm(role, data) {
  const fields = roleFields[role] || [];

  fields.forEach((field) => {
    const inputElement = document.querySelector(`input[name = "${field}"]`);
    if (inputElement) {
      inputElement.value = data[field] || "";
    }
  });

  //Handling the nested address object.
  if (data.fullAddress) {
    const adressFields = ["addressLine", "city", "state", "country", "pincode"];
    adressFields.forEach((field) => {
      const inputElement = document.querySelector(
        `input[name = "fullAddress.${field}"]`
      );
      if (inputElement) {
        inputElement.value = data.fullAddress[field] || "";
      }
    });
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const role = localStorage.getItem("role");
  const id = localStorage.getItem("id");
  const fields = roleFields[role] || [];
  const formData = {};
  console.log(formData);
  //Handle non-address fields
  fields.forEach((field) => {
    const inputElement = document.querySelector(`input[name = "${field}"]`);
    if (inputElement) {
      formData[field] = inputElement.value;
    }
  });

  //Handle the nested address object.
  formData.fullAddress = {};
  const adressFields = ["addressLine", "city", "state", "country", "pincode"];
  adressFields.forEach((field) => {
    formData.fullAddress[field] = document.querySelector(
      `input[name = "fullAddress.${field}"]`
    ).value;
  });
  try {
    const response = await fetch(`${onlineApiUrl}/accounts/update/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (!response.ok) {
      showErrorToast(data.msg);
      return;
    }
    if (response.ok) {
      showSuccessToast(data.msg);
    }
  } catch (err) {
    showErrorToast("Error updating profile");
  }

  return false;
}
