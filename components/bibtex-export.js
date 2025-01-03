---
---

customElements.define("bibtex-export", class extends HTMLElement {
  type_map = new Map([
    ['journalArticle', 'article'],
    ['bookSection', 'inbook']
  ]);

  monogr_keys = {
  'article': [
    ['journalIssue','issue'],
    ['citedRange','pages'],
    ['title','journal'],
    ['volume','volume']],
  'inbook': [
    ['citedRange','pages'],
    ['title','booktitle'],
    ['editors','editor']
  ]};

  exclude_keys = ['notes', 'display', 'WerkID', 'type',
  'title_alt', 'id', 'imprint-notes', 'sortKey', 'status', 'authorsHTML',
  'editorsHTML', 'isGesamtbibliographie', 'isReadyForPublication',
  'relatedItems'];

  func_map = new Map();

  constructor(){
    super();
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.innerHTML = `{% include_relative bibtex-export.css %}`;

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    // wrapper.classList.add('show');
    wrapper.innerHTML = `<menu>
        <li><a href="close">
        <svg class="close" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill="white" fill-rule="evenodd" d="M 1 1 Q 10 -1 19 1 Q 21 10 19 19 Q 10 21 1 19 Q -1 10 1 1 M 4 2 L 10 7 L 16 2 Q 17 2 18 4 L 13 10 L 18 16 Q 17 18 16 18 L 10 13 L 4 18 Q 2 17 2 16 L 7 10 L 2 4 Q 2 3 4 2"/>
        </svg>
        </a></li>
      </menu>
      <textarea></textarea>`;
    
    this.shadowRoot.append(style, wrapper);

    this.itemlist = [];

    this.menu_click = this.menu_click.bind(this);
    this.render = this.render.bind(this);
    this.item_to_bibtex = this.item_to_bibtex.bind(this);
    this.names_to_bibtex = this.names_to_bibtex.bind(this);


    this.func_map.set('authors', this.names_to_bibtex);
    this.func_map.set('editors', this.names_to_bibtex);

    this.func_map.set('monogr', (obj, key, type) => {
      let keys = this.monogr_keys[type].filter(arr => obj[arr[0]] !== null);

      let value = keys.map(arr => {
        let key = arr[0];
        let val = (parseInt(obj[key])) ? obj[key] : `{${obj[key]}}`;
        return (this.func_map.has(key)) ? this.func_map.get(key)(obj[key], key) : `${arr[1]} = ${val}`;
      }).join(",\n  ");
      return value;
    });

    this.func_map.set('ptrs', arr => {
      let value = arr
        .filter(rel => rel.type == 'ZK')
        .map(rel => `${rel.n} ${rel.target}`).join("\n\n");
      return `note = "${value}"`;
    });

    this.func_map.set('imprint', obj => {
      let keys = [['pubPlace','city'],['publisher','publisher']]
        .filter(arr => obj[arr[0]] !== null);

      let value = keys.map(arr => {
        return `${arr[1]} = "${obj[arr[0]]}"`;
      }).join(",\n  ");
      return value;
    });

    this.func_map.set('series', arr => {
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

    this.func_map.set('dateKey', str => {
      // TODO: look out for date strings
      return `year = {${str}}`;
    });

    this.func_map.set('citedRange', str => {
      return `pages = {${str.replace(/\-{1,2}/, '--')}}`;
    });
  }

  connectedCallback(){
    this.shadowRoot.querySelector('menu').addEventListener('click', this.menu_click);
  }

  static get observedAttributes() { return ['show']; }

  attributeChangedCallback(name, oldValue, newValue) {
    let wrapper = this.shadowRoot.querySelector('div.wrapper');
    if(name == 'show') {
      if(newValue == 'true'){
        wrapper.classList.add('show');
      }
      else{
        wrapper.classList.remove('show');
      }
    }
  }

  set list(arr) {
    this.itemlist = arr;
    this.render();
  }

  get list(){
    return this.itemlist;
  }

  render(){
    let str = this.itemlist.map(this.item_to_bibtex).join("\n\n");
    this.shadowRoot.querySelector('textarea').value = str;
  }

  menu_click(e){
    e.preventDefault();
    let a = e.target.closest('a');
    switch(a.attributes['href'].value){
      case 'close':
        this.shadowRoot.querySelector('.wrapper').classList.remove('show');
        break;
    }
  }

  show(){
    this.shadowRoot.querySelector('.wrapper').classList.add('show');
  }

  names_to_bibtex = (arr, key) => {
    let keys = new Map([['authors','author'],['editors','editor']]);
    let value = arr.map(author => `${author.surname}, ${author.forename}`).join(' and ');
    return `${keys.get(key)} = {${value}}`;
  };

  item_to_bibtex(obj){
    let type = (this.type_map.has(obj.type)) ? (this.type_map.get(obj.type)) : obj.type;
    let keys = Object.keys(obj)
      .filter(key => !this.exclude_keys.includes(key))
      .filter(key => obj[key] !== null)
      .filter(key => obj[key].length !== 0);
    let values = keys.map(key => {
      return (this.func_map.has(key)) ? this.func_map.get(key)(obj[key], key, type) : `${key.toLowerCase()} = "${obj[key]}"`;
    }).join(",\n  ");
    return `@${type}{${obj.id},\n  ${values}\n}`;
  }
});