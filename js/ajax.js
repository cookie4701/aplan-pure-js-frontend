// ajax helper functions
export function post_ajax(url, data, cb_success, cb_error) {
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

export function get_ajax(url, cb_success, cb_error) {
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
