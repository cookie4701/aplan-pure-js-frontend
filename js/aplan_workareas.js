import {reset_messages} from "./messages.js";
import {empty, attach_handler} from "./tools.js";
import {get_ajax,post_ajax} from "./ajax.js";
import {build_gui,set_info,set_error} from "./gui.js";

export function show_workareas(e) {

  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }

  attach_handler('btnsubmit_workareas_add', add_workarea);


  reset_messages();
  let table_wa = document.getElementById('table_workareas');
  empty(table_wa);

  window.selected_app = 'workareas';
  get_ajax(window.str_uri + '/rest/workareas/read.php',
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
        var input_visible = document.createElement('input');
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
  let url = window.str_uri + '/rest/workareas/create.php';
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

  var el = document.getElementById(event.target.id);
  var data = {};
  var url_req = window.str_uri;
  if (arr_target[0] === 'short') {
    var shorttext = document.getElementById('short-' + arr_target[1]).value;
    data = {
      "idWorkarea": arr_target[1],
      "short": shorttext
    };
    url_req += '/rest/workareas/update_short.php';
  } else if (arr_target[0] === 'explanation') {
    var explanation = document.getElementById('explanation-' + arr_target[1]).value;
    data = {
      "idWorkarea": arr_target[1],
      "explanation": explanation
    };
    url_req += '/rest/workareas/update_explanation.php';
  } else if (arr_target[0] === 'time') {
    var timecapital = document.getElementById('time-' + arr_target[1]).value;
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
