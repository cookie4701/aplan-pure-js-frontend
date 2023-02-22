// moderation - schedules
import { reset_messages } from "./messages.js";
import { get_ajax, post_ajax} from "./ajax.js";
import { build_gui, hide_div_by_id, show_div_by_id, set_info, set_error } from "./gui.js";
import {
  empty,
  convertLocalDateStringToDatabaseString,
  convertDatabaseDateStringToLocalDateString,
  calcTime,
  getDayname,
  string_garbage
} from "./tools.js";

var moderation_id_schedule = -1;

export function moderation_schedule_save(ev) {
  var parts = ev.target.id.split("-");
  if (parts.length !== 2) return;

  if ( ! ( parts[0] === 'startdate' || parts[0] === 'enddate' || parts[0] === 'label') ) return;

  var idSchedule = parseInt(parts[1]);
  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var el_startdate = document.getElementById('startdate-' + idSchedule);
  var el_enddate = document.getElementById('enddate-' + idSchedule);
  var el_label = document.getElementById('label-' + idSchedule);
  var id = obj_select.value;
  var data = {
    "userId" : id,
    "idSchedule" : idSchedule,
    "startdate" : convertLocalDateStringToDatabaseString(el_startdate.value),
    "enddate" : convertLocalDateStringToDatabaseString(el_enddate.value),
    "label" : el_label.value
  };

  post_ajax(window.str_uri + '/rest/moderation/users/user_update_schedule.php', data,
    (response) => {
      set_info('Eintrag wurde erfolgreich geändert');
    },

    (error) => {
      set_error('Es gab ein Problem');
    } );

  //console.log(ev.target.id);
}


export function frm_mod_schedules(e) {

  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  window.selected_app = 'dynamic_content';
  reset_messages();



  get_ajax('moderate_schedule.html', (data) => {
      let widget_div = document.getElementById('dynamic_content');
      widget_div.innerHTML = data;
      build_gui();
      var sel = document.getElementById('mod_schedule_list_users_select');
      sel.addEventListener('change', btn_schedules_load_single_user);
      load_users();
      hide_div_by_id('mod_schedule_user_new_pair');
      var btn = document.getElementById('moderation_button_schedule_create_new');
      btn.addEventListener('click', create_new_schedule);
    },

    (err) => {
      set_error('Es gab einen Fehler: ' + err);
      return;
    });


}

function create_new_schedule () {
  // get current user, return if none
  var el_select = document.getElementById('mod_schedule_list_users_select');
  var idUser = el_select.value;

  if (idUser === undefined) {
    return;
  }

  if (idUser === 0) {
    return;
  }

  var tempdate = new Date();
  var month = tempdate.getMonth() + 1;
  var day = tempdate.getDate();

  if (month < 10) month = '0' + month;

  if (day < 10) day = '0' + day;
  var startdate = tempdate.getFullYear() + "-" + month + '-' + day;
  var enddate = tempdate.getFullYear()+5 + "-12-31";
  var label = "Neuer Plan (" + tempdate.toDateString() + ")";

  var data = {
    "userId" : idUser,
    "startdate" : startdate,
    "enddate" : enddate,
    "label" : label
  };

  post_ajax(window.str_uri + '/rest/moderation/users/user_create_schedule.php', data, 
    (data) => {
      set_info('Stundenplan erfolgreich angelegt!');
      btn_schedules_load_single_user(null);

    },
    (err) => {
      set_error('Stundenplan konnte nicht angelegt werden');
    }
  );

}

export function btn_schedules_load_single_user(e) {
  if (e){
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  var el_button = document.getElementById('moderation_button_schedule_add_new_pair');
  el_button.addEventListener("click", moderation_schedule_add_new_pair);

  selected_app = 'dynamic_content';
  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var id = obj_select.value;
  var displayname = obj_select[obj_select.selectedIndex].text;
  document.getElementById('mod_schedule_user_info').innerHTML = 'Benutzer: ' + displayname;

  let data = {
    "userId": id
  };

  post_ajax(window.str_uri + '/rest/moderation/users/user_list_schedules.php', data,
    (res) => {
			var el = document.getElementById('mod_schedule_user_list_content');
      empty(el);

      var arr = JSON.parse(res);

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

        var el_start = document.createElement('input');
        el_start.id = "startdate-" +  arr[i].idSchedule;
        el_start.value = convertDatabaseDateStringToLocalDateString(arr[i].startdate) ;
        el_start.addEventListener("change", moderation_schedule_save);
        col_start.append(el_start);

        var el_end = document.createElement('input');
        el_end.id = "enddate-" + arr[i].idSchedule;
        el_end.value = convertDatabaseDateStringToLocalDateString(arr[i].enddate) ;
        el_end.addEventListener("change", moderation_schedule_save);
        col_end.append(el_end);

        var el_label = document.createElement('input');
        el_label.id = "label-" + arr[i].idSchedule;
        el_label.value = arr[i].label;
        el_label.addEventListener("change", moderation_schedule_save);
        col_label.append(el_label);

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

export function edit_schedule (e) {
	selected_app = 'dynamic_content';

	let idSchedule = e.currentTarget.idSchedule;
  let idUser = parseInt(e.currentTarget.userId);

  load_schedule(idSchedule, idUser);
  show_div_by_id('mod_schedule_user_new_pair');
}

export function load_schedule(idSchedule, idUser) {

  let data = {
    "schedule" : {
		    "idSchedule" : idSchedule,
		      "userId" : idUser
    }
	};

	post_ajax(window.str_uri + '/rest/moderation/users/user_scheduleitems_read.php', data,
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

export function moderation_schedules_button_delete_pair (ev) {
  var parts = ev.target.id.split("-");
  if (parts.length !== 2 ||parts[0] !== "delete") return;
  var obj_select = document.getElementById('mod_schedule_list_users_select');
  var id = obj_select.value;
  var data = {
    "userId" : id,
    "idScheduleItem" : parts[1]
  };

  post_ajax(window.str_uri + '/rest/moderation/users/user_scheduleitem_delete.php', data,
    (response) => {
      ev.target.parentElement.parentElement.remove();
      set_info('Eintrag wurde erfolgreich gelöscht');
      calcTime();
    },

    (error) => {
      set_error('Es gab ein Problem');
    } );
}

export function schedule_save_worktime (ev) {
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


  post_ajax(window.str_uri + '/rest/moderation/users/user_scheduleitem_update.php', data,
    // success
    (response) => {
      set_info("Arbeitszeit erfolgreich angepasst");
      calcTime();
    },
    // error
    (error) => {}
  );
}

export function moderation_schedule_add_new_pair () {
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

  post_ajax(window.str_uri + '/rest/moderation/users/user_scheduleitem_create.php',
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

export function load_users() {
  get_ajax(window.str_uri + '/rest/moderation/users/list.php?orgacode=jbuero2020&page=1&nbritems=1000', (data) => {
    var el_select = document.getElementById('mod_schedule_list_users_select');
    var arr = JSON.parse(data);
    empty(document.getElementById('mod_schedule_list_users_select'));
    for (var i = 0; i < arr.length; i++) {
      var el = document.createElement('option');
      el.text = string_garbage(arr[i].displayname);
      el.value = arr[i].id;
      document.getElementById('mod_schedule_list_users_select').append(el);
    }

    btn_schedules_load_single_user(null);

  }, (err) => {
    set_error("Benutzerliste konnte nicht geladen werden!")
    return;
  });


}
