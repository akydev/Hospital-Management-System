import { checkAuth } from "./storeToken.js";
import { loadComponents, onlineApiUrl } from "./commonFunction.js";
import { showErrorToast } from "./toastifyMessage.js";

// Authenticate and then load components
checkAuth()
  .then(() => {
    return loadComponents();
  })
  .then(() => AppointmentList())
  .catch((error) => console.log("Error:", error));

function AppointmentList() {
  const role = localStorage.getItem("role");
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  // Check if necessary values exist in localStorage
  if (!role || !id || !token) {
    console.log("Missing required data.");
    return;
  }

  // Construct query based on role
  const query =
    role === "patient"
      ? `patientId=${id}`
      : role === "doctor"
      ? `doctorId=${id}`
      : null;

  fetch(`${onlineApiUrl}/appointments?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.appointments && data.appointments.length > 0) {
        const options = data.appointments.map((val) => {
          return `<div class="col" key="${val._id}">
                <div class="card h-100">
                    <div class="card-header">Your Appointment <i class="fas fa-trash"></i></div>
                    <div class="card-body">
                        <h5 class="card-title">Doctor:  ${
                          val.doctorId.firstName + " " + val.doctorId.lastName
                        }</h5>
                        <h5 class="card-title">Patient: ${
                          val.patientId.firstName + " " + val.patientId.lastName
                        }</h5>
                        <p class="card-text">Specialization:  ${
                          val.specializationId.title
                        }</p>
                        <p class="card-text">Appointment Time: ${new Date(
                          val.slotId.date
                        ).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })} ${val.slotId.time}</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">Booked ${new Date(
                          val.createdAt
                        ).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>`;
        });

        document.getElementById("appointmentList-container").innerHTML =
          options.join(" ");
      } else {
        showErrorToast(data.msg);
      }
    })
    .catch((err) => console.log(err));
}
