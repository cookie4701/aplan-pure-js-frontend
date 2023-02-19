import { is_token_set, is_moderator_set } from "./auth.js";

export function set_error(str_warning) {
  let el = document.getElementById('messages');
  el.innerHTML = str_warning;
  el.setAttribute('class', 'bar error');
}

export function set_info(str_info) {
  let el = document.getElementById('messages');
  el.innerHTML = str_info;
  el.setAttribute('class', 'bar info');
}

export function hide_everything() {
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

export function hide_div_by_id(id) {
  var x = document.getElementById(id);
  x.style.display = "none";
}

export function show_div_by_id(id) {
  var x = document.getElementById(id);
  x.style.display = "block";
}


export function build_gui() {
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

// display functions
export function show_only_selected_app() {
  // hide everything
  hide_everything();

  // show selected app
  if (window.selected_app !== '') show_div_by_id(window.selected_app);
}

function hide_moderator() {
  hide_by_class('moderator');
}

export function show_app_pwchange() {
  selected_app = 'pwchange';
  build_gui();
}
