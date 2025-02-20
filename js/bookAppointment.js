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
        return `
        <div data-speciality-id="${val._id}" class="col mb-4">
                            <div class="card h-auto d-flex flex-column justify-content-center align-items-center">
                                <img src="../image/speciality-image.png" class="p-3 w-25" alt="image">
                                <div class="card-body">
                                    <h6 class="card-title">${val.title}</h6>
                                    
                                </div>
                            </div>
                        </div> `;
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
  const apiUrl = specialityId
    ? `${onlineApiUrl}/doctors?specializationId=${specialityId}`
    : `${onlineApiUrl}/doctors`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      const options = data.doctors.map((val) => {
        return `
        <div data-speciality-id="${val._id}" class="col mb-4">
                            <div class="card h-auto d-flex flex-column justify-content-center align-items-center">
                                <img src="../image/speciality-image.png" class="p-3 w-25" alt="image">
                                <div class="card-body">
                                    <h6 class="card-title">${
                                      val.firstName + " " + val.lastName
                                    }</h6>
                                    <p class="card-text">${
                                      val.specializationId?.title
                                    }</p>
                                </div>
                                <button data-doctor-id="${
                                  val._id
                                }" type="button">Book Appoinment</button>
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
  fetch(`${onlineApiUrl}/slots?doctorId=${doctorId}`)
    .then((res) => res.json())
    .then((data) => {
      const options = data.slots.map(
        (val) => `
            <div>
                <h5>
                ${new Date(val.date).toLocaleDateString()}
                </h5>
                <h5>
                ${val.time}
              </h5>
            </div>`
      );

      document.getElementById("slots-list").innerHTML = options.join(" ");
    })
    .catch((err) => console.log(err));
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
