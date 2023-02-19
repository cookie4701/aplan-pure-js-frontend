import {reset_messages} from "./messages.js";
import {set_info,set_error} from "./gui.js";
import {post_ajax} from "./ajax.js";
import {build_gui} from "./gui.js";

export function update_password(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  reset_messages();

  if (document.getElementById('password_change').value !== document.getElementById('password_change2').value) {
    set_error('Passwörter stimmen nicht überein!');
    return;
  }

  let data = {
    "newpassword": document.getElementById('password_change').value
  };

  post_ajax(
    window.str_uri + '/rest/auth/pwchange.php',
    data,
    (data) => {
      set_info('Passwort wurde geändert');

      selected_app = '';
      build_gui();

    },
    (data) => {
      set_error('Es gab einen Fehler beim Ändern des Passworts! ' + data);
    }
  );
}
