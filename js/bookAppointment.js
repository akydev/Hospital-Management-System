import { checkAuth } from "./storeToken.js";
import { loadComponents, onlineApiUrl } from "./commonFunction.js";
import { showErrorToast, showSuccessToast } from "./toastifyMessage.js";

let currentStep = 0;
let selectedSpecialityId = null;
let selectedDoctorId = null;
let selectedSlotId = null;
let selectedPatientId = null;
const steps = document.querySelectorAll(".form-step");
const specialityBtn = document.querySelector("#speciality-btn");
const doctorsBtn = document.querySelector("#doctors-btn");
const prevBtn = document.getElementById("prev-btn");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submit-btn").addEventListener("click", handleSubmit);
});

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
      const options = data.specialities.map((val) => {
        return `<div data-speciality-id="${val._id}" class="col">
                            <div class="card h-auto d-flex flex-column justify-content-center align-items-center">
                                <img src="../image/speciality-image.png" class="p-3 w-25" alt="image">
                                <div class="card-body">
                                    <h6 class="card-title">${val.title}</h6>          
                                </div>
                            </div>
                        </div>`;
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
}

function DoctorList(specialityId) {
  const token = localStorage.getItem("token");

  const apiUrl = specialityId
    ? `${onlineApiUrl}/doctors?specializationId=${specialityId}`
    : `${onlineApiUrl}/doctors`;

  fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const options = data.doctors.map((val) => {
        return `
        <div data-speciality-id="${val._id}" class="col">
                            <div class="card pb-3 h-auto d-flex flex-column justify-content-center align-items-center">
                                <img src="../image/speciality-image.png" class="p-3 w-25" alt="image">
                                <div class="card-body">
                                    <h6 class="card-title">${
                                      val.firstName + " " + val.lastName
                                    }</h6>
                                    ${val.specializationId
                                      .map((v) => {
                                        return `<p>${v.title}</p>`;
                                      })
                                      .join("")}
                                    
                                </div>
                                <button data-doctor-id="${
                                  val._id
                                }" class="btn btn-outline-primary" type="button">Book Appoinment</button>
                            </div>
                        </div>`;
      });
      document.getElementById("doctors-list").innerHTML = options.join(" ");

      // Add event listeners to each doctor item
      document.querySelectorAll("[data-doctor-id]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          selectedDoctorId = item.dataset.doctorId;
          // Set the selectedSpecialityId based on the doctor's specialty
          selectedSpecialityId =
            data.doctors.find((doc) => doc._id === selectedDoctorId)
              ?.specializationId._id || null;
          console.log(selectedDoctorId);
          SlotList(selectedDoctorId);
          showStep(2);
        });
      });
    })
    .catch((err) => console.log(err));
}

function SlotList(doctorId) {
  const token = localStorage.getItem("token");

  fetch(`${onlineApiUrl}/slots?doctorId=${doctorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const options = data.slots.map((val) => {
        const isBooked = !val.isAvailable;
        const slotClasses = isBooked
          ? "bg-gray-300 cursor-not-allowed opacity-50"
          : "bg-white pointer-event hover:shadow-sky-400";
        return `
        <div  class="col card pointer-event ${slotClasses}" data-slot-id="${
          val._id
        }" ${isBooked ? "disabled" : ""}>
  <div class="card-body">
    <h5 class="card-title"> ${new Date(val.date).toLocaleDateString()}</h5>
    <p class="card-text"> ${val.time}</p>
  </div>
</div>  `;
      });

      document.getElementById("slots-list").innerHTML = options.join(" ");
      // Add event listeners to each available slot
      document
        .querySelectorAll("[data-slot-id]:not([disabled])")
        .forEach((item) => {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            selectedSlotId = item.dataset.slotId;
            showStep(3);
            PatientList();
          });
        });
    })
    .catch((err) => console.log(err));
}
function PatientList() {
  const token = localStorage.getItem("token");
  const searchInput = document.getElementById("search-input");
  //Listen for input in the search field.
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query.length > 0) {
      fetch(`${onlineApiUrl}/patients/search?name=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.patients.length === 0) {
            document.getElementById(
              "patients-list"
            ).innerHTML = `<div>No Patients Found.</div>`;
            return;
          }
          const options = data.patients.map((patient) => {
            return `<div
            class="patient-item d-flex justify-content-between p-3 pointer-event"
            data-patient-id="${patient._id}">
              <h5 class="">
                ${patient.firstName + " " + patient.lastName}
              </h5>
              <p class="">
                ${patient.patientID}
              </p>
          </div>
        `;
          });

          document.getElementById("patients-list").innerHTML =
            options.join(" ");

          // Add event listeners to each patient item
          document.querySelectorAll("[data-patient-id]").forEach((item) => {
            item.addEventListener("click", (e) => {
              e.preventDefault();

              // Remove 'selected' class from previously selected patient
              document.querySelectorAll(".patient-item").forEach((el) => {
                el.classList.remove("border");
              });

              // Add 'selected' class to the clicked item
              item.classList.add("border");
              selectedPatientId = item.dataset.patientId;
            });
          });
        })
        .catch((err) => console.log(err));
    } else {
      document.getElementById("patients-list").innerHTML = "";
    }
  });
}
function showStep(step) {
  currentStep = step;
  steps.forEach((step, index) => {
    step.classList.toggle("d-none", index !== currentStep);
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

// handleSubmit
async function handleSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  // Validate all required fields
  if (!selectedSpecialityId) {
    showErrorToast("Speciality is required.");
    return;
  }
  if (!selectedDoctorId) {
    showErrorToast("Doctor is required.");
    return;
  }
  if (!selectedSlotId) {
    showErrorToast("Slot is required.");
    return;
  }
  if (!selectedPatientId) {
    showErrorToast("Patient is required.");
    return;
  }

  const appointmentData = {
    specializationId: selectedSpecialityId,
    doctorId: selectedDoctorId,
    slotId: selectedSlotId,
    patientId: selectedPatientId,
  };

  try {
    const response = await fetch(`${onlineApiUrl}/appointments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
    const data = await response.json();
    if (!response.ok) {
      showErrorToast(data.msg);
      return;
    }
    if (response.ok) {
      showSuccessToast(data.msg);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  } catch (err) {
    showErrorToast("Failed to fetch data");
  }

  return false;
}
