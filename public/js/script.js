document.addEventListener("DOMContentLoaded", function () {
  console.log("content loaded");
  const checkbox = document.getElementById("themeToggle");

  checkbox.addEventListener("change", function () {
    console.log("switching theme");
    if (this.checked) {
      console.log("darking");
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    } else {
      console.log("lighting");
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    }
  });
});
// Open the modal
function openModal() {
  document.getElementById("modal").style.display = "block";
  // Add event listener to close modal on clicking anywhere outside the modal content
  document.addEventListener("click", closeModalOutside);
}

// Close the modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
  // Remove event listener when modal is closed
  document.removeEventListener("click", closeModalOutside);
}

// Close modal when clicking anywhere outside the modal content
function closeModalOutside(event) {
  var modal = document.getElementById("modal");
  if (event.target == modal) {
    modal.style.display = "none";
    // Remove event listener when modal is closed
    document.removeEventListener("click", closeModalOutside);
  }
}