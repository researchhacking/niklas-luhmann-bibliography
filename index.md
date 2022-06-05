---
layout: default
aside: about.html
scripts:
  - /scripts/app.js
  - /scripts/form.js
  - /scripts/pagination.js
  - /components/bibtex-export.js
---

<form name="search">
  <label>
    <span>Title: </span>
    <input name="title" type="text"/>
  </label>
  <label>
    <span>Author: </span>
    <input name="author" type="text"/>
  </label>
  <label>
    <span>Niklas-Luhmann-Bibliographie</span>
    <input name="gesamtbibliographie" type="checkbox" />
  </label>
  <label>
    <span>Language: </span>
    <select name="languages" multiple size="4">
      {% for lang in site.data.form.languages %}
        <option value="{{ lang.key }}" >{{ lang.name }}</option>
      {% endfor %}
    </select>
  </label>
  <label>
    <button name="search">Search</button>
  </label>
  <input name="rows" type="range" value="50" class="nodisplay" />
  <input name="page" type="range" value="1" class="nodisplay" />
</form>
<form name="result">
  <fieldset name="aside">
    <ul class="stats">
      <li>Total: <output name="total_num"/></li>
      <li>Selected: <output name="selected_num"/></li>
    </ul>
    <menu>
      <li><button name="bibtex">Export Bibtex</button></li>  
      <li><button name="clear">Clear selected</button></li>  
    </menu>
  </fieldset>
  <fieldset name="table">
    <div class="pagination"></div>
    <table id="searchresult">
      <thead>
        <tr>
          <th><input type="checkbox" name="selectall" /></th>
          <th>Literature</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  </fieldset>
</form>
<bibtex-export></bibtex-export>