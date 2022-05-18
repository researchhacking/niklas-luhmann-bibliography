const type_map = new Map([
    ['journalArticle', 'article']
  ]);

const exclude_keys = ['notes', 'display', 'WerkID', 'type', 'ptrs',
  'title_alt', 'id', 'imprint-notes', 'sortKey', 'status', 'authorsHTML',
  'editorsHTML', 'isGesamtbibliographie', 'isReadyForPublication',
  'relatedItems'];

const func_map = new Map();

const names_to_bibtex = (arr, key) => {
  let keys = new Map([['authors','author'],['editors','editor']]);
  let value = arr.map(author => {
    let arr = author.replace(/\n/g, ' ').replace(/\t/g, '').split(' ');
    let surname = arr.slice(-1).join('');
    let firstname = arr.slice(0,-1).join('');
    return `${surname}, ${firstname}`;
  }).join(' and ');
  return `${keys.get(key)} = {${value}}`;
};

func_map.set('authors', names_to_bibtex);
func_map.set('editors', names_to_bibtex);

func_map.set('monogr', obj => {
  let keys = [
    ['journalIssue','issue'],
    ['citedRange','pages'],
    ['title','journal'],
    ['volume','volume']
  ].filter(arr => obj[arr[0]] !== null);
    
  let value = keys.map(arr => {
    return `${arr[1]} = {${obj[arr[0]]}}`;
  }).join(",\n  ");
  return value;
});

func_map.set('imprint', obj => {
  let keys = [['pubPlace','city'],['publisher','publisher']]
    .filter(arr => obj[arr[0]] !== null);

  let value = keys.map(arr => {
    return `${arr[1]} = {${obj[arr[0]]}}`;
  }).join(",\n  ");
  return value;
});

func_map.set('series', arr => {
  // let keys = ["target", "subtitle", "title", "biblScopeVolume"];
  // TODO: "series" is apparently an array of series
  // are there any situations where there is more than one?
  let keys = [["title","series"]];
  
  let value = arr.map(obj => {
    return keys.map(arr => {
      return `${arr[1]} = {${obj[arr[0]]}}`;
    }).join(",\n  ");    
  }).join(",\n  ");

  return value;
});

func_map.set('dateKey', str => {
  // TODO: look out for date strings
  return `year = {${str}}`;
});

/**
 * Turns a bib object into a bibtex string
 * @param {Object} bib item
 * @returns {String} bib item as a bibtex string
 */
const item_to_bibtex = obj => {
  let type = (type_map.has(obj.type)) ? (type_map.get(obj.type)) : obj.type;
  let keys = Object.keys(obj)
    .filter(key => !exclude_keys.includes(key))
    .filter(key => obj[key] !== null)
    .filter(key => obj[key].length !== 0);
  let values = keys.map(key => {
    return (func_map.has(key)) ? func_map.get(key)(obj[key], key) : `${key.toLowerCase()} = {${obj[key]}}`;
  }).join(",\n  ");
  return `@${type}{${obj.id},\n  ${values}\n}`;
};

/**
 * Based on the array of bib items, insert an anchor element
 * and tricker the click event and download bib items as bibtex
 * @param {Event} with details.arr, an array of bib items. 
 */
const download_bibtex = e => {
  let items = e.detail;
  let str = items.map(item_to_bibtex).join("\n\n");
  console.log(str);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = url.split('/').pop()
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
};


document.addEventListener('DOMContentLoaded', e => {
  // custom events
  document.addEventListener('searchitems', download_bibtex);
});