
export function reset_messages() {
  let el = document.getElementById('messages');
  el.innerHTML = '';
  el.setAttribute('class', '');
}
