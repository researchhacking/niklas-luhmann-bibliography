/**
 * Base URL for the API
 */
const api_url = 'https://v0.api.niklas-luhmann-archiv.de/BIBL';

/**
 * Update the table #searchresult
 * @param {Event} a custom event
 */
const display_search = e => {
  let tbody = document.querySelector('#searchresult tbody');
  /* reset the form */
  let form = tbody.closest('form');
  form.selectall.checked = false;
  /* replace tbody with new rows */
  if(e.detail.results){
    tbody.innerHTML = e.detail.result.results.map(result => `<tr><td><input type="checkbox" name="item" value="${result.id}"/></td><td>${result.displayTitle}</td></tr>`).join('');
  }
};

/**
 * Request a search on the API
 * @param {Object} The query object
 * @fires "searchresult" with details.query and details.result
 */
const search_api = obj => {
  fetch(`${api_url}/search?q=${JSON.stringify(obj)}`)
    .then(res => res.json())
    .then(json => {
      let eventdata = {query: obj, result: json};
      let event = new CustomEvent('searchresult', {detail: eventdata});
      document.dispatchEvent(event);
    });
};

/**
 * Request a bib item by its id.
 * @param {string} Id/key for a bib item
 * @returns {(Object|Promise)} with a bib item
 */
const get_item_api = id => {
  return fetch(`${api_url}/item/${id}`).then(res => res.json());
};

/**
 * Push new state to history.
 * @prams {Event} "searchresult". details.query is needed
 */
const history_push = e => {
  let query = e.detail.query;
  history.pushState(obj, '', `?q=${JSON.stringify(query)}`)
};

/**
 * Updates the search form with the data from an object
 * @param {Object} where keys refer to form fields
 */
const display_search_form = obj => {
  let form = document.forms.search;
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    switch(form[key].type){
      case 'range':
      case 'text':
        // value can be string or number.
        form[key].value = value;
        break;
      case 'select-multiple':
        // more checkboxes with the same name
        [...form[key].options].filter(opt => value.includes(opt.value)).forEach(opt => opt.selected = true);
        break;
      case 'checkbox':
        let val = (value == 'true') ? true : false;
        form[key].checked = val;
        break;
    }
  });
  search_api(obj);
};

/**
 * Perform a search
 * Collects data from the form in an object q.
 * 
 */
const search_submit = e => {
  e.preventDefault();
  let title = e.target.title.value;
  let author = e.target.author.value;
  let lang_arr = [...e.target.languages.options].filter(opt => opt.selected).map(opt => opt.value);

  let q = {};
  q.rows = e.target.rows.value;
  q.gesamtbibliographie = (e.target.gesamtbibliographie.checked) ? "true" : "false";
  if(title) q.title = title;
  if(author) q.author = author;
  if(lang_arr.length > 0) q.languages = lang_arr;
  search_api(q);
};

/**
 * @param {Event} form "submit"
 * @fires "searchitems" with details.arr, an array of promises for
 * bib items. 
 */
const result_submit = e => {
  e.preventDefault();
  let data = new FormData(e.target);
  let items = data.getAll('item').map(value => get_item_api(value));
  Promise.all(items).then(arr => {
    console.log(arr);
    let event = new CustomEvent('searchitems', {detail: arr});
    document.dispatchEvent(event);
  });
};

/**
 * Updates all the item checkboxes and the selectall checkbox
 * @prams {Event} form input "change"
 */
const result_change = e => {
  let form = e.target.form;
  /* e.target.form.item could either be a NodeList or just one Element.
  A iterable is needed. */
  let items = (form.item.length) ? form.item : [form.item];
  switch(e.target.name){
    case 'selectall':
      let checked = e.target.checked;
      [...items].forEach(item => item.checked = checked);
      break;
    case 'item':
      let allchecked = ([...items].filter(item => !item.checked).length == 0) ?? true;
      form.selectall.checked = allchecked ? true : false;
      break;
  }
};

document.addEventListener('DOMContentLoaded', e => {
  let params = new URLSearchParams(location.search);
  let q = JSON.parse(params.get('q'));
  if(q) display_search_form(q);

  // form events
  document.forms.search.addEventListener('submit', search_submit);
  document.forms.result.addEventListener('submit', result_submit);
  document.forms.result.addEventListener('change', result_change);

  // custom events
  document.addEventListener('searchresult', display_search);
  document.addEventListener('searchresult', history_push);
});