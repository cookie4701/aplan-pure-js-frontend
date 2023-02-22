// remove all children from element
export function empty(element) {
  while (element.firstElementChild) {
    element.firstElementChild.remove();
  }
}

// general helper functions
export function calcTime () {
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

export function string_garbage(inputstring) {
  var r = inputstring.replace("ÃÂ©","é");
  r = r.replace("ÃÂ´", "ô");
  r = r.replace("ÃÂ¼", "ü");

  return r;
}

export function convertDatabaseDateStringToLocalDateString (databasedatestring) {
  var parts = databasedatestring.split('-');
  if (parts.length !== 3 ) return 'xxx';

  var local_date_string = parts[2] + '.' + parts[1] + '.' + parts[0];

  return local_date_string;
}

export function convertLocalDateStringToDatabaseString(localdatestring) {
  var parts = localdatestring.split('.');
  if (parts.length !== 3 ) return 'xxx';

  var database_date_string = parts[2] + '-' + parts[1] + '-' + parts[0];

  return database_date_string;
}

export function getDayname (d) {
  if ( d == 0 ) return "Montag";
  else if (d == 1) return "Dienstag";
  else if (d == 2) return "Mittowch";
  else if (d == 3) return "Donnerstag";
  else if (d == 4) return "Freitag";
  else if (d == 5) return "Samstag";
  else if (d == 7) return "Sonntag";
  else return "FEHLER!";
}

export function attach_handler(buttonid, cb_function) {
  var btn = document.getElementById(buttonid);
  if (btn.addEventListener) {
    btn.addEventListener("click", cb_function);
  } else
    btn.attachEvent("click", cb_function);
}
