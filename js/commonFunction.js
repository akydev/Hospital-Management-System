import { logout } from "./storeToken.js";

export const onlineApiUrl =
  "https://hospital-management-backend-theta.vercel.app/api";
//Create regex for validation.
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const nameRegex = /^[A-Za-z]+$/;
export const upperCaseRegex = /(?=.*[A-Z])/;
export const lowerCaseRegex = /(?=.*[a-z])/;
export const specialCharRegex = /(?=.*[@#$%^&+-=()])/;
export const numberRegex = /(?=.*[0-9])/;
export const noWhiteSpaceRegex = /(?=\S+$)/;
export const lengthRegex = /.{8,12}/;
export const phoneRegex = /^[0-9]{10}$/;
export const pinCodeRegex = /^[0-9]{6}$/;
export const lcnRegex = /^[0-9]{16}$/;

//Create ismatched function.
export function isMatchedPassword() {
  let pass = document.getElementById("password").value;
  let confPass = document.getElementById("confirmPassword").value;
  return pass === confPass;
}

//Create gender validation function.
export function genderValidation() {
  let selectGender = document.querySelector("input[name = 'gender']:checked");
  if (!selectGender) {
    return "Please select a gender.";
  }
  return "";
}

//Create a validate password function.
export function validatePassword(value) {
  if (!upperCaseRegex.test(value)) {
    return "Password must contain at least one uppercasr letter.";
  } else if (!lowerCaseRegex.test(value)) {
    return "Password must contain at least one lowercase letter.";
  } else if (!specialCharRegex.test(value)) {
    return "Password must contain at least one special character.";
  } else if (!numberRegex.test(value)) {
    return "Password must contain at least one numeric digit.";
  } else if (!noWhiteSpaceRegex.test(value)) {
    return "Password must not contain any whitespace.";
  } else if (!lengthRegex.test(value)) {
    return "Password must be in between 8-12 characters long.";
  }
  return "";
}

//Create function for loadComponents.
export function loadComponents() {
  //Create an array of promises for loading components.
  // const loadSidebar = fetch("../common/sidebar.html")
  //   .then((response) => {
  //     if (!response.ok) throw new Error("Failed to load sidebar");
  //     return response.text();
  //   })
  //   .then((data) => {
  //     document.getElementById("sidebar-container").innerHTML = data;
  //     const sidebarContainer = document.getElementById("menu-item");
  //     const role = localStorage.getItem("role");

  //     let sidebarHTML = ``;
  //     if (role === "doctor") {
  //       sidebarHTML += `
  //         <li>
  //           <a
  //             href="/html/patientsList.html">
  //             <span class="text-xl">🧑‍⚕️</span>
  //             <span>Patients List</span>
  //           </a>
  //         </li>
  //       `;
  //     }

  //     sidebarContainer.innerHTML += sidebarHTML;
  //   });

  const loadHeader = fetch("../common/header.html")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load header");
      return response.text();
    })
    .then((data) => {
      const headerContainer = document.getElementById("header-container");
      headerContainer.innerHTML = data;

      const logoutBtn = headerContainer.querySelector("button");
      logoutBtn.addEventListener("click", () => {
        logout();
      });
    });

  // Return a promise that resolves when both components are loaded
  // return Promise.all([loadSidebar, loadHeader]);
  return Promise.all([loadHeader]);
}

//Create a SpecialityList function.
export function SpecialityList() {
  fetch(`${onlineApiUrl}/speciality`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      const options = data.specialities.map((val) => {
        return `<option value = "${val._id}">${val.title}</option>`;
      });
      options.unshift(`<option value="">Select Speciality</option>`);
      document.getElementById("specialization").innerHTML = options.join(" ");
    })
    .catch((err) => {
      console.log(err);
    });
}
