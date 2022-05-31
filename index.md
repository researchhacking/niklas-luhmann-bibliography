---
layout: default
aside: about.html
scripts:
  - /scripts/app.js
  - /scripts/form.js
  - /scripts/bibtex.js
  - /scripts/pagination.js
---

<form name="search">
  <label>
    <span>Title: </span>
    <input name="title"/>
  </label>
  <label>
    <span>Author: </span>
    <input name="author"/>
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
  <button name="bibtex">Bibtex</button>
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
</form>