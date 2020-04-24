/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
document.getElementById('topbar_account_item').addEventListener('click', function() {
  document.getElementById("topbar_account_content").classList.toggle("nav-dropdown-show")
})

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.closest('#topbar_account')) {
    var myDropdown = document.getElementById("topbar_account_content")
    if (myDropdown.classList.contains('nav-dropdown-show')) {
      myDropdown.classList.remove('nav-dropdown-show')
    }
  }
}
