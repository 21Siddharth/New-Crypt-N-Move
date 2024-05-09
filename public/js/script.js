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
