/**
 * @type {HTMLInputElement}
 */
const hostInput = document.getElementById("host");
/**
 * @type {HTMLInputElement}
 */
const secureInput = document.getElementById("secure");

document.getElementById("connect").addEventListener("click", function () {
  const hostValue = encodeURIComponent(hostInput.value);
  location.href = `./game.html?socket_host=${hostValue}${secureInput.checked ? "&secure_socket" : ""}`;
});
