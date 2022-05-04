---
layout: default
aside: about.html
scripts:
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

<table id="searchresult"></table>