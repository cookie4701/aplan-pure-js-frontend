// global vars
//var str_uri = 'REPLACE_URL';
var str_uri = 'https://testing.jugendbuero.duckdns.org';

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
	//attach_handler('btnsubmit_workareas_change', update_workareas);
}

function attach_handler(buttonid, cb_function) {
	var btn = document.getElementById(buttonid);
	if (btn.addEventListener) {
		btn.addEventListener("click", cb_function);
	}
	else 
		btn.attachEvent("click", cb_function);
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
		for (var i=0; i < arr.length; i++ ) {
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
			var input_hidden_id = document.createElement('input');
			input_hidden_id.id = 'rank-' + arr[i].idWorkarea;
			input_hidden_id.value = arr[i].idWorkarea;
			input_hidden_id.setAttribute("type", "hidden");
			input_hidden_id.setAttribute("class", "hidden-id");
			
			col_short.append(input_short);
			col_short.append(input_hidden_id);
			
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
			if (arr[i].visible == 1)
			{
				input_visible.checked = true;
			}
			else
			{
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

function workarea_change(event) {
	//console.log('event changed happened: ' + event.target.id);
	var arr_target = event.target.id.split('-');
	if ( arr_target.length != 2 ) {
		console.log('Need two array elements in arr_target');
		return;
	}
	
	el = document.getElementById(event.target.id);
	var data = {};
	var url_req = str_uri;
	if ( arr_target[0] === 'short' ) {
		let shorttext = document.getElementById('short-' + arr_target[1]).value;
		data = {"idWorkarea" : arr_target[1], "short" : shorttext };
		url_req += '/rest/workareas/update_short.php';
	} else if ( arr_target[0] === 'explanation' ) {
		let explanation = document.getElementById('explanation-' + arr_target[1]).value;
		data = {"idWorkarea" : arr_target[1], "explanation" : explanation };
		url_req += '/rest/workareas/update_explanation.php';
	} else if ( arr_target[0] === 'time' ) {
		let timecapital = document.getElementById('time-' + arr_target[1]).value;
		data = {"idWorkarea" : arr_target[1], "timecapital" : timecapital };
		url_req += '/rest/workareas/update_timecapital.php';
	} else if ( arr_target[0] === 'visible' ) {
		let visible = document.getElementById('visible-' + arr_target[1]).checked;
		data = {"idWorkarea" : arr_target[1], "visible" : visible };
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
			if (r.code == 500 )
			{
				set_info("Es gab ein Problem beim Speichern des Arbeitsbereichs " + r.message);
				
			}
			else {
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
/*
function update_workareas(e) {
	e = e || window.event;
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	
	// collect data
	var data = [];
	
	let rows = document.getElementsByClassName('hidden-id');
	for (var i=0; i < rows.length; i++ )
	{
		let el = rows.item(i);
		id = el.value;
		let shorttext = document.getElementById('short-' + id).value;
		let explanation = document.getElementById('explanation-' + id).value;
		let timeval = document.getElementById('time-' + id).value;
		let visible = document.getElementById('visible-' + id).checked;
		
		if (visible) {
			let tmp = {
				"id" : id,
				
		}
		
		console.log('short: ' + shorttext + ' visible: ' + visible);
	}
	
	return;
	
	
	
	// post data
	post_ajax(
		str_uri + '/rest/workareas/update.php',
		data,
		(data) => {
			set_info('Arbeitsbereiche wurden gespeichert!');
			console.log('success: ' + data);
			selected_app = 'workareas';
			build_gui();
			
		},
		(data) => {
			set_error('Es gab einen Fehler beim Ändern des Passworts!');
		}
	);
}
*/
	
function update_password(e) {
	e = e || window.event;
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	
	reset_messages();
	
	if ( document.getElementById('password_change').value !== document.getElementById('password_change2').value ) {
		set_error('Passwörter stimmen nicht überein!');
		return;
	}
	
	let data = {
		"newpassword" : document.getElementById('password_change').value
	};
	
	post_ajax(
		str_uri + '/rest/auth/pwchange.php',
		data,
		(data) => {
			set_info('Passwort wurde geändert');
			console.log('success: ' + data);
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
		'username' : document.getElementById('username').value,
		'password' : document.getElementById('password').value
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
			if (arr.code === -1 ) {
				set_error('Login fehlgeschlagen');
				return;
			}
			
			localStorage.setItem('token', arr.token);
			
			if ( arr.isModerator === true ) localStorage.setItem('moderator', '1');
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
		if ( xhr.readyState === XMLHttpRequest.DONE ) {
			// request done
			if ( xhr.status === 200 ) {
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
	if (token !== '' ) {
		xhr.setRequestHeader('Authorization', token);
	}
	xhr.send(JSON.stringify(data));
}

function get_ajax(url, cb_success, cb_error) {
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = () => {
		// lambda
		if ( xhr.readyState === XMLHttpRequest.DONE ) {
			// request done
			if ( xhr.status === 200 ) {
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
	if (token !== '' ) {
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
	if ( is_token_set() ) {
		
		hide_login();
		
		if (is_moderator_set() ) show_moderator();
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
	if (token !== null ) {
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
  while(element.firstElementChild) {
     element.firstElementChild.remove();
  }
}