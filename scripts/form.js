const api_url = 'https://v0.api.niklas-luhmann-archiv.de/BIBL';

const display_search = e => {
  let tbody = document.querySelector('#searchresult tbody');
  if(e.detail.results){
    tbody.innerHTML = e.detail.results.map(result => `<tr><td><input type="checkbox" name="item" value="${result.id}"/></td><td>${result.displayTitle}</td></tr>`).join('');
  }
};

const search_api = obj => {
  fetch(`${api_url}/search?q=${JSON.stringify(obj)}`)
    .then(res => res.json())
    .then(json => {
      let event = new CustomEvent('searchresult', {detail: json});
      document.dispatchEvent(event);
    });
};

const get_item_api = id => {
  return fetch(`${api_url}/item/${id}`).then(res => res.json());
};

const search_submit = e => {
  e.preventDefault();
  let title = e.target.title.value;
  let author = e.target.author.value;
  let lang = [...e.target.langs.options].filter(opt => opt.selected).map(opt => opt.value);

  let q = {gesamtbibliographie:["false"],"rows":50};
  if(title) q.title = title;
  if(author) q.author = author;
  if(lang.length > 0) q.languages = lang;

  search_api(q);
};

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

const result_change = e => {  
  let items = e.target.form.item;
  switch(e.target.name){
    case 'selectall':
      let checked = e.target.checked;
      [...items].forEach(item => item.checked = checked);
      break;
    case 'item':
      let allchecked = ([...items].filter(item => !item.checked).length == 0) ?? true;
      e.target.form.selectall.checked = allchecked ? true : false;
      break;
  }
};

document.addEventListener('DOMContentLoaded', e => {
  // form events
  document.forms.search.addEventListener('submit', search_submit);
  document.forms.result.addEventListener('submit', result_submit);
  document.forms.result.addEventListener('change', result_change);

  // custom events
  document.addEventListener('searchresult', display_search);
});