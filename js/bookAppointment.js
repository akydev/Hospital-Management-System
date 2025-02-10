import { checkAuth } from "./storeToken.js";
import {
  loadComponents,
  onlineApiUrl,
  SpecialityList,
} from "./commonFunction.js";
import { showErrorToast, shorSuccessToast } from "./toastifyMessage.js";

let currentStep = 0;
let selectedSpecialityId = null;
const steps = document.querySelector(".form-step");
const specialityBtn = document.querySelector("#speciality-btn");
const doctorsBtn = document.querySelector("#doctors-btn");
const prevBtn = document.getElementById("prev-btn");

//Authenticate and then load components.
checkAuth()
  .then(() => {
    return loadComponents();
  })
  .then(() => SpecialityList())
  .catch((error) => console.log("Error: ", error));

function SpecialityList() {
  fetch(`${onlineApiUrl}/speciality`)
    .then((res) => res.json())
    .then((data) => {
      const options = data.specialites.map((val) => {
        return `
             <li data-speciality-id="${val._id}">
            <img
              src="../img/speciality-icon.jpeg"
              alt="speciality"
            />
            <h2>
              ${val.title}
            </h2>
          </li>
            `;
      });
      document.getElementById("speciality-list").innerHTML = options.join(" ");

      //Add event listeners to each speciality item.
      document.querySelectorAll("[data-speciality-id]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          selectedSpecialityId = item.dataset.specialityId;
          DoctorList(selectedSpecialityId);
          showStep(1);
        });
      });
    })
    .catch((err) => console.log(err));
};

function DoctorList(specialityId) {
  const apiUrl = specialityId
    ? `${onlineApiUrl}/doctors?specializationId=${specialityId}`
    : `${onlineApiUrl}/doctors`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      const options = data.doctors.map((val) => {
        return `
                 <div>
              <img
                src="../img/doctor1.png"
                loading="lazy"
              />
              <div>
                <div>
                  <h5>
                    ${val.firstName + " " + val.lastName}
                  </h5>
                  <p>
                    ${val.specializationId?.title}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    data-doctor-id="${val._id}"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
          </div>
            `;
      });
      document.getElementById("doctors-list").innerHTML = options.join(" ");

      //Add event listeners to each doctor item.
      document.querySelectorAll("[data-doctor-id]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const doctorId = item.dataset.doctorId;
          //Set the selectedSpecialityId based on the doctor`s specialty.
          selectedSpecialityId =
            data.dotors.find((doc) => doc._id === doctorId)?.specializationId
              ._id || null;
          SlotList(doctorId);
          showStep(2);
        });
      });
    })
    .catch((err) => console.log(err));
};

function SlotList(doctorId) {
  fetch(`${onlineApiUrl}/slot?doctor=${doctorId}`)
    .then((res) => res.json())
    .then((data) => {
      const options = data.slots.map(
        (val) => `
            <div>
                <h5>
                  ${new Date(val.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h5>
            </div>
          `
      );

      document.getElementById("slots-list").innerHTML = options.join(" ");
    })
    .catch((err) => console.log(err));
};

function showStep(step) {
    currentStep = step;
    steps.forEach((step, index) => {
      step.classList.toggle("hidden", index !== currentStep);
    });
  
    prevBtn.disabled = currentStep === 0;
  }
  
  specialityBtn.addEventListener("click", () => {
    showStep(0);
  });
  
  doctorsBtn.addEventListener("click", () => {
    DoctorList();
    showStep(1);
  });
  
  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });