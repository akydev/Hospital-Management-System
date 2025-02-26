import { checkAuth } from "./storeToken.js";
import { loadComponents, onlineApiUrl } from "./commonFunction.js";
// Authenticate and then load components. use Promise.

checkAuth()
  .then(() => {
    return loadComponents();
  })
  .then(() => PatientList())
  .catch((error) => console.log("Error:", error));

function PatientList() {
  const role = localStorage.getItem("role");
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  if (role === "doctor") {
    fetch(`${onlineApiUrl}/patients?doctorId=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const options = data.patients.map((val) => {
          return `<div data-speciality-id="${val._id}" class="col mb-4">
                            <div class="card h-auto d-flex flex-column justify-content-center align-items-center">
                                <img src="../image/speciality-image.png" class="p-3 w-25" alt="image">
                                <div class="card-body">
                                 <h6 class="card-title">${val.patientId}</h6>
                                    <h6 class="card-title">${
                                      val.firstName + " " + val.lastName
                                    }</h6>
                                    <p class="card-text">${val.gender}</p>
                                    <p class="card-text">${new Date(
                                      val.dob
                                    ).toLocaleDateString()}</p>
                                    <p class="card-text">${val.phone}</p>
                                                                        <p class="card-text">${new Date(
                                                                          val.createdAt
                                                                        ).toLocaleDateString()}</p>
                                </div>
                                <button  type="button">Book Appoinment</button>
                            </div>
                        </div>`;
        });
        document.getElementById("patientList-container").innerHTML =
          options.join(" ");
      })
      .catch((err) => console.log(err));
  } else {
    document.getElementById("patientList-container").innerHTML = `
    <tr>
      <td colspan="7">
        <p>Error: You are not authorized to view this page.</p>
      </td>
    </tr>`;
  }
}
