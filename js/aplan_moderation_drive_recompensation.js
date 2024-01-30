import {get_ajax, post_ajax} from './ajax.js';
import { build_gui } from './gui.js';
import { attach_handler, convertLocalDateStringToDatabaseString, convertDatabaseDateStringToLocalDateString } from './tools.js';

export function init_driverecompensations() {
	document.getElementById('moderation_drive_edit_user').addEventListener(
		'click', drive_edit_user);
	
}

function drive_edit_user() {

}

export function frm_moderation_driverecompensation() {
	window.selected_app = "dynamic_content";
	window.lock_line_id = 0;
	let data = "";
	get_ajax(
		'./html/moderation_driverecompensation.html',
		onLoadModuleSuccess,
		onError
	);

}

function hide_user_edit() {
	let newuser = document.getElementById('new_user_recompensation');
	let edituser = document.getElementById('edit_user_recompensation');
	newuser.style.display = "none";
	edituser.style.display = "none";
}

function show_user_edit() {
	let newuser = document.getElementById('new_user_recompensation');
	let edituser = document.getElementById('edit_user_recompensation');
	newuser.style.display = "block";
	edituser.style.display = "block";
}

function extract_id(str_with_id) {
	let arr_id = str_with_id.split('-');
	
	if (arr_id.length != 2 ) return -1;
	let myid = arr_id[1];
	return myid;
}


function onChangeValue_user(ev) {
	let userid = document.getElementById('user_list_recompensation').value;
	let myid = ev.target.id;

	let arr_id = myid.split('-');
	
	if (arr_id.length != 2 ) return;
	myid = arr_id[1];

	let start = document.getElementById(`Start-${myid}`).value;
	start = convertLocalDateStringToDatabaseString(start);
	let end = document.getElementById(`End-${myid}`).value;
	end = convertLocalDateStringToDatabaseString(end);
	let value = document.getElementById(`Value-${myid}`).value;

	let data = {
		"id" : userid,
		"idDrive": arr_id[1],
		"startdate" : start,
		"enddate" : end,
		"val" : value
	};
	let myval = ev.target.value;
	let str = JSON.stringify(data);
	lock_user_input_line(myid);
	post_ajax(
		`${window.str_uri}/rest/moderation/drive/update.php`,
		data,
		onUpdateSuccess,
		(err) => {
			unlock_user_input_line(myid);
			onError(err);
		}
	);

}

function onUpdateSuccess(response) {
	unlock_user_input_line();
}

function lock_user_input_line(id) {
	window.lock_line_id = id;
	let start = document.getElementById(`Start-${id}`);
	let end = document.getElementById(`End-${id}`);
	let value = document.getElementById(`Value-${id}`);
	let delete_id = document.getElementById(`Delete-${id}`);

	start.disabled = true;
	end.disabled = true;
	value.disabled = true;
	delete_id.disable = true;
	
}

function unlock_user_input_line(pId) {

	let id = 0;

	if (pId === undefined ) id = window.lock_line_id;
	else id = pId;

	let start = document.getElementById(`Start-${id}`);
	let end = document.getElementById(`End-${id}`);
	let value = document.getElementById(`Value-${id}`);
	let delete_id = document.getElementById(`Delete-${id}`);

	start.disabled = false;
	end.disabled = false;
	value.disabled = false;
	delete_id.disabled = false;
	
}

function onClick_select_user() {
	let sel = document.getElementById('user_list_recompensation');
	let userid = sel.value;
	freeze_user_select();
	let data = { "id" : userid };
	post_ajax(
		`${window.str_uri}/rest/moderation/drive/read.php`,
		data,
		onLoadUserDataSuccess,
		onError
	);
}

function onLoadUserDataSuccess(response) {
	show_user_edit();

	let all_data = JSON.parse(response);
	let data = all_data.driverecompensation;

	let table = document.getElementById('table_body');

	while (table.firstChild) {
		table.removeChild( table.firstChild );
	}

	for (let i = 0; i < data.length; i++ ) {
		let idDrive = data[i].idDrive;
		let row = document.createElement('tr');
		row.id = `Row-${idDrive}`;

		let colStart = document.createElement('td');
		let inputStart = document.createElement('input');
		inputStart.id = `Start-${idDrive}`;
		inputStart.value = convertDatabaseDateStringToLocalDateString( data[i].startdate );
		inputStart.addEventListener('blur', (event) => {
			onChangeValue_user(event);
		} );
		colStart.appendChild(inputStart);

		let colEnd = document.createElement('td');
		let inputEnd = document.createElement('input');
		inputEnd.id = `End-${idDrive}`
		inputEnd.value = convertDatabaseDateStringToLocalDateString( data[i].enddate );
		inputEnd.addEventListener('blur', (event) => {
			onChangeValue_user(event);
		});
		colEnd.appendChild(inputEnd);
	
		let colValue = document.createElement('td');
		let inputValue = document.createElement('input');
		inputValue.id = `Value-${idDrive}`;
		inputValue.value = data[i].value;
		inputValue.addEventListener('blur', (event) => {
			onChangeValue_user(event);
		});
		colValue.appendChild(inputValue);

		let colDelete = document.createElement('td');
		let btnDelete = document.createElement('button');
		btnDelete.addEventListener('click', (event) => { onClickBtnDelete(event); });
		btnDelete.innerHTML = 'X';
		btnDelete.id = `Delete-${idDrive}`;
		colDelete.appendChild(btnDelete);

		row.appendChild(colStart);
		row.appendChild(colEnd);
		row.appendChild(colValue);
		row.appendChild(colDelete);
		table.appendChild(row);
		
	}
	let btnNewSingle = document.getElementById('click_add_new');

	console.log(btnNewSingle);

	btnNewSingle.removeEventListener(
		'click', btn_add_new_single );
	
	btnNewSingle.addEventListener(
		'click', btn_add_new_single );

	unfreeze_user_select();
	let btnClose = document.getElementById('close_user');
	btnClose.addEventListener('click', (event) => closeUser(event) );

}

function closeUser(event)
{
	hide_user_edit();
}

function btn_add_new_single() {
	let s = document.getElementById('txt_new_start').value;
	let e = document.getElementById('txt_new_end').value;
	s = convertLocalDateStringToDatabaseString(s);
	e = convertLocalDateStringToDatabaseString(e);

	let data = {
		"id" : document.getElementById('user_list_recompensation').value,
		"startdate" : s,
		"enddate" : e,
		"val" : document.getElementById('txt_new_val').value.replace(',','.')
	};

	post_ajax(
		`${window.str_uri}/rest/moderation/drive/create.php`,
		data,
		(response) => {
			onClick_select_user();
		},
		(errorText) => { onError(errorText); }
	);

}


function onClickBtnDelete(event) {
	let id = extract_id(event.target.id);
	let userid = document.getElementById('user_list_recompensation').value;
	let data = {
		"userId" : userid,
		"idDrive" : id
	};

	lock_user_input_line(id);

	post_ajax(
		`${window.str_uri}/rest/moderation/drive/delete.php`,
		data,
		(response) => {
			unlock_user_input_line(id);
			let row = document.getElementById(`Row-${id}`);
			row.remove();
		},
		(errorText) => { onError(errorText); }
	);
}

function freeze_user_select() {
	let sel = document.getElementById('user_list_recompensation');
	let btn = document.getElementById('click_select_user');
	btn.disabled = true;
	sel.disabled = true;
}

function unfreeze_user_select() {
	let sel = document.getElementById('user_list_recompensation');
	let btn = document.getElementById('click_select_user');
	btn.disabled = false;
	sel.disabled = false;
}


function onLoadModuleSuccess(responseText) {
	let el = document.getElementById('dynamic_content');
	el.innerHTML = `${responseText}`;

	get_ajax(
		`${window.str_uri}/rest/moderation/users/list.php?orgacode=jbuero2020&page=1&nbritems=100`,
		fillList,
		onError
	);

	attach_handler('click_select_user', onClick_select_user);
	build_gui();
	hide_user_edit();
}

function onError(errorText) {
	document.getElementById('message_drive_recompensation').innerHTML = `<p class="error">${errorText}</p>`;
}

function fillList(responseText) {
	//document.getElementById('message_drive_recompensation').innerHTML = responseText;
	let sel = document.getElementById('user_list_recompensation');
	
	while (sel.firstChild ) {
		sel.removeChild( sel.firstChild );
	}

	let arrData = JSON.parse(responseText);
	for (let i = 0; i < arrData.length; i++ ) {
		let el = document.createElement('option');
		el.value = arrData[i].id
		el.innerHTML = arrData[i].displayname;
		sel.appendChild(el);
	}
}
