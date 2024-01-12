import {moderation_schedule_save} from "./js/aplan_moderation_schedule.lib.js";
import { get_ajax, post_ajax} from "./js/ajax.js";
import { frm_mod_schedules } from "./js/aplan_moderation_schedule.lib.js";
import { frm_create_user } from "./js/aplan_moderation_create_user.js";
import { reset_messages } from "./js/messages.js";
import { build_gui, show_only_selected_app, hide_everything, show_app_pwchange } from "./js/gui.js";
import { attach_handler, empty} from "./js/tools.js";
import { update_password } from "./js/aplan_pwchange.js";
import {set_error,set_info} from "./js/gui.js";
import {show_workareas} from "./js/aplan_workareas.js";
import { frm_moderation_driverecompensation } from "./js/aplan_moderation_drive_recompensation.js";

// global vars

//window.str_uri = 'REPLACE_URL';
//window.str_uri = "https://testing.jugendbuero.duckdns.org";
window.str_uri = "https://remote.jugendbuero.be";

window.selected_app = '';

// public functions

// event handlers
function attach_handlers() {
  attach_handler('btnsubmit_login', submit_login_form);
  attach_handler('logout', logout);
  attach_handler('userinfo', get_userinfo);
  attach_handler('passwordchange', show_app_pwchange);
  attach_handler('btnsubmit_pwchange', update_password);
  attach_handler('workareas_show', show_workareas);
  attach_handler('create_new_user', frm_create_user);
  attach_handler('moderate_schedules', frm_mod_schedules);
  attach_handler('list_drive_recompensations', frm_moderation_driverecompensation);
}



function get_userinfo() {
  get_ajax(
    window.str_uri + '/rest/workareas/read.php',
    (data) => {
      console.log(data);
    },
    (data) => {
      console.log(data);
    }
  );
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('moderator');
  selected_app = '';
  build_gui();
}

function submit_login_form(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  reset_messages();

  var request_data = {
    'username': document.getElementById('username').value,
    'password': document.getElementById('password').value
  };

  post_ajax(
    window.str_uri + '/rest/auth/login.php',
    request_data,
    (data) => {
      if (data.length === 0) {
        set_error('Login fehlgeschlagen');
        return;
      }
      let arr = JSON.parse(data);
      if (arr.code === -1) {
        set_error('Login fehlgeschlagen');
        return;
      }

      localStorage.setItem('token', arr.token);

      if (arr.isModerator === true) localStorage.setItem('moderator', '1');
      else localStorage.setItem('moderator', '0');

      build_gui();


    },
    (data) => {
      set_error('Unbekannter Fehler!');
      console.log('error: ' + data);
    }
  );

}


document.addEventListener('DOMContentLoaded', (event) => {
  //the event occurred
  hide_everything();
  build_gui();
  attach_handlers();
});
