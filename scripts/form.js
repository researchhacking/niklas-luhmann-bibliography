
const display_search = e => {
  let table = document.getElementById('searchresult');
  if(e.detail.results){
    table.innerHTML = e.detail.results.map(result => `<tr><td>${result.displayTitle}</td></tr>`).join('');
  }
};

const search_api = obj => {
  fetch(`https://v0.api.niklas-luhmann-archiv.de/BIBL/search?q=${JSON.stringify(obj)}`)
    .then(res => res.json())
    .then(json => {
      let event = new CustomEvent('searchresult', {detail: json});
      document.dispatchEvent(event);
    });
};

const form_submit = e => {
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

document.addEventListener('DOMContentLoaded', e => {
  document.forms.search.addEventListener('submit', form_submit);

  document.addEventListener('searchresult', display_search);
});