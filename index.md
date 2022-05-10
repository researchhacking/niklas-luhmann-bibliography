---
layout: default
aside: about.html
scripts:
  - /scripts/app.js
  - /scripts/form.js
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
    <span>Language: </span>
    <select name="langs" multiple size="4">
        <!-- <option value=""></option> -->
        {% for lang in site.data.form.languages %}
          <option value="{{ lang.key }}" >{{ lang.name }}</option>
        {% endfor %}
    </select>
  </label>
  <label>
    <button>Search</button>
  </label>
</form>
<form name="result">
  <button>Bibtex</button>
  <table id="searchresult">
    <thead>
      <tr>
        <th><input type="checkbox" name="selectall" /></th>
        <th>Literature</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><input type="checkbox" name="item" value="1" /></td><td>test</td></tr>
      <tr><td><input type="checkbox" name="item" value="2" /></td><td>test</td></tr>
      <tr><td><input type="checkbox" name="item" value="3" /></td><td>test</td></tr>
      <tr><td><input type="checkbox" name="item" value="4" /></td><td>test</td></tr>
    </tbody>
  </table>
</form>