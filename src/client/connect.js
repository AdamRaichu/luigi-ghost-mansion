/**
 * @type {HTMLInputElement}
 */
const hostInput = document.getElementById("host");

document.getElementById("connect").addEventListener("click", function () {
  const hostValue = encodeURIComponent(hostInput.value);
  location.href = `./game.html?socket_host=${hostValue}`;
});
