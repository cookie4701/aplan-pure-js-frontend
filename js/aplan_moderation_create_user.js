import {post_ajax, get_ajax } from "./ajax.js";
import {build_gui, set_error } from "./gui.js";
import {reset_messages} from "./messages.js";
import { attach_handler } from "./tools.js";

export function frm_create_user(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  window.selected_app = 'dynamic_content';
  reset_messages();

  get_ajax('create_user.html', (data) => {
      // do something
      let widget_div = document.getElementById('dynamic_content');
      widget_div.innerHTML = data;
      attach_handler('btn_create_user', create_user);
      build_gui();
    },
    (err) => {
      set_error('Es gab einen Fehler: ' + err);
    });

}

//TODO: allow multiple entries at once
function get_day_pair(dayname) {
  let r = [];

  if (document.getElementById('create_user_' + dayname + '_start').value != "" &&
    document.getElementById('create_user_' + dayname + '_end').value != "") {

    r.push_back(document.getElementById('create_user_' + dayname + '_start').value);
    r.push_back(document.getElementById('create_user_' + dayname + '_end').value);
  }

  return r;
}

function create_user(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  reset_messages();
  window.selected_app = 'create_user';

  let data = {
    "username": document.getElementById('createuser_username'),
    "displayname": document.getElementById('createuser_displayname'),
    "email": document.getElementById('createuser_email'),
    "password": document.getElementById('createuser_password'),
    "cpassword": document.getElementById('createuser_cpassword'),
    "startdate": document.getElementById('createuser_startdate'),
    "hollidays": document.getElementById('createuser_hollidays'),
    "vacaction": document.getElementById('createuser_vacation'),
    "drive": document.getElementById('createuser_drive'),
    "monday": get_day_pair("monday"),
    "tuesday": get_day_pair("tuesday"),
    "wednesday": get_day_pair("wednesday"),
    "thursday": get_day_pair("thursday"),
    "friday": get_day_pair("friday")
  };

  let url = window.str_uri + '/rest/moderation/users/create.php';
  post_ajax(url, data,
    (res) => {
      var arr = JSON.parse(res);
      if (arr.code == 200) {
        // ok
        set_info("Benutzer wurde erfolgreich angelegt")
      } else {
        if (arr.message != "") {
          set_error("Es gab ein Problem: " + arr.message);
        } else {
          set_error("Es gab ein unbekanntes Problem");
        }

      }
    },
    (err) => {
      set_error("Es gab ein Problem: " + err)
    }
  );
}
