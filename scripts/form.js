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
  let selected = (localStorage.itemsselected) ? JSON.parse(localStorage.itemsselected) : [];
  /* replace tbody with new rows */
  if(e.detail.result){
    tbody.innerHTML = e.detail.result.results.map(result => `<tr>
      <td>
        <input type="checkbox" name="item" value="${result.id}" ${(selected.includes(result.id)) ? 'checked' : ''}/>
      </td>
      <td>${result.displayTitle}</td></tr>`).join('');
    let allchecked = ([...form.item].filter(item => !item.checked).length == 0) ?? true;
    form.selectall.checked = allchecked ? true : false;
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
  history.pushState(query, '', `?q=${JSON.stringify(query)}`)
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

const form_to_q = form => {
  let title = form.title.value;
  let author = form.author.value;
  let lang_arr = [...form.languages.options].filter(opt => opt.selected).map(opt => opt.value);

  let q = {};
  q.rows = form.rows.value;
  q.page = form.page.value;
  q.gesamtbibliographie = (form.gesamtbibliographie.checked) ? "true" : "false";
  if(title) q.title = title;
  if(author) q.author = author;
  if(lang_arr.length > 0) q.languages = lang_arr;
  return q;
};

/**
 * Perform a search
 * Collects data from the form in an object q.
 * 
 */
const search_submit = e => {
  e.preventDefault();
  e.target.page.value = 1;
  let q = form_to_q(e.target);
  search_api(q);
};

/**
 * Happens when on of the buttons in the form is clicked. Action is
 * based on the button name
 * @param {Event} form "submit"
 * @fires "searchitems" with detail.arr, an array of promises for
 * bib items.
 * @fires "resultitemschanged" with detail.action "clear". 
 */
const result_submit = e => {
  e.preventDefault();
  // let data = new FormData(e.target);
  let button = e.submitter; // button clicked
  switch(button.name){
    case 'bibtex':
      let selected = (localStorage.itemsselected) ? JSON.parse(localStorage.itemsselected) : [];
      let items = selected.map(value => get_item_api(value));
      Promise.all(items).then(arr => {
        let event = new CustomEvent('searchitems', {detail: arr});
        document.dispatchEvent(event);
      });
      break;
    case 'clear':
      
      let event = new CustomEvent('resultitemschanged', {detail: {action: 'clear'}});
      document.dispatchEvent(event);
      break;
  }
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
  let obj = {action: 'alter', items: [...items]};
  let event = new CustomEvent('resultitemschanged', {detail: obj});
  document.dispatchEvent(event);
};

/**
 * Update the page number in the search form and perform
 * a new search based on that.
 * @param {Event} "pagination" e.datail has the page number.
 */
const page_change = e => {
  document.forms.search.page.value = e.detail;
  let q = form_to_q(document.forms.search);
  search_api(q);
};

/**
 * Display the total number of items in the current search.
 * @param {Event} "searchresult"
 */
const display_stats = e => {
  let total_num = e.detail.result.numberOfResults;
  document.forms.result.total_num.value = total_num;
};

/**
 * Update localStorage "itemsselected" either by altering
 * with an array or clearing.
 * Call display_selected() to update the UI.
 * @param {Event} "resultitemschanged"
 */
const save_selected = e => {
  let action = e.detail.action;
  let old_ids = (localStorage.itemsselected) ? JSON.parse(localStorage.itemsselected) : [];
  let arr = [];
  switch(action){
    case 'alter':
      let selected_set = new Set(old_ids);
      e.detail.items.forEach(item => {
        if(item.checked){
          selected_set.add(item.value);
        }else{
          selected_set.delete(item.value);
        }
      });
      arr = [...selected_set.entries()].map(ent => ent[0]);
      break;
    case 'clear':
      arr = [];
      break;
  }
  localStorage.itemsselected = JSON.stringify(arr);
  display_selected();
};

/**
 * Based on the array in localStorage called "itemsselected"
 * set the number of selected and enable/disable buttons.
 */
const display_selected = () => {
  let selected = (localStorage.itemsselected) ? JSON.parse(localStorage.itemsselected) : [];
  document.forms.result.selected_num.value = selected.length;
  document.forms.result.bibtex.disabled = (!selected.length) ?? true;
  document.forms.result.clear.disabled = (!selected.length) ?? true;
  if(document.forms.result.item)
    [...document.forms.result.item]
      .filter(item => selected.includes(item.value))
      .forEach(item => item.checked = true);
};

document.addEventListener('DOMContentLoaded', e => {
  let params = new URLSearchParams(location.search);
  let q = JSON.parse(params.get('q'));
  if(q) display_search_form(q);
  
  display_selected();

  // form events
  document.forms.search.addEventListener('submit', search_submit);
  document.forms.result.addEventListener('submit', result_submit);
  document.forms.result.addEventListener('change', result_change);

  // custom events
  document.addEventListener('searchresult', display_search);
  document.addEventListener('searchresult', history_push);
  document.addEventListener('searchresult', display_stats);
  document.addEventListener('resultitemschanged', save_selected);
  document.addEventListener('pagination', page_change);
});