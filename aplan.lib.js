// global vars
//var str_uri = 'REPLACE_URL';
var str_uri = "https://testing.jugendbuero.duckdns.org";

var moderation_id_schedule = -1;

var selected_app = '';

// public functions

// event handlers
function attach_handlers() {
  attach_handler('btnsubmit_login', submit_login_form);
  attach_handler('logout', logout);
  attach_handler('userinfo', get_userinfo);
  attach_handler('passwordchange', show_app_pwchange);
  attach_handler('btnsubmit_pwchange', update_password);
  attach_handler('workareas_show', show_workareas);
  attach_handler('btnsubmit_workareas_add', add_workarea);
  attach_handler('create_new_user', frm_create_user);
  attach_handler('moderate_schedules', frm_mod_schedules)
}

function attach_handler(buttonid, cb_function) {
  var btn = document.getElementById(buttonid);
  if (btn.addEventListener) {
    btn.addEventListener("click", cb_function);
  } else
    btn.attachEvent("click", cb_function);
}

// moderation - schedules
function frm_mod_schedules(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  selected_app = 'dynamic_content';
  reset_messages();

  get_ajax('moderate_schedule.html', (data) => {
      let widget_div = document.getElementById('dynamic_content');
      widget_div.innerHTML = data;
      build_gui();
      var sel = document.getElementById('mod_schedule_list_users_select');
      sel.addEventListener('change', btn_schedules_load_single_user);
      load_users();
      hide_div_by_id('mod_schedule_user_new_pair');
    },

    (err) => {
      set_error('Es gab einen Fehler: ' + err);
    });
}

function btn_schedules_load_single_user(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  selected_app = 'dynamic_content';
  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var id = obj_select.value;
  var displayname = obj_select[obj_select.selectedIndex].text;
  document.getElementById('mod_schedule_user_info').innerHTML = 'Benutzer: ' + displayname;

  let data = {
    "userId": id
  };

  post_ajax(str_uri + '/rest/moderation/users/user_list_schedules.php', data,
    (res) => {
			var el = document.getElementById('mod_schedule_user_list_content');
      empty(el);

      arr = JSON.parse(res);

      for (var i = 0; i < arr.length; i++) {
        var row = document.createElement('tr');
        var col_start = document.createElement('td');
        var col_end = document.createElement('td');
        var col_label = document.createElement('td');
        var col_action = document.createElement('td');

				var btn_edit_schedule = document.createElement('button');
				btn_edit_schedule.addEventListener("click", edit_schedule );
				btn_edit_schedule.idSchedule = arr[i].idSchedule;
				btn_edit_schedule.userId = id;
				btn_edit_schedule.innerHTML = '!';

        col_start.innerHTML = convertDatabaseDateStringToLocalDateString(arr[i].startdate) ;
        col_end.innerHTML = convertDatabaseDateStringToLocalDateString(arr[i].enddate);
        col_label.innerHTML = arr[i].label;
				col_action.append(btn_edit_schedule);

        row.append(col_label);
        row.append(col_start);
        row.append(col_end);
        row.append(col_action);

        el.append(row);

      }

    },

    (err) => {}

  );
  reset_messages();
}

function edit_schedule (e) {
	selected_app = 'dynamic_content';

	let idSchedule = e.currentTarget.idSchedule;
  let idUser = parseInt(e.currentTarget.userId);

  load_schedule(idSchedule, idUser);
  show_div_by_id('mod_schedule_user_new_pair');
}

function load_schedule(idSchedule, idUser) {

  let data = {
    "schedule" : {
		    "idSchedule" : idSchedule,
		      "userId" : idUser
    }
	};

	post_ajax(str_uri + '/rest/moderation/users/user_scheduleitems_read.php', data,
	(res) => {
    moderation_id_schedule = idSchedule;
		var arr = JSON.parse(res);
    var table = document.getElementById('mod_schedule_user_setup_table');
    empty(table);

    for (var i=0; i < arr.length; i++) {
      var day = getDayname( parseInt(arr[i].dayOfWeek) );
      var row = document.createElement('tr');

      var cell_day = document.createElement('td');
      var cell_worktime = document.createElement('td');
      var cell_actions = document.createElement('td');

      cell_day.class = "day";
      cell_day.innerHTML = day;

      var input_hidden_day_of_week = document.createElement('input');
      input_hidden_day_of_week.value = arr[i].dayOfWeek;
      input_hidden_day_of_week.type = "hidden";
      input_hidden_day_of_week.id = "day-" + arr[i].idScheduleItem;



      var input_time_from = document.createElement('input');
      input_time_from.value = arr[i].time_from;
      input_time_from.style.width = 80;
      input_time_from.type = "text";
      input_time_from.classList.add("time_from");
      input_time_from.id = "from-" + arr[i].idScheduleItem
      input_time_from.addEventListener("blur", schedule_save_worktime)
      var input_time_to = document.createElement('input');
      input_time_to.value = arr[i].time_to;
      input_time_to.style.width = 80;
      input_time_to.type = "text";
      input_time_to.classList.add("time_to");
      input_time_to.id = "to-" + arr[i].idScheduleItem
      input_time_to.addEventListener("blur", schedule_save_worktime)

      var button_delete_pair = document.createElement('button');
      button_delete_pair.innerHTML = "X";
      //button_delete_pair.classList.add('pure-button');
      button_delete_pair.classList.add('button-warning');
      button_delete_pair.id = "delete-" + arr[i].idScheduleItem;
      button_delete_pair.addEventListener("click", moderation_schedules_button_delete_pair);

      cell_day.append(input_hidden_day_of_week);

      cell_worktime.append(input_time_from);
      cell_worktime.append(input_time_to);

      cell_actions.append(button_delete_pair);

      row.append(cell_day);
      row.append(cell_worktime);
      row.append(cell_actions);

      table.append(row);
    }
    calcTime();
	},
	(err) => {
		console.log(err);
	}
	);

}

function moderation_schedules_button_delete_pair (ev) {
  var parts = ev.target.id.split("-");
  if (parts.length !== 2 ||parts[0] !== "delete") return;
  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var id = obj_select.value;
  var data = {
    "userId" : id,
    "idScheduleItem" : parts[1]
  };

  post_ajax(str_uri + '/rest/moderation/users/user_scheduleitem_delete.php', data,
    (response) => {
      ev.target.parentElement.parentElement.remove();
      set_info('Eintrag wurde erfolgreich gelöscht');
      calcTime();
    },

    (error) => {
      set_error('Es gab ein Problem');
    } );
}

function schedule_save_worktime (ev) {
  var element_id = ev.target.id;
  var element_value = ev.target.value;

  var parts_id = element_id.split("-");

  if (parts_id.length !== 2) {
    reset_messages();
    set_error('Es gab ein Problem beim speichern!');
    return;
  }

  var idScheduleItem = parseInt(parts_id[1]);

  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var id = obj_select.value;

  // day of week

  var data = {
    "schedule" : {
      "idScheduleItem" : idScheduleItem,
      "timeFrom" : document.getElementById('from-' + idScheduleItem).value,
      "timeTo" : document.getElementById('to-' + idScheduleItem).value,
      "dayOfWeek" : document.getElementById('day-' + idScheduleItem).value,
      "userId" : document.getElementById('mod_schedule_list_users_select').value
    }


  };

  console.log(data);

  post_ajax(str_uri + '/rest/moderation/users/user_scheduleitem_update.php', data,
    // success
    (response) => {},
    // error
    (error) => {}
  );
}

function moderation_schedule_add_new_pair () {
  var data = {
    "userId" : 1,
    "scheduleitems" : [
      {
        "idSchedule" : moderation_id_schedule,
        "day" : parseInt( document.getElementById('mod_schedule_user_new_pair_select').value ),
        "time_from" : document.getElementById('mod_schedule_user_new_pair_from').value,
        "time_to" : document.getElementById('mod_schedule_user_new_pair_to').value
      }
    ]
  };

  post_ajax(str_uri + '/rest/moderation/users/user_scheduleitem_create.php',
    data,
    (response) => {
      if (response === "\"ok\"") {
        set_info('Eintrag gespeichert');
        load_schedule(moderation_id_schedule, 0);
    } else {
      set_error("Es gab ein Problem");
    }
    },
    (err) => {}
  );
}

function load_users() {
  get_ajax(str_uri + '/rest/moderation/users/list.php?orgacode=jbuero2020&page=1&nbritems=1000', (data) => {
    var el_select = document.getElementById('mod_schedule_list_users_select');
    var arr = JSON.parse(data);
    empty(document.getElementById('mod_schedule_list_users_select'));
    for (var i = 0; i < arr.length; i++) {
      var el = document.createElement('option');
      el.text = arr[i].displayname;
      el.value = arr[i].id;
      document.getElementById('mod_schedule_list_users_select').append(el);
    }

  }, (err) => {

  })
}

function frm_create_user(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  selected_app = 'create_user';
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
  selected_app = 'create_user';

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

  let url = str_uri + '/rest/moderation/users/create.php';
  post_ajax(url, data,
    (res) => {
      var arr = JSON.parse(res);
      if (arr.code == 200) {
        // ok
      } else {
        if (arr.message != "") {
          set_error("Es gab ein Problem: " + arr.message);
        } else {
          set_error("Es gab ein unbekanntes Problem");
        }

      }
    },
    (err) => {
      set_info("Es gab ein Problem: " + err)
    }
  );
}

function show_workareas(e) {

  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  reset_messages();
  let table_wa = document.getElementById('table_workareas');
  empty(table_wa);

  selected_app = 'workareas';
  get_ajax(str_uri + '/rest/workareas/read.php',
    (data) => {

      var arr = JSON.parse(data);
      for (var i = 0; i < arr.length; i++) {
        var row = document.createElement('div');
        row.setAttribute('class', 'workarea-row');

        var col_short = document.createElement('div');
        col_short.setAttribute('class', 'cell-1');
        var input_short = document.createElement('input');
        input_short.setAttribute('class', 'shortinput');
        input_short.value = arr[i].description;
        input_short.id = 'short-' + arr[i].idWorkarea;
        input_short.addEventListener('change', workarea_change);

        // create hidden entry for rank
        var input_hidden_rank = document.createElement('input');
        input_hidden_rank.id = 'rank-' + arr[i].id;
        input_hidden_rank.value = arr[i].rank;
        input_hidden_rank.setAttribute("type", "hidden");
        input_hidden_rank.setAttribute("class", "hidden-rank");

        // create hidden entry for id
        var input_hidden_id = document.createElement('input');
        input_hidden_id.id = 'id-' + arr[i].idWorkarea;
        input_hidden_id.value = arr[i].idWorkarea;
        input_hidden_id.setAttribute("type", "hidden");
        input_hidden_id.setAttribute("class", "hidden-id");

        col_short.append(input_short);
        col_short.append(input_hidden_id);
        col_short.append(input_hidden_rank);

        var col_explanation = document.createElement('div');
        col_explanation.setAttribute('class', 'cell-2');
        var input_explanation = document.createElement('input');
        input_explanation.value = arr[i].explanation;
        input_explanation.setAttribute('class', 'longinput');
        input_explanation.id = 'explanation-' + arr[i].idWorkarea;
        input_explanation.addEventListener('change', workarea_change);
        col_explanation.append(input_explanation);

        var col_time = document.createElement('div');
        col_time.setAttribute('class', 'cell-1');
        var input_time = document.createElement('input');
        input_time.setAttribute('class', 'shortinput');
        input_time.value = arr[i].timecapital;
        input_time.id = 'time-' + arr[i].idWorkarea;
        input_time.addEventListener('change', workarea_change);
        col_time.append(input_time);

        var col_visible = document.createElement('div');
        col_visible.setAttribute('class', 'cell-1');
        input_visible = document.createElement('input');
        input_visible.type = 'checkbox';
        input_visible.addEventListener('change', workarea_change);
        input_visible.id = 'visible-' + arr[i].idWorkarea;
        if (arr[i].visible == 1) {
          input_visible.checked = true;
        } else {
          input_visible.checked = false;
        }
        col_visible.append(input_visible);


        row.append(col_short);
        row.append(col_explanation);
        row.append(col_time);
        row.append(col_visible);

        document.getElementById('table_workareas').append(row);
      }

    },
    (data) => {
      console.log('error: ' + data);
    });
  build_gui();
}

async function add_workarea(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  reset_messages();

  let next_rank = 1;
  let rows = document.getElementsByClassName('hidden-rank');
  Array.from(rows).forEach(async (row) => {
    var r = parseInt(row.value);
    if (r >= next_rank) next_rank = r + 1;


  });

  let data = {
    "timecapital": "1",
    "explanation": "Lang",
    "description": "Kurz",
    "rank": next_rank
  };
  let url = str_uri + '/rest/workareas/create.php';
  post_ajax(url, data,
    (res) => {
      show_workareas(e);
    },
    (err) => {
      set_info("Es gab ein Problem: " + err)
    }
  );




}

function workarea_change(event) {

  var arr_target = event.target.id.split('-');
  if (arr_target.length != 2) {
    console.log('Need two array elements in arr_target');
    return;
  }

  el = document.getElementById(event.target.id);
  var data = {};
  var url_req = str_uri;
  if (arr_target[0] === 'short') {
    let shorttext = document.getElementById('short-' + arr_target[1]).value;
    data = {
      "idWorkarea": arr_target[1],
      "short": shorttext
    };
    url_req += '/rest/workareas/update_short.php';
  } else if (arr_target[0] === 'explanation') {
    let explanation = document.getElementById('explanation-' + arr_target[1]).value;
    data = {
      "idWorkarea": arr_target[1],
      "explanation": explanation
    };
    url_req += '/rest/workareas/update_explanation.php';
  } else if (arr_target[0] === 'time') {
    let timecapital = document.getElementById('time-' + arr_target[1]).value;
    data = {
      "idWorkarea": arr_target[1],
      "timecapital": timecapital
    };
    url_req += '/rest/workareas/update_timecapital.php';
  } else if (arr_target[0] === 'visible') {
    let visible = document.getElementById('visible-' + arr_target[1]).checked;
    data = {
      "idWorkarea": arr_target[1],
      "visible": visible
    };
    url_req += '/rest/workareas/update_visible.php';
  } else {
    console.log('unkown id');
    return;
  }
  // post data
  post_ajax(
    url_req,
    data,
    (data) => {
      let r = JSON.parse(data);
      if (r.code == 500) {
        set_info("Es gab ein Problem beim Speichern des Arbeitsbereichs " + r.message);

      } else {
        set_info('Arbeitsbereich wurde gespeichert!');
      }

      selected_app = 'workareas';
      build_gui();

    },
    (data) => {
      set_error('Es gab einen Fehler beim Ändern des Arbeitsbereich! ' + data);
    }
  );
}

function update_password(e) {
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
    str_uri + '/rest/auth/pwchange.php',
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

function get_userinfo() {
  get_ajax(
    str_uri + '/rest/workareas/read.php',
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
    str_uri + '/rest/auth/login.php',
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

// ajax helper functions
function post_ajax(url, data, cb_success, cb_error) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    // lambda
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // request done
      if (xhr.status === 200) {
        // request success
        cb_success(xhr.responseText);
      } else {
        // something went wrong
        cb_error(xhr.responseText);
      }
    } else {
      // not done
    }
  };

  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  let token = localStorage.getItem('token');
  if (token !== '') {
    xhr.setRequestHeader('Authorization', token);
  }
  xhr.send(JSON.stringify(data));
}

function get_ajax(url, cb_success, cb_error) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    // lambda
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // request done
      if (xhr.status === 200) {
        // request success
        cb_success(xhr.responseText);
      } else {
        // something went wrong
        cb_error(xhr.responseText);
      }
    } else {
      // not done
    }
  };

  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  let token = localStorage.getItem('token');
  if (token !== '') {
    xhr.setRequestHeader('Authorization', token);
  }
  xhr.send();
}


// display functions
function show_only_selected_app() {
  // hide everything
  hide_everything();



  // show selected app
  if (selected_app !== '') show_div_by_id(selected_app);
}

function reset_messages() {
  let el = document.getElementById('messages');
  el.innerHTML = '';
  el.setAttribute('class', '');
}

function set_error(str_warning) {
  let el = document.getElementById('messages');
  el.innerHTML = str_warning;
  el.setAttribute('class', 'bar error');
}

function set_info(str_info) {
  let el = document.getElementById('messages');
  el.innerHTML = str_info;
  el.setAttribute('class', 'bar info');
}

function hide_everything() {
  hide_div_by_id('menu');
  hide_div_by_id('login');
  hide_div_by_id('pwchange');
  hide_div_by_id('workareas');
  hide_div_by_id('dynamic_content');
}

function show_menu() {
  show_div_by_id('menu');
}

function hide_menu() {
  hide_div_by_id('menu');
}

function hide_by_class(str_class) {
  var els = document.getElementsByClassName(str_class);
  for (let i = 0; i < els.length; i++) {
    els[i].style.display = "none";
  }
}

function show_by_class(str_class) {
  var els = document.getElementsByClassName(str_class);
  for (let i = 0; i < els.length; i++) {
    els[i].style.display = "inline";
  }
}

function show_moderator() {
  show_by_class('moderator');
}

function show_login() {
  show_div_by_id('login');
}

function hide_login() {
  hide_div_by_id('login');
}

function hide_div_by_id(id) {
  var x = document.getElementById(id);
  x.style.display = "none";
}

function show_div_by_id(id) {
  var x = document.getElementById(id);
  x.style.display = "block";
}

function hide_moderator() {
  hide_by_class('moderator');
}

function show_app_pwchange() {
  selected_app = 'pwchange';
  build_gui();
}

function build_gui() {
  if (is_token_set()) {

    hide_login();

    if (is_moderator_set()) show_moderator();
    else hide_moderator();

    show_only_selected_app();
    show_menu();
  } else {
    hide_menu();
    hide_moderator();
    show_only_selected_app();
    show_login();
  }
}

// check if local-storage token is set
function is_token_set() {
  const token = localStorage.getItem('token');
  if (token !== null) {
    return true;
  }
  return false;
}

// check if moderator flag is set
function is_moderator_set() {
  const moderator = localStorage.getItem('moderator');
  if (moderator == '1') return true;
  return false;
}

// sets moderator flag
function set_moderator() {
  localStorage.setItem('moderator', '1');
}

// remove all children from element
function empty(element) {
  while (element.firstElementChild) {
    element.firstElementChild.remove();
  }
}

// general helper functions
function calcTime () {
  var from = document.getElementsByClassName('time_from');
  var to = document.getElementsByClassName('time_to');

  var t = 0;
  if (from.length != to.length) return;

  for (var i = 0; i < to.length; i++) {
    var parts_from = from[i].value.split(":");
    var parts_to = to[i].value.split(":");

    if (parts_from.length != 2 || parts_to.length != 2) return;

    t = (parseInt(parts_to[0]) * 60) + t;
    t = parseInt(parts_to[1]) + t;
    t = t - (parseInt(parts_from[0]) * 60);
    t = t - parseInt(parts_from[1]);

  }

  var h = parseInt( t / 60);

  var m = t - (60*h);
  var el = document.getElementById('mod_schedule_user_setup_total');
  if ( m < 10) {
    el.innerHTML = '' + h + ':0' + m;
  } else {
    el.innerHTML = '' + h + ':' + m;
  }
}

function convertDatabaseDateStringToLocalDateString (databasedatestring) {
  var parts = databasedatestring.split('-');
  if (parts.length !== 3 ) return 'xxx';

  var local_date_string = parts[2] + '.' + parts[1] + '.' + parts[0];

  return local_date_string;
}

function convertLocalDateStringToDatabaseString(localdatestring) {
  var parts = localdatestring.split('.');
  if (parts.length !== 3 ) return 'xxx';

  var database_date_string = parts[2] + '.' + parts[1] + '.' + parts[0];

  return database_date_string;
}

function getDayname (d) {
  if ( d == 0 ) return "Montag";
  else if (d == 1) return "Dienstag";
  else if (d == 2) return "Mittowch";
  else if (d == 3) return "Donnerstag";
  else if (d == 4) return "Freitag";
  else if (d == 5) return "Samstag";
  else if (d == 7) return "Sonntag";
  else return "FEHLER!";
}
