//Check Authonticaton function.
export function checkAuth() {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    if (token) {
      resolve();
    } else {
      window.location.href = "/html/login.html";
      reject(new Error("No token found. Redirecting to login."));
    }
  });
}

export function checkAuthRoute() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/html/bookAppointment.html";
  }
}
//Logout Function.
export function logout() {
  localStorage.clear();
  window.location.href = "/html/login.html";
}

// document.addEventListener("DOMContentLoaded", () => {
//   const logoutButton = document.getElementById("logoutButton");
//   if (logoutButton) {
//     logoutButton.addEventListener("click", () => {
//       logout();
//     });
//   }
// });
